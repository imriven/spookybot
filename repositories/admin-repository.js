import db from "../config/dbConfig.js";

function orderBy(builder) {
  return builder.orderBy("sort_order", "asc").orderBy("id", "asc");
}

export async function listTimers() {
  return db("timers").orderBy("sort_order", "asc").orderBy("id", "asc");
}

export async function getTimerById(id) {
  return db("timers").where({ id }).first();
}

export async function listStreamerNotifications() {
  return db("streamer_notifications").orderBy("twitch_name", "asc").orderBy("id", "asc");
}

export async function getStreamerNotificationById(id) {
  return db("streamer_notifications").where({ id }).first();
}

export async function listCustomShoutouts() {
  return db("custom_shoutouts").orderBy("name", "asc").orderBy("id", "asc");
}

export async function getCustomShoutoutById(id) {
  return db("custom_shoutouts").where({ id }).first();
}

export async function listFacts() {
  return orderBy(db("facts").select("id", "content", "enabled", "sort_order", "updated_at"));
}

export async function getFactById(id) {
  return db("facts").where({ id }).first();
}

export async function listTips() {
  return orderBy(db("tips").select("id", "title", "content", "enabled", "sort_order", "updated_at"));
}

export async function getTipById(id) {
  return db("tips").where({ id }).first();
}

export async function listExercises() {
  return orderBy(db("exercises").select("id", "exercise", "enabled", "sort_order", "updated_at"));
}

export async function getExerciseById(id) {
  return db("exercises").where({ id }).first();
}

export async function listChatCommands() {
  return orderBy(
    db("chat_commands").select(
      "id",
      "name",
      "handler",
      "response",
      "description",
      "usage",
      "enabled",
      "listed",
      "requires_privilege",
      "sort_order",
      "updated_at",
    ),
  );
}

export async function getChatCommandById(id) {
  return db("chat_commands").where({ id }).first();
}

export async function getAppSetting(key) {
  const row = await db("app_settings").where({ key }).first();
  return row?.value ?? null;
}

export async function setAppSetting(key, value) {
  const payload = {
    key,
    value,
    updated_at: db.fn.now(),
  };

  return db("app_settings")
    .insert(payload)
    .onConflict("key")
    .merge({ value, updated_at: db.fn.now() })
    .returning("*");
}

export async function createTimer(timer) {
  return db("timers").insert(timer).returning("*");
}

export async function updateTimer(id, timer) {
  return db("timers").where({ id }).update({ ...timer, updated_at: db.fn.now() }).returning("*");
}

export async function deleteTimer(id) {
  return db("timers").where({ id }).del();
}

export async function createStreamerNotification(streamer) {
  return db("streamer_notifications").insert(streamer).returning("*");
}

export async function updateStreamerNotification(id, streamer) {
  return db("streamer_notifications").where({ id }).update({ ...streamer, updated_at: db.fn.now() }).returning("*");
}

export async function deleteStreamerNotification(id) {
  return db("streamer_notifications").where({ id }).del();
}

export async function createCustomShoutout(shoutout) {
  return db("custom_shoutouts").insert(shoutout).returning("*");
}

export async function updateCustomShoutout(id, shoutout) {
  return db("custom_shoutouts").where({ id }).update({ ...shoutout, updated_at: db.fn.now() }).returning("*");
}

export async function deleteCustomShoutout(id) {
  return db("custom_shoutouts").where({ id }).del();
}

export async function createFact(fact) {
  return db("facts").insert(fact).returning("*");
}

export async function updateFact(id, fact) {
  return db("facts").where({ id }).update({ ...fact, updated_at: db.fn.now() }).returning("*");
}

export async function deleteFact(id) {
  return db("facts").where({ id }).del();
}

export async function createTip(tip) {
  return db("tips").insert(tip).returning("*");
}

export async function updateTip(id, tip) {
  return db("tips").where({ id }).update({ ...tip, updated_at: db.fn.now() }).returning("*");
}

export async function deleteTip(id) {
  return db("tips").where({ id }).del();
}

export async function createExercise(exercise) {
  return db("exercises").insert(exercise).returning("*");
}

export async function updateExercise(id, exercise) {
  return db("exercises").where({ id }).update({ ...exercise, updated_at: db.fn.now() }).returning("*");
}

export async function deleteExercise(id) {
  return db("exercises").where({ id }).del();
}

export async function createChatCommand(command) {
  return db("chat_commands").insert(command).returning("*");
}

export async function updateChatCommand(id, command) {
  return db("chat_commands").where({ id }).update({ ...command, updated_at: db.fn.now() }).returning("*");
}

export async function deleteChatCommand(id) {
  return db("chat_commands").where({ id }).del();
}

export async function getDiagnosticsCounts() {
  const [timers, streamers, shoutouts, facts, tips, exercises, commands] = await Promise.all([
    db("timers").count("* as count").first(),
    db("streamer_notifications").count("* as count").first(),
    db("custom_shoutouts").count("* as count").first(),
    db("facts").count("* as count").first(),
    db("tips").count("* as count").first(),
    db("exercises").count("* as count").first(),
    db("chat_commands").count("* as count").first(),
  ]);

  return {
    timers: Number(timers?.count ?? 0),
    streamerNotifications: Number(streamers?.count ?? 0),
    customShoutouts: Number(shoutouts?.count ?? 0),
    facts: Number(facts?.count ?? 0),
    tips: Number(tips?.count ?? 0),
    exercises: Number(exercises?.count ?? 0),
    chatCommands: Number(commands?.count ?? 0),
  };
}
