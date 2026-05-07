async function addColumnIfMissing(knex, tableName, columnName, addColumn) {
  const hasColumn = await knex.schema.hasColumn(tableName, columnName);
  if (!hasColumn) {
    await knex.schema.alterTable(tableName, addColumn);
  }
}

exports.up = async function up(knex) {
  const hasTwitchTokens = await knex.schema.hasTable("twitch_auth_tokens");
  if (!hasTwitchTokens) {
    await knex.schema.createTable("twitch_auth_tokens", (table) => {
      table.string("provider").primary();
      table.string("twitch_user_id").notNullable().unique();
      table.string("login").notNullable();
      table.string("display_name").notNullable();
      table.text("access_token").notNullable();
      table.text("refresh_token").notNullable();
      table.timestamp("expires_at");
      table.jsonb("scopes").notNullable().defaultTo("[]");
      table.string("token_type");
      table.timestamp("obtainment_timestamp");
      table.timestamp("last_refresh_at");
      table.text("last_refresh_error");
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasAppSettings = await knex.schema.hasTable("app_settings");
  if (!hasAppSettings) {
    await knex.schema.createTable("app_settings", (table) => {
      table.string("key").primary();
      table.text("value");
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasTimers = await knex.schema.hasTable("timers");
  if (!hasTimers) {
    await knex.schema.createTable("timers", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.text("message").notNullable();
      table.bigInteger("interval_ms").notNullable();
      table.string("channel").notNullable();
      table.boolean("enabled").notNullable().defaultTo(true);
      table.boolean("live_only").notNullable().defaultTo(true);
      table.integer("sort_order").notNullable().defaultTo(0);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasStreamerNotifications = await knex.schema.hasTable("streamer_notifications");
  if (!hasStreamerNotifications) {
    await knex.schema.createTable("streamer_notifications", (table) => {
      table.increments("id").primary();
      table.string("twitch_name").notNullable();
      table.string("twitch_id");
      table.string("discord_name");
      table.string("discord_id");
      table.string("discord_channel_id");
      table.boolean("enabled").notNullable().defaultTo(true);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasCustomShoutouts = await knex.schema.hasTable("custom_shoutouts");
  if (!hasCustomShoutouts) {
    await knex.schema.createTable("custom_shoutouts", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.text("message").notNullable();
      table.boolean("enabled").notNullable().defaultTo(true);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const contentTables = ["facts", "tips", "exercises"];
  for (const tableName of contentTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) {
      continue;
    }

    await addColumnIfMissing(knex, tableName, "enabled", (table) => {
      table.boolean("enabled").notNullable().defaultTo(true);
    });

    await addColumnIfMissing(knex, tableName, "sort_order", (table) => {
      table.integer("sort_order").notNullable().defaultTo(0);
    });

    await addColumnIfMissing(knex, tableName, "updated_at", (table) => {
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasLegacyCustomShoutouts = await knex.schema.hasTable("customShoutouts");
  if (hasLegacyCustomShoutouts) {
    const legacyRows = await knex("customShoutouts").select("*");
    const hasLegacyMessage = await knex.schema.hasColumn("customShoutouts", "message");
    const hasLegacyShoutout = await knex.schema.hasColumn("customShoutouts", "shoutout");
    const existingRows = await knex("custom_shoutouts").count("* as count").first();

    if (legacyRows.length > 0 && Number(existingRows?.count ?? 0) === 0) {
      const rows = legacyRows
        .map((row) => ({
          name: row.name,
          message: hasLegacyMessage ? row.message : row.shoutout,
          enabled: true,
        }))
        .filter((row) => row.name && row.message);

      if (rows.length > 0) {
        await knex("custom_shoutouts").insert(rows);
      }
    }
  }
};

exports.down = async function down(knex) {
  const contentTables = ["facts", "tips", "exercises"];
  for (const tableName of contentTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) {
      continue;
    }

    const hasUpdatedAt = await knex.schema.hasColumn(tableName, "updated_at");
    const hasSortOrder = await knex.schema.hasColumn(tableName, "sort_order");
    const hasEnabled = await knex.schema.hasColumn(tableName, "enabled");

    await knex.schema.alterTable(tableName, (table) => {
      if (hasUpdatedAt) {
        table.dropColumn("updated_at");
      }
      if (hasSortOrder) {
        table.dropColumn("sort_order");
      }
      if (hasEnabled) {
        table.dropColumn("enabled");
      }
    });
  }

  await knex.schema.dropTableIfExists("custom_shoutouts");
  await knex.schema.dropTableIfExists("streamer_notifications");
  await knex.schema.dropTableIfExists("timers");
  await knex.schema.dropTableIfExists("app_settings");
  await knex.schema.dropTableIfExists("twitch_auth_tokens");
};
