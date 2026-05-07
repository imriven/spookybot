import http from "http";
import config from "./config/appConfig.js";
import DiscordClient from "./discord/utils.js";
import RedisClient from "./redis/utils.js";
import BotState from "./state.js";
import createAdminServer from "./admin/server.js";
import SessionStore from "./admin/session-store.js";
import { prepareDatabase } from "./services/bootstrap-data.js";
import ContentService from "./services/content-service.js";
import TimerManager from "./services/timer-manager.js";
import TwitchManager from "./services/twitch-manager.js";

await prepareDatabase();

const state = new BotState();
const sessionStore = new SessionStore();
const contentService = new ContentService();
await contentService.reload();

const discordClient = await DiscordClient();
const redisClient = await RedisClient();

let timerManager = null;
const twitchManager = new TwitchManager({
  contentService,
  state,
  onConnectionChange: async ({ apiClient, chatClient }) => {
    if (!timerManager) {
      return;
    }

    if (apiClient && chatClient) {
      await timerManager.setTwitchClients({ apiClient, chatClient });
      return;
    }

    await timerManager.clearTwitchClients();
  },
});

timerManager = new TimerManager({
  contentService,
  discordClient,
  redisClient,
  state,
  twitchManager,
});

await timerManager.start();
await twitchManager.initializeFromStoredToken();

const adminApp = createAdminServer({
  config,
  contentService,
  sessionStore,
  timerManager,
  twitchManager,
});

const server = http.createServer(adminApp);
server.listen(config.port, () => {
  console.log(`Admin server listening on port ${config.port}`);
});
