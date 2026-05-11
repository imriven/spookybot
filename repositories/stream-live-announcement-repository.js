import db from "../config/dbConfig.js";

const TABLE_NAME = "stream_live_announcements";

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    twitchStreamId: row.twitch_stream_id,
    twitchName: row.twitch_name,
    twitchUserId: row.twitch_user_id,
    discordChannelId: row.discord_channel_id,
    discordMessageId: row.discord_message_id,
    streamStartedAt: row.stream_started_at,
    announcedAt: row.announced_at,
  };
}

export async function claimAnnouncementSend({
  discordChannelId,
  instanceId,
  staleBefore,
  streamStartedAt,
  twitchName,
  twitchStreamId,
  twitchUserId,
}) {
  return db.transaction(async (trx) => {
    await trx(TABLE_NAME)
      .insert({
        twitch_stream_id: twitchStreamId,
        twitch_name: twitchName,
        twitch_user_id: twitchUserId ?? null,
        discord_channel_id: discordChannelId,
        stream_started_at: streamStartedAt,
      })
      .onConflict("twitch_stream_id")
      .ignore();

    const [claimedRow] = await trx(TABLE_NAME)
      .where({ twitch_stream_id: twitchStreamId })
      .whereNull("announced_at")
      .where((builder) => {
        builder
          .whereNull("send_claimed_at")
          .orWhere("send_claimed_at", "<", staleBefore);
      })
      .update({
        twitch_name: twitchName,
        twitch_user_id: twitchUserId ?? null,
        discord_channel_id: discordChannelId,
        stream_started_at: streamStartedAt,
        send_claimed_at: trx.fn.now(),
        send_claimed_by: instanceId,
        updated_at: trx.fn.now(),
      })
      .returning("*");

    return mapRow(claimedRow);
  });
}

export async function markAnnouncementSent({ discordMessageId, instanceId, twitchStreamId }) {
  await db(TABLE_NAME)
    .where({ twitch_stream_id: twitchStreamId, send_claimed_by: instanceId })
    .update({
      discord_message_id: discordMessageId,
      announced_at: db.fn.now(),
      send_claimed_at: null,
      send_claimed_by: null,
      updated_at: db.fn.now(),
    });
}

export async function listActiveAnnouncements() {
  const rows = await db(TABLE_NAME)
    .select("*")
    .orderBy("stream_started_at", "asc")
    .orderBy("twitch_stream_id", "asc");

  return rows.map(mapRow);
}

export async function claimAnnouncementDelete({ instanceId, staleBefore, twitchStreamId }) {
  const [claimedRow] = await db(TABLE_NAME)
    .where({ twitch_stream_id: twitchStreamId })
    .whereNotNull("announced_at")
    .where((builder) => {
      builder
        .whereNull("delete_claimed_at")
        .orWhere("delete_claimed_at", "<", staleBefore);
    })
    .update({
      delete_claimed_at: db.fn.now(),
      delete_claimed_by: instanceId,
      updated_at: db.fn.now(),
    })
    .returning("*");

  return mapRow(claimedRow);
}

export async function markAnnouncementEnded({
  instanceId,
  twitchStreamId,
}) {
  await db(TABLE_NAME)
    .where({ twitch_stream_id: twitchStreamId, delete_claimed_by: instanceId })
    .del();
}

export async function markPendingAnnouncementEnded(twitchStreamId) {
  await db(TABLE_NAME)
    .where({ twitch_stream_id: twitchStreamId })
    .whereNull("announced_at")
    .del();
}
