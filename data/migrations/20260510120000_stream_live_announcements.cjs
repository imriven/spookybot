exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable("stream_live_announcements");
  if (hasTable) {
    return;
  }

  await knex.schema.createTable("stream_live_announcements", (table) => {
    table.string("twitch_stream_id").primary();
    table.string("twitch_name").notNullable();
    table.string("twitch_user_id");
    table.string("discord_channel_id").notNullable();
    table.string("discord_message_id");
    table.timestamp("stream_started_at").notNullable();
    table.timestamp("announced_at");
    table.timestamp("send_claimed_at");
    table.string("send_claimed_by");
    table.timestamp("delete_claimed_at");
    table.string("delete_claimed_by");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable("stream_live_announcements", (table) => {
    table.index(["twitch_name"], "stream_live_announcements_twitch_name_idx");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("stream_live_announcements");
};
