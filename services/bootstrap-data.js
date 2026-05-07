import db from "../config/dbConfig.js";

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
}
