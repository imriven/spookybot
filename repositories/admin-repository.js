import db from "../config/dbConfig.js";

function orderBy(builder) {
  return builder.orderBy("sort_order", "asc").orderBy("id", "asc");
}

export async function listTimers() {
  return db("timers").orderBy("sort_order", "asc").orderBy("id", "asc");
}

export async function listStreamerNotifications() {
  return db("streamer_notifications").orderBy("twitch_name", "asc").orderBy("id", "asc");
}

export async function listCustomShoutouts() {
  return db("custom_shoutouts").orderBy("name", "asc").orderBy("id", "asc");
}

export async function listFacts() {
  return orderBy(db("facts").select("id", "content", "enabled", "sort_order", "updated_at"));
}

export async function listTips() {
  return orderBy(db("tips").select("id", "title", "content", "enabled", "sort_order", "updated_at"));
}

export async function listExercises() {
  return orderBy(db("exercises").select("id", "exercise", "enabled", "sort_order", "updated_at"));
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

export async function getDiagnosticsCounts() {
  const [timers, streamers, shoutouts, facts, tips, exercises] = await Promise.all([
    db("timers").count("* as count").first(),
    db("streamer_notifications").count("* as count").first(),
    db("custom_shoutouts").count("* as count").first(),
    db("facts").count("* as count").first(),
    db("tips").count("* as count").first(),
    db("exercises").count("* as count").first(),
  ]);

  return {
    timers: Number(timers?.count ?? 0),
    streamerNotifications: Number(streamers?.count ?? 0),
    customShoutouts: Number(shoutouts?.count ?? 0),
    facts: Number(facts?.count ?? 0),
    tips: Number(tips?.count ?? 0),
    exercises: Number(exercises?.count ?? 0),
  };
}
