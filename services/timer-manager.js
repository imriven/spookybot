import config from "../config/appConfig.js";
import { getOrdinalNum, msToTime } from "../utils.js";

export default class TimerManager {
  constructor({ contentService, discordClient, redisClient, state, twitchManager }) {
    this.contentService = contentService;
    this.discordClient = discordClient;
    this.redisClient = redisClient;
    this.state = state;
    this.twitchManager = twitchManager;
    this.apiClient = null;
    this.chatClient = null;
    this.backgroundIntervals = [];
    this.dynamicIntervals = new Map();
  }

  async start() {
    this.registerBackgroundJob("live-status", 300000, () => this.checkIfLive());
    this.registerBackgroundJob("streamers-live", 300000, () => this.syncStreamerNotifications());
    this.registerBackgroundJob("vip-mod-refresh", 3600000, () => this.refreshVipMods());
    this.registerBackgroundJob("daily-exercises", 3600000, () => this.postDailyExercises());
    this.registerBackgroundJob("follower-sync", 86400000, () => this.syncFollowers());
    this.registerBackgroundJob("daily-tips", 3600000, () => this.postDailyTip());
  }

  registerBackgroundJob(name, intervalMs, job) {
    const wrapped = async () => {
      try {
        await job();
      } catch (error) {
        console.error(`[timer:${name}]`, error);
      }
    };

    const interval = setInterval(wrapped, intervalMs);
    this.backgroundIntervals.push(interval);
  }

  async setTwitchClients({ apiClient, chatClient }) {
    this.apiClient = apiClient;
    this.chatClient = chatClient;
    await this.refreshVipMods();
    await this.syncDynamicTimers();
    await this.syncStreamerNotifications();
    await this.checkIfLive();
  }

  async clearTwitchClients() {
    this.apiClient = null;
    this.chatClient = null;
    this.state.isLive = false;
    this.clearDynamicIntervals();
  }

  async handleContentReload() {
    await this.contentService.reload();
    await this.syncDynamicTimers();
  }

  async executeWithApi(label, operation) {
    if (!this.apiClient) {
      return null;
    }

    return this.twitchManager.executeWithApi(label, operation);
  }

  async checkIfLive() {
    if (!this.apiClient) {
      return;
    }

    const stream = await this.executeWithApi("check-live", (client) =>
      client.streams.getStreamByUserId(config.twitchChannelId),
    );

    const isLive = Boolean(stream);
    if (isLive !== this.state.isLive) {
      this.state.isLive = isLive;
      await this.syncDynamicTimers(stream);
    }
  }

  clearDynamicIntervals() {
    for (const interval of this.dynamicIntervals.values()) {
      clearInterval(interval);
    }
    this.dynamicIntervals.clear();
    this.state.twitchTimers = {};
  }

  registerDynamicInterval(name, intervalMs, job) {
    const wrapped = async () => {
      try {
        await job();
      } catch (error) {
        console.error(`[dynamic-timer:${name}]`, error);
      }
    };

    const interval = setInterval(wrapped, intervalMs);
    this.dynamicIntervals.set(name, interval);
    this.state.setTwitchTimer(name, interval);
  }

  async syncDynamicTimers(stream = null) {
    this.clearDynamicIntervals();

    if (!this.chatClient || !this.apiClient) {
      return;
    }

    const isLive = this.state.isLive || Boolean(stream);
    const timers = this.contentService
      .getEnabledTimers()
      .filter((timer) => isLive || !timer.liveOnly);

    timers.forEach((timer) => {
      this.registerDynamicInterval(timer.name, timer.intervalMs, async () => {
        await this.twitchManager.say(timer.channel || config.twitchChannelUsername, timer.message);
      });
    });

    if (!isLive) {
      return;
    }

    this.registerDynamicInterval("fact", 4800000, async () => {
      const fact = this.contentService.getRandomFact();
      if (fact) {
        await this.twitchManager.say(config.twitchChannelUsername, fact);
      }
    });

    this.registerDynamicInterval("cvu", 3600000, async () => {
      const currentChatters = await this.executeWithApi("chatters", (client) =>
        client.chat.getChattersPaginated(config.twitchChannelId, this.twitchManager.getBotUserId()).getAll(),
      );
      const currentViewersStream =
        stream
        || await this.executeWithApi("viewer-count", (client) =>
          client.streams.getStreamByUserId(config.twitchChannelId),
        );

      if (!currentViewersStream) {
        return;
      }

      const chatterCount = currentChatters?.length ?? 0;
      const viewerCount = currentViewersStream.viewers ?? 0;
      const chatterDiff = chatterCount - this.state.numChatters;
      const viewerDiff = viewerCount - this.state.numViewers;
      const currentDate = new Date();
      const twitchTime = new Date(currentViewersStream.startDate ?? currentViewersStream.startedAt ?? currentViewersStream.started_at).getTime();
      const streamTime = Math.abs(currentDate.getTime() - twitchTime);

      await this.twitchManager.say(
        config.twitchChannelUsername,
        `stream time: ${msToTime(streamTime)}, chatters: ${chatterCount} (${chatterDiff}) viewers: ${viewerCount} (${viewerDiff})`,
      );

      this.state.numChatters = chatterCount;
      this.state.numViewers = viewerCount;
    });
  }

  async refreshVipMods() {
    if (!this.apiClient) {
      return;
    }

    const vips = await this.executeWithApi("get-vips", async (client) => {
      const paginator = await client.channels.getVipsPaginated(config.twitchChannelId);
      return paginator.getAll();
    });

    const mods = await this.executeWithApi("get-mods", async (client) => {
      const paginator = await client.moderation.getModeratorsPaginated(config.twitchChannelId);
      return paginator.getAll();
    });

    this.state.vips = (vips ?? []).map((vip) => vip.name ?? vip.userName).filter(Boolean);
    const modNames = (mods ?? []).map((mod) => mod.userName ?? mod.name).filter(Boolean);
    modNames.push(config.twitchChannelUsername);
    this.state.mods = [...new Set(modNames)];
  }

  async syncStreamerNotifications() {
    if (!this.apiClient || !this.discordClient) {
      return;
    }

    const streamers = this.contentService.getEnabledStreamerNotifications();
    if (streamers.length === 0) {
      return;
    }

    const streamerNames = streamers.map((streamer) => streamer.twitchName.toLowerCase());
    const streams = await this.executeWithApi("streamer-notifications", (client) =>
      client.streams.getStreamsByUserNames(streamerNames),
    );

    const nowStreaming = new Set();
    for (const stream of streams ?? []) {
      const streamName = (stream.userName ?? stream.userDisplayName ?? "").toLowerCase();
      if (!streamName) {
        continue;
      }

      nowStreaming.add(streamName);
      if (this.state.liveStreamers[streamName]) {
        continue;
      }

      const streamer = streamers.find((entry) => entry.twitchName.toLowerCase() === streamName);
      if (!streamer?.discordChannelId || !streamer?.discordId) {
        continue;
      }

      const channel = await this.discordClient.channels.fetch(streamer.discordChannelId);
      const message = await channel.send(
        `<@${streamer.discordId}> (${streamer.twitchName}) is live now streaming ${stream.gameName}. Check them out: https://twitch.tv/${streamer.twitchName}`,
      );
      this.state.addLiveStreamer(streamName, message.id);
    }

    for (const [streamerName, messageId] of Object.entries(this.state.liveStreamers)) {
      if (nowStreaming.has(streamerName)) {
        continue;
      }

      const streamer = streamers.find((entry) => entry.twitchName.toLowerCase() === streamerName);
      if (!streamer?.discordChannelId) {
        this.state.deleteLiveStreamer(streamerName);
        continue;
      }

      try {
        const channel = await this.discordClient.channels.fetch(streamer.discordChannelId);
        const message = await channel.messages.fetch(messageId);
        await message.delete();
      } catch (error) {
        console.error(`[streamer-notification:${streamerName}]`, error);
      }

      this.state.deleteLiveStreamer(streamerName);
    }
  }

  async syncFollowers() {
    if (!this.apiClient || !this.discordClient) {
      return;
    }

    const fetchedFollowers = await this.executeWithApi("followers", async (client) => {
      const paginator = await client.channels.getChannelFollowersPaginated(
        config.twitchChannelId,
        this.twitchManager.getBotUserId(),
      );
      const followers = await paginator.getAll();
      return followers.map((follower) => follower.userName ?? follower.name).filter(Boolean);
    });

    if (!fetchedFollowers) {
      return;
    }

    if (!this.state.followers) {
      this.state.followers = fetchedFollowers;
      return;
    }

    const previous = new Set(this.state.followers);
    const current = new Set(fetchedFollowers);
    const unfollows = [...previous].filter((follower) => !current.has(follower)).join(", ");
    const newFollows = [...current].filter((follower) => !previous.has(follower)).join(", ");

    if (!config.discordUnfollowsChannelId) {
      this.state.followers = fetchedFollowers;
      return;
    }

    const channel = await this.discordClient.channels.fetch(config.discordUnfollowsChannelId);
    if (unfollows) {
      await channel.send(`These folks just unfollowed: ${unfollows}`);
    }
    if (newFollows) {
      await channel.send(`These folks just followed: ${newFollows}`);
    }
    this.state.followers = fetchedFollowers;
  }

  async postDailyExercises() {
    if (!this.discordClient || !config.discordChallengeChannelId) {
      return;
    }

    const date = new Date();
    if (date.getUTCHours() !== 14) {
      return;
    }

    const dailyExercises = this.contentService.getRandomExercises(3);
    if (dailyExercises.length === 0) {
      return;
    }

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const channel = await this.discordClient.channels.fetch(config.discordChallengeChannelId);
    await channel.send(`
**${weekdays[date.getDay()]} ${months[date.getMonth()]} ${getOrdinalNum(date.getDate())}, ${date.getFullYear()}**
*1 - 5 sets*
${dailyExercises[0] ?? ""}
${dailyExercises[1] ?? ""}
*extra credit*
${dailyExercises[2] ?? ""}
    `);
  }

  async postDailyTip() {
    if (!this.discordClient || !this.redisClient || !config.discordTipChannelId) {
      return;
    }

    const date = new Date();
    if (date.getUTCHours() !== 14) {
      return;
    }

    const tips = this.contentService.getEnabledTips();
    if (tips.length === 0) {
      return;
    }

    const rawCounter = await this.redisClient.get("tipCounter");
    const tipIndex = Number.parseInt(rawCounter ?? "0", 10) || 0;
    const tip = tips[tipIndex] ?? tips[0];
    const channel = await this.discordClient.channels.fetch(config.discordTipChannelId);

    await channel.send(`
**${tip.title}**
${tip.content}
    `);

    const nextIndex = tipIndex >= tips.length - 1 ? 0 : tipIndex + 1;
    await this.redisClient.set("tipCounter", nextIndex);
  }
}
