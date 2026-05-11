import { randomUUID } from "crypto";
import config from "../config/appConfig.js";
import { isValidTimerInterval } from "../config/runtime-limits.js";
import { logInfo } from "../logger.js";
import {
  claimAnnouncementDelete,
  claimAnnouncementSend,
  listActiveAnnouncements,
  markAnnouncementEnded,
  markPendingAnnouncementEnded,
  markAnnouncementSent,
} from "../repositories/stream-live-announcement-repository.js";
import { getOrdinalNum, msToTime } from "../utils.js";

const STREAM_NOTIFICATION_CLAIM_TTL_MS = 5 * 60 * 1000;

export default class TimerManager {
  constructor({ contentService, discordClient, redisClient, state, twitchManager, twitchTargetService }) {
    this.contentService = contentService;
    this.discordClient = discordClient;
    this.redisClient = redisClient;
    this.state = state;
    this.twitchManager = twitchManager;
    this.twitchTargetService = twitchTargetService;
    this.apiClient = null;
    this.chatClient = null;
    this.backgroundIntervals = [];
    this.dynamicIntervals = new Map();
    this.instanceId = randomUUID();
  }

  getActiveTarget() {
    return this.twitchTargetService.getActiveTarget();
  }

  async start() {
    this.registerBackgroundJob("live-status", 300000, () => this.checkIfLive());
    this.registerBackgroundJob("streamers-live", 300000, () => this.syncStreamerNotifications());
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
    this.state.followers = null;
    this.state.numChatters = 0;
    this.state.numViewers = 0;
    this.state.isLive = false;
    await this.syncDynamicTimers();
    await this.syncStreamerNotifications();
    await this.checkIfLive();
  }

  async clearTwitchClients() {
    this.apiClient = null;
    this.chatClient = null;
    this.state.followers = null;
    this.state.numChatters = 0;
    this.state.numViewers = 0;
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

    const activeTarget = this.getActiveTarget();
    const stream = await this.executeWithApi("check-live", (client) =>
      client.streams.getStreamByUserId(activeTarget.channelId),
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
      .filter((timer) => isLive || !timer.liveOnly)
      .filter((timer) => {
        if (isValidTimerInterval(timer.intervalMs)) {
          return true;
        }

        console.warn(`[timer:skip-invalid] Skipping timer "${timer.name}" with interval ${timer.intervalMs}.`);
        return false;
      });

    timers.forEach((timer) => {
      this.registerDynamicInterval(timer.name, timer.intervalMs, async () => {
        logInfo("timer.fire", {
          name: timer.name,
          channel: timer.channel || this.getActiveTarget().username,
          intervalMs: timer.intervalMs,
          liveOnly: timer.liveOnly,
        });
        await this.twitchManager.say(timer.channel || this.getActiveTarget().username, timer.message);
      });
    });

    if (!isLive) {
      return;
    }

    this.registerDynamicInterval("fact", 4800000, async () => {
      const fact = this.contentService.getRandomFact();
      if (fact) {
        await this.twitchManager.say(this.getActiveTarget().username, fact);
      }
    });

    this.registerDynamicInterval("cvu", 3600000, async () => {
      const activeTarget = this.getActiveTarget();
      const currentChatters = await this.twitchManager.executeAsBotUser("chatters", (client) =>
        client.chat.getChattersPaginated(activeTarget.channelId).getAll(),
      );
      const currentViewersStream =
        stream
        || await this.executeWithApi("viewer-count", (client) =>
          client.streams.getStreamByUserId(activeTarget.channelId),
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
        activeTarget.username,
        `stream time: ${msToTime(streamTime)}, chatters: ${chatterCount} (${chatterDiff}) viewers: ${viewerCount} (${viewerDiff})`,
      );

      this.state.numChatters = chatterCount;
      this.state.numViewers = viewerCount;
    });
  }

  async syncStreamerNotifications() {
    if (!this.apiClient || !this.discordClient) {
      return;
    }

    const streamers = this.contentService.getEnabledStreamerNotifications();
    const trackedStreamersByName = new Map(
      streamers.map((streamer) => [streamer.twitchName.toLowerCase(), streamer]),
    );
    const streamerNames = [...trackedStreamersByName.keys()];
    const streams = streamerNames.length > 0
      ? await this.executeWithApi("streamer-notifications", (client) =>
        client.streams.getStreamsByUserNames(streamerNames),
      )
      : [];

    const nowStreaming = new Set();
    const staleBefore = new Date(Date.now() - STREAM_NOTIFICATION_CLAIM_TTL_MS);
    for (const stream of streams ?? []) {
      const streamName = (stream.userName ?? stream.userDisplayName ?? "").toLowerCase();
      if (!streamName) {
        continue;
      }

      nowStreaming.add(streamName);

      const streamer = trackedStreamersByName.get(streamName);
      if (!streamer?.discordChannelId || !streamer?.discordId) {
        continue;
      }

      const claimedAnnouncement = await claimAnnouncementSend({
        discordChannelId: streamer.discordChannelId,
        instanceId: this.instanceId,
        staleBefore,
        streamStartedAt: stream.startDate ?? new Date(),
        twitchName: streamer.twitchName,
        twitchStreamId: stream.id,
        twitchUserId: stream.userId ?? streamer.twitchId ?? null,
      });
      if (!claimedAnnouncement) {
        continue;
      }

      const channel = await this.discordClient.channels.fetch(streamer.discordChannelId);
      const message = await channel.send(
        `<@${streamer.discordId}> (${streamer.twitchName}) is live now streaming ${stream.gameName}. Check them out: https://twitch.tv/${streamer.twitchName}`,
      );
      await markAnnouncementSent({
        discordMessageId: message.id,
        instanceId: this.instanceId,
        twitchStreamId: stream.id,
      });
      logInfo("discord.live.announced", {
        twitchName: streamer.twitchName,
        twitchStreamId: stream.id,
        discordChannelId: streamer.discordChannelId,
        discordMessageId: message.id,
        gameName: stream.gameName,
      });
    }

    const activeAnnouncements = await listActiveAnnouncements();
    for (const announcement of activeAnnouncements) {
      const announcementName = announcement.twitchName?.toLowerCase();
      if (announcementName && nowStreaming.has(announcementName)) {
        continue;
      }

      if (!announcement.discordMessageId) {
        await markPendingAnnouncementEnded(announcement.twitchStreamId);
        logInfo("discord.live.discarded", {
          twitchName: announcement.twitchName,
          twitchStreamId: announcement.twitchStreamId,
        });
        continue;
      }

      const claimedAnnouncement = await claimAnnouncementDelete({
        instanceId: this.instanceId,
        staleBefore,
        twitchStreamId: announcement.twitchStreamId,
      });
      if (!claimedAnnouncement) {
        continue;
      }

      let discordMessageDeleted = false;
      try {
        const channel = await this.discordClient.channels.fetch(claimedAnnouncement.discordChannelId);
        const message = await channel.messages.fetch(claimedAnnouncement.discordMessageId);
        await message.delete();
        discordMessageDeleted = true;
      } catch (error) {
        console.error(`[streamer-notification:${claimedAnnouncement.twitchName}]`, error);
      }

      await markAnnouncementEnded({
        instanceId: this.instanceId,
        twitchStreamId: claimedAnnouncement.twitchStreamId,
      });
      logInfo("discord.live.ended", {
        twitchName: claimedAnnouncement.twitchName,
        twitchStreamId: claimedAnnouncement.twitchStreamId,
        discordChannelId: claimedAnnouncement.discordChannelId,
        discordMessageId: claimedAnnouncement.discordMessageId,
        discordMessageDeleted,
      });
    }
  }

  async syncFollowers() {
    if (!this.apiClient || !this.discordClient) {
      return;
    }

    const activeTarget = this.getActiveTarget();
    const fetchedFollowers = await this.twitchManager.executeAsBotUser("followers", async (client) => {
      const paginator = client.channels.getChannelFollowersPaginated(activeTarget.channelId);
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
    logInfo("discord.daily-exercise.posted", {
      channelId: config.discordChallengeChannelId,
      count: dailyExercises.length,
    });
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
    logInfo("discord.daily-tip.posted", {
      channelId: config.discordTipChannelId,
      tipId: tip.id,
      title: tip.title,
    });

    const nextIndex = tipIndex >= tips.length - 1 ? 0 : tipIndex + 1;
    await this.redisClient.set("tipCounter", nextIndex);
  }
}
