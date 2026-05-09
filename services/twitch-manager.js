import axios from "axios";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import config from "../config/appConfig.js";
import { registerChatHandlers } from "../twitch/chat-commands.js";
import {
  clearRefreshError,
  getStoredToken,
  markRefreshError,
  saveToken,
  updateTokenFromRefresh,
} from "../repositories/twitch-token-repository.js";

function oauthTokenToTwurpleToken(tokenResponse) {
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresIn: tokenResponse.expires_in,
    obtainmentTimestamp: Date.now(),
    scope: tokenResponse.scope ?? [],
    tokenType: tokenResponse.token_type ?? "bearer",
  };
}

function storedTokenToTwurpleToken(storedToken) {
  const expiresAt = storedToken.expiresAt ? new Date(storedToken.expiresAt).getTime() : Date.now();
  const expiresIn = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

  return {
    accessToken: storedToken.accessToken,
    refreshToken: storedToken.refreshToken,
    expiresIn,
    obtainmentTimestamp: Date.now(),
    scope: storedToken.scopes ?? [],
    tokenType: storedToken.tokenType ?? "bearer",
  };
}

function isAuthFailure(error) {
  const message = `${error?.message ?? ""}`.toLowerCase();
  return (
    message.includes("invalid refresh token")
    || message.includes("invalid access token")
    || message.includes("unauthorized")
    || message.includes("401")
  );
}

function exposedError(message) {
  const error = new Error(message);
  error.expose = true;
  return error;
}

export default class TwitchManager {
  constructor({ contentService, state, twitchTargetService, onConnectionChange }) {
    this.contentService = contentService;
    this.state = state;
    this.twitchTargetService = twitchTargetService;
    this.onConnectionChange = onConnectionChange;
    this.apiClient = null;
    this.chatClient = null;
    this.authProvider = null;
    this.botUser = null;
    this.runtimeStatus = {
      kind: "not_connected",
      detail: "No saved Twitch token",
    };
  }

  getActiveTarget() {
    return this.twitchTargetService.getActiveTarget();
  }

  getBotUserId() {
    return this.botUser?.id ?? config.twitchBotId;
  }

  buildConnectedDetail(botLogin = this.botUser?.login) {
    const target = this.getActiveTarget();
    const channelLabel = target?.username ? ` in #${target.username}` : "";
    return `Connected as ${botLogin ?? config.twitchBotUsername}${channelLabel}`;
  }

  getAuthorizeUrl(state) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.twitchClientId,
      redirect_uri: config.twitchRedirectUri,
      scope: config.twitchRequiredScopes.join(" "),
      state,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
        params: {
          client_id: config.twitchClientId,
          client_secret: config.twitchClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: config.twitchRedirectUri,
        },
      });

      return response.data;
    } catch (error) {
      console.error("[twitch:oauth-token-exchange]", error);
      throw exposedError("Twitch login failed during token exchange.");
    }
  }

  async fetchAuthenticatedUser(accessToken) {
    try {
      const response = await axios.get("https://api.twitch.tv/helix/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": config.twitchClientId,
        },
      });

      return response.data?.data?.[0] ?? null;
    } catch (error) {
      console.error("[twitch:fetch-authenticated-user]", error);
      throw exposedError("Twitch login failed while validating the authenticated user.");
    }
  }

  async handleOAuthCallback(code) {
    if (!code) {
      throw exposedError("Missing OAuth code from Twitch.");
    }

    const rawToken = await this.exchangeCodeForToken(code);
    const user = await this.fetchAuthenticatedUser(rawToken.access_token);

    if (!user) {
      throw exposedError("Twitch did not return an authenticated user.");
    }

    if (user.id !== config.twitchBotId) {
      throw exposedError("Only the configured Twitch bot account can log in to this admin.");
    }

    const twurpleToken = oauthTokenToTwurpleToken(rawToken);
    await saveToken(user, twurpleToken);
    const initialized = await this.initializeFromStoredToken();
    if (!initialized) {
      throw exposedError("Twitch login succeeded, but the bot client failed to initialize. Check server logs.");
    }

    return user;
  }

  async initializeFromStoredToken() {
    const storedToken = await getStoredToken();
    if (!storedToken) {
      await this.disconnect();
      this.runtimeStatus = {
        kind: "not_connected",
        detail: "No saved Twitch token",
      };
      await this.notifyConnectionChange();
      return null;
    }

    if (!storedToken.accessToken || !storedToken.refreshToken) {
      await this.disconnect();
      this.runtimeStatus = {
        kind: "token_missing_or_expired",
        detail: "Saved Twitch token is incomplete.",
      };
      await this.notifyConnectionChange();
      return null;
    }

    const botUser = {
      id: storedToken.twitchUserId,
      login: storedToken.login,
      display_name: storedToken.displayName,
    };

    try {
      await this.disconnect();
      const authProvider = new RefreshingAuthProvider({
        clientId: config.twitchClientId,
        clientSecret: config.twitchClientSecret,
        onRefresh: async (_userId, newTokenData) => {
          await updateTokenFromRefresh(botUser, newTokenData);
          await clearRefreshError();
          this.runtimeStatus = {
            kind: "connected",
            detail: this.buildConnectedDetail(botUser.login),
          };
        },
      });

      const resolvedUserId = await authProvider.addUserForToken(
        storedTokenToTwurpleToken(storedToken),
        ["chat"],
      );
      if (resolvedUserId !== botUser.id) {
        throw exposedError("Stored Twitch token belongs to a different user than TWITCH_BOT_ID.");
      }

      const apiClient = new ApiClient({ authProvider });
      const chatClient = await this.connectChatClient(authProvider);

      this.authProvider = authProvider;
      this.apiClient = apiClient;
      this.chatClient = chatClient;
      this.botUser = botUser;
      this.runtimeStatus = {
        kind: "connected",
        detail: this.buildConnectedDetail(botUser.login),
      };
      await clearRefreshError();
      await this.notifyConnectionChange();

      return {
        apiClient,
        chatClient,
      };
    } catch (error) {
      await this.markAuthFailure(error);
      return null;
    }
  }

  createChatClient(authProvider) {
    const target = this.getActiveTarget();
    const chatClient = new ChatClient({
      authProvider,
      channels: [target.username],
    });

    registerChatHandlers(chatClient, {
      contentService: this.contentService,
      state: this.state,
      onTitleChange: async (title) => {
        if (!title) {
          throw new Error("Title cannot be empty.");
        }

        const activeTarget = this.getActiveTarget();
        await this.executeWithApi("change-title", (client) =>
          client.channels.updateChannelInfo(activeTarget.channelId, { title }),
        );
      },
    });

    return chatClient;
  }

  async connectChatClient(authProvider) {
    const chatClient = this.createChatClient(authProvider);
    await chatClient.connect();
    return chatClient;
  }

  async notifyConnectionChange() {
    if (this.onConnectionChange) {
      await this.onConnectionChange({
        apiClient: this.apiClient,
        chatClient: this.chatClient,
        runtimeStatus: this.runtimeStatus,
      });
    }
  }

  async disconnectChatClient() {
    if (!this.chatClient) {
      return;
    }

    try {
      if (typeof this.chatClient.quit === "function") {
        await this.chatClient.quit();
      } else if (typeof this.chatClient.disconnect === "function") {
        await this.chatClient.disconnect();
      }
    } catch (error) {
      console.error("[twitch:disconnect]", error);
    }

    this.chatClient = null;
  }

  async disconnect() {
    await this.disconnectChatClient();
    this.apiClient = null;
    this.authProvider = null;
  }

  async switchTarget(nextTarget) {
    const target = nextTarget ? this.twitchTargetService.setActiveTarget(nextTarget) : this.getActiveTarget();
    const storedToken = await getStoredToken();

    if (!storedToken) {
      this.runtimeStatus = {
        kind: "not_connected",
        detail: `No saved Twitch token. Active target set to #${target.username}.`,
      };
      await this.notifyConnectionChange();
      return {
        target,
        runtimeConnected: false,
      };
    }

    if (!this.authProvider || !this.apiClient || !this.botUser) {
      const initialized = await this.initializeFromStoredToken();
      if (!initialized) {
        throw exposedError(`Unable to connect Twitch runtime for #${target.username}.`);
      }

      return {
        target,
        runtimeConnected: true,
      };
    }

    await this.disconnectChatClient();

    try {
      const chatClient = await this.connectChatClient(this.authProvider);
      this.chatClient = chatClient;
      this.runtimeStatus = {
        kind: "connected",
        detail: this.buildConnectedDetail(),
      };
      await this.notifyConnectionChange();

      return {
        target,
        runtimeConnected: true,
      };
    } catch (error) {
      console.error("[twitch:switch-target]", error);
      if (isAuthFailure(error)) {
        await this.markAuthFailure(error);
      }
      throw exposedError(`Failed to switch Twitch chat to #${target.username}.`);
    }
  }

  async executeWithApi(label, operation) {
    if (!this.apiClient) {
      return null;
    }

    try {
      return await operation(this.apiClient);
    } catch (error) {
      console.error(`[twitch:${label}]`, error);
      if (isAuthFailure(error)) {
        await this.markAuthFailure(error);
      }
      throw error;
    }
  }

  async executeAsBotUser(label, operation) {
    if (!this.apiClient) {
      return null;
    }

    try {
      return await this.apiClient.asUser(this.getBotUserId(), operation);
    } catch (error) {
      console.error(`[twitch:${label}]`, error);
      if (isAuthFailure(error)) {
        await this.markAuthFailure(error);
      }
      throw error;
    }
  }

  async say(channel, message) {
    const resolvedChannel = message === undefined ? this.getActiveTarget()?.username : channel;
    const resolvedMessage = message === undefined ? channel : message;

    if (!this.chatClient || !resolvedMessage) {
      return;
    }

    try {
      await this.chatClient.say(resolvedChannel, resolvedMessage);
    } catch (error) {
      console.error("[twitch:say]", error);
      if (isAuthFailure(error)) {
        await this.markAuthFailure(error);
      }
      throw error;
    }
  }

  async markAuthFailure(error) {
    console.error("[twitch:auth-failure]", error);
    const message = "Token refresh failed. Reconnect the Twitch bot.";
    await markRefreshError(message);
    await this.disconnect();
    this.runtimeStatus = {
      kind: "refresh_failed",
      detail: message,
    };
    await this.notifyConnectionChange();
  }

  async getAuthStatus() {
    const storedToken = await getStoredToken();
    if (!storedToken) {
      return {
        kind: "not_connected",
        detail: "No saved Twitch token",
        currentLogin: null,
        displayName: null,
        expiresAt: null,
        lastRefreshAt: null,
        lastRefreshError: null,
      };
    }

    const expiresAt = storedToken.expiresAt ? new Date(storedToken.expiresAt) : null;
    const lastRefreshAt = storedToken.lastRefreshAt ? new Date(storedToken.lastRefreshAt) : null;
    const lastRefreshError = storedToken.lastRefreshError || null;

    let kind = this.runtimeStatus.kind;
    if (kind === "not_connected" && expiresAt && expiresAt.getTime() <= Date.now()) {
      kind = "token_missing_or_expired";
    }
    if (lastRefreshError) {
      kind = "refresh_failed";
    }
    if (this.apiClient && this.chatClient) {
      kind = "connected";
    }

    return {
      kind,
      detail: this.runtimeStatus.detail,
      currentLogin: storedToken.login,
      displayName: storedToken.displayName,
      expiresAt,
      lastRefreshAt,
      lastRefreshError,
    };
  }
}
