import config from "../config/appConfig.js";
import * as adminRepository from "../repositories/admin-repository.js";

const ACTIVE_TWITCH_TARGET_SETTING_KEY = "active_twitch_channel_id";

function normalizeSelector(selector) {
  return `${selector ?? ""}`.trim().toLowerCase();
}

function cloneTarget(target) {
  return target ? { ...target } : null;
}

export default class TwitchTargetService {
  constructor({
    defaultTargetKey = config.defaultTwitchTargetKey,
    targets = config.twitchTargets,
  } = {}) {
    this.targets = targets.map((target) => ({ ...target }));
    this.targetsByKey = new Map(this.targets.map((target) => [target.key.toLowerCase(), target]));
    this.targetsByChannelId = new Map(this.targets.map((target) => [String(target.channelId), target]));
    this.targetsByUsername = new Map(this.targets.map((target) => [target.username.toLowerCase(), target]));
    this.defaultTarget = this.targetsByKey.get(defaultTargetKey.toLowerCase()) ?? this.targets[0] ?? null;
    this.activeTargetKey = this.defaultTarget?.key ?? null;
  }

  async initialize() {
    const persistedTarget = await adminRepository.getAppSetting(ACTIVE_TWITCH_TARGET_SETTING_KEY);
    const resolvedTarget = this.resolveTarget(persistedTarget) ?? this.defaultTarget;

    if (!resolvedTarget) {
      throw new Error("No Twitch targets are configured.");
    }

    this.activeTargetKey = resolvedTarget.key;
    return cloneTarget(resolvedTarget);
  }

  listAvailableTargets() {
    return this.targets.map(cloneTarget);
  }

  resolveTarget(selector) {
    if (!selector) {
      return null;
    }

    if (typeof selector === "object" && selector.key) {
      return this.targetsByKey.get(normalizeSelector(selector.key)) ?? null;
    }

    const normalized = normalizeSelector(selector);
    return (
      this.targetsByKey.get(normalized)
      ?? this.targetsByChannelId.get(String(selector).trim())
      ?? this.targetsByUsername.get(normalized)
      ?? null
    );
  }

  getActiveTarget() {
    return cloneTarget(this.targetsByKey.get(normalizeSelector(this.activeTargetKey)) ?? this.defaultTarget);
  }

  setActiveTarget(selector) {
    const target = this.resolveTarget(selector);
    if (!target) {
      throw new Error(`Unknown Twitch target: ${selector}`);
    }

    this.activeTargetKey = target.key;
    return cloneTarget(target);
  }

  async persistActiveTarget(selector) {
    const target = this.resolveTarget(selector);
    if (!target) {
      throw new Error(`Unknown Twitch target: ${selector}`);
    }

    await adminRepository.setAppSetting(ACTIVE_TWITCH_TARGET_SETTING_KEY, target.channelId);
    return cloneTarget(target);
  }
}
