import db from "../config/dbConfig.js";
import config from "../config/appConfig.js";
import {
  DEFAULT_CUSTOM_SHOUTOUTS,
  DEFAULT_EXERCISES,
  DEFAULT_FACTS,
  DEFAULT_STREAMER_NOTIFICATIONS,
  DEFAULT_TIMERS,
  DEFAULT_TIPS,
} from "./default-data.js";

async function seedTimers() {
  const existing = await db("timers").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("timers").insert(
    DEFAULT_TIMERS.map((timer, index) => ({
      name: timer.name,
      message: timer.message,
      interval_ms: timer.intervalMs,
      channel: timer.channel || config.twitchChannelUsername,
      enabled: timer.enabled,
      live_only: timer.liveOnly,
      sort_order: index,
    })),
  );
}

async function seedStreamerNotifications() {
  const existing = await db("streamer_notifications").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("streamer_notifications").insert(
    DEFAULT_STREAMER_NOTIFICATIONS.map((streamer) => ({
      twitch_name: streamer.twitchName,
      twitch_id: streamer.twitchId || null,
      discord_name: streamer.discordName || null,
      discord_id: streamer.discordId || null,
      discord_channel_id: streamer.discordChannelId || null,
      enabled: true,
    })),
  );
}

async function seedCustomShoutouts() {
  const existing = await db("custom_shoutouts").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("custom_shoutouts").insert(
    Object.entries(DEFAULT_CUSTOM_SHOUTOUTS).map(([name, message]) => ({
      name,
      message,
      enabled: true,
    })),
  );
}

async function seedFacts() {
  const existing = await db("facts").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("facts").insert(
    DEFAULT_FACTS.map((content, index) => ({
      content,
      enabled: true,
      sort_order: index,
    })),
  );
}

async function seedTips() {
  const existing = await db("tips").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("tips").insert(
    DEFAULT_TIPS.map((tip, index) => ({
      title: tip.title,
      content: tip.tip,
      enabled: true,
      sort_order: index,
    })),
  );
}

async function seedExercises() {
  const existing = await db("exercises").count("* as count").first();
  if (Number(existing?.count ?? 0) > 0) {
    return;
  }

  await db("exercises").insert(
    DEFAULT_EXERCISES.map((exercise, index) => ({
      exercise,
      enabled: true,
      sort_order: index,
    })),
  );
}

async function ensureStatusRow() {
  const existing = await db("status").where({ configId: 1 }).first();
  if (!existing) {
    await db("status").insert({
      configId: 1,
      numViewers: 0,
      numChatters: 0,
      zwiftActivityId: "",
      live: false,
    });
  }
}

export async function prepareDatabase() {
  await db.migrate.latest();
  await ensureStatusRow();
  await Promise.all([
    seedTimers(),
    seedStreamerNotifications(),
    seedCustomShoutouts(),
    seedFacts(),
    seedTips(),
    seedExercises(),
  ]);
}
