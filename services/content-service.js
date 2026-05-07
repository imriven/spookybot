import * as adminRepository from "../repositories/admin-repository.js";

export default class ContentService {
  constructor() {
    this.cache = {
      timers: [],
      streamerNotifications: [],
      customShoutouts: [],
      customShoutoutMap: {},
      facts: [],
      tips: [],
      exercises: [],
      chatCommands: [],
      chatCommandMap: {},
    };
  }

  async reload() {
    const [timers, streamerNotifications, customShoutouts, facts, tips, exercises, chatCommands] =
      await Promise.all([
        adminRepository.listTimers(),
        adminRepository.listStreamerNotifications(),
        adminRepository.listCustomShoutouts(),
        adminRepository.listFacts(),
        adminRepository.listTips(),
        adminRepository.listExercises(),
        adminRepository.listChatCommands(),
      ]);

    this.cache = {
      timers: timers.map((timer) => ({
        id: timer.id,
        name: timer.name,
        message: timer.message,
        intervalMs: Number(timer.interval_ms),
        channel: timer.channel,
        enabled: Boolean(timer.enabled),
        liveOnly: Boolean(timer.live_only),
        sortOrder: timer.sort_order,
      })),
      streamerNotifications: streamerNotifications.map((streamer) => ({
        id: streamer.id,
        twitchName: streamer.twitch_name,
        twitchId: streamer.twitch_id,
        discordName: streamer.discord_name,
        discordId: streamer.discord_id,
        discordChannelId: streamer.discord_channel_id,
        enabled: Boolean(streamer.enabled),
      })),
      customShoutouts: customShoutouts.map((shoutout) => ({
        id: shoutout.id,
        name: shoutout.name,
        message: shoutout.message,
        enabled: Boolean(shoutout.enabled),
      })),
      customShoutoutMap: Object.fromEntries(
        customShoutouts
          .filter((shoutout) => shoutout.enabled)
          .map((shoutout) => [shoutout.name.toLowerCase(), shoutout.message]),
      ),
      facts: facts.map((fact) => ({
        id: fact.id,
        content: fact.content,
        enabled: Boolean(fact.enabled),
        sortOrder: fact.sort_order,
      })),
      tips: tips.map((tip) => ({
        id: tip.id,
        title: tip.title,
        content: tip.content,
        enabled: Boolean(tip.enabled),
        sortOrder: tip.sort_order,
      })),
      exercises: exercises.map((exercise) => ({
        id: exercise.id,
        exercise: exercise.exercise,
        enabled: Boolean(exercise.enabled),
        sortOrder: exercise.sort_order,
      })),
      chatCommands: chatCommands.map((command) => ({
        id: command.id,
        name: command.name,
        handler: command.handler,
        response: command.response,
        description: command.description,
        usage: command.usage,
        enabled: Boolean(command.enabled),
        listed: Boolean(command.listed),
        requiresPrivilege: Boolean(command.requires_privilege),
        sortOrder: command.sort_order,
      })),
    };

    this.cache.chatCommandMap = Object.fromEntries(
      this.cache.chatCommands
        .filter((command) => command.enabled)
        .map((command) => [command.name.toLowerCase(), command]),
    );

    return this.cache;
  }

  getAll() {
    return this.cache;
  }

  getEnabledTimers() {
    return this.cache.timers.filter((timer) => timer.enabled);
  }

  getEnabledStreamerNotifications() {
    return this.cache.streamerNotifications.filter((streamer) => streamer.enabled);
  }

  getEnabledCustomShoutoutMap() {
    return this.cache.customShoutoutMap;
  }

  getRandomFact() {
    const facts = this.cache.facts.filter((fact) => fact.enabled);
    if (facts.length === 0) {
      return null;
    }

    return facts[Math.floor(Math.random() * facts.length)].content;
  }

  getEnabledTips() {
    return this.cache.tips.filter((tip) => tip.enabled);
  }

  getEnabledChatCommand(name) {
    if (!name) {
      return null;
    }

    return this.cache.chatCommandMap[name.toLowerCase()] ?? null;
  }

  getListedChatCommands() {
    return this.cache.chatCommands.filter((command) => command.enabled && command.listed);
  }

  getChatCommands() {
    return this.cache.chatCommands;
  }

  getRandomExercises(count = 3) {
    const exercises = [...this.cache.exercises.filter((exercise) => exercise.enabled)];
    if (exercises.length <= count) {
      return exercises.map((exercise) => exercise.exercise);
    }

    const picked = [];
    while (picked.length < count) {
      const index = Math.floor(Math.random() * exercises.length);
      const [exercise] = exercises.splice(index, 1);
      picked.push(exercise.exercise);
    }

    return picked;
  }

  async getDiagnosticsCounts() {
    return adminRepository.getDiagnosticsCounts();
  }
}
