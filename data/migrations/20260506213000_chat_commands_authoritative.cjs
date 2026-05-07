const DEFAULT_CHAT_COMMANDS = [
  {
    name: "commands",
    handler: "list",
    response: null,
    description: "List the enabled chat commands that should be advertised in chat.",
    usage: "commands",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 0,
  },
  {
    name: "help",
    handler: "help",
    response: "@{user}, try commands, !spooky, !lurk, !discord, !podcast, !gamer, !hug <user>, !slap <user>, !so <user>, !counter, or help <command>.",
    description: "Show command help. If a command name is provided, show its description and usage.",
    usage: "help <command>",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 1,
  },
  {
    name: "!lurk",
    handler: "text",
    response: "@{user}, has entered the shadowy realm of the LURK, ever watching, ever present, but silent among the mists... Thank you for the support and LURK ON!",
    description: "Acknowledge a viewer going into lurk mode.",
    usage: "!lurk",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 10,
  },
  {
    name: "!discord",
    handler: "text",
    response: "@{user}, https://discord.gg/B4NGMMmh86",
    description: "Share the Discord invite link.",
    usage: "!discord",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 20,
  },
  {
    name: "!podcast",
    handler: "text",
    response: "@{user}, https://spotifyanchor-web.app.link/e/hlkZhLRHLAb6",
    description: "Share the podcast link.",
    usage: "!podcast",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 30,
  },
  {
    name: "!gamer",
    handler: "text",
    response: "@{user}, psn: imriven | switch: SW-1842-0535-8897 | steam: 1531719496",
    description: "Share platform gamer tags.",
    usage: "!gamer",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 40,
  },
  {
    name: "!dreewmods",
    handler: "text",
    response: "visit the t7g patreon for exclusive Tekken mods! https://www.patreon.com/T7G",
    description: "Promote the Tekken mod Patreon.",
    usage: "!dreewmods",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 50,
  },
  {
    name: "!tuesday",
    handler: "text",
    response: "welcome to Tekken Tuesday!!! Where it's Tuesday and there is Tekken and tequila, now please buy a lady a shot!",
    description: "Announce Tekken Tuesday.",
    usage: "!tuesday",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 60,
  },
  {
    name: "!warrior",
    handler: "text",
    response: "Welcome to Warrior Wednesday where we throw down with a fighting game!!!",
    description: "Announce Warrior Wednesday.",
    usage: "!warrior",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 70,
  },
  {
    name: "!throwback",
    handler: "text",
    response: "visit the t7g patreon for exclusive Tekken mods! https://www.patreon.com/T7G",
    description: "Share the throwback/Tekken mod promotion.",
    usage: "!throwback",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 80,
  },
  {
    name: "!thirsty",
    handler: "text",
    response: "welcome to Thirsty Thursday where we play anything from retro to next gen and I'm thirsty for a cocktail. Buy a lady a drink!",
    description: "Announce Thirsty Thursday.",
    usage: "!thirsty",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 90,
  },
  {
    name: "!friday",
    handler: "text",
    response: "Welcome in to Fiesty Friday. We have no agenda we vibe, we chill and hangout!",
    description: "Announce Friday stream vibes.",
    usage: "!friday",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 100,
  },
  {
    name: "!socials",
    handler: "text",
    response: "visit my linktree for my socials! https://linktr.ee/rockagoth",
    description: "Share the Linktree/social profile page.",
    usage: "!socials",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 110,
  },
  {
    name: "!spooky",
    handler: "random_fact",
    response: null,
    description: "Post a random spooky fact from the facts collection.",
    usage: "!spooky",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 120,
  },
  {
    name: "!slap",
    handler: "template",
    response: "{target} just got slapped by {user}",
    description: "Let a VIP or mod slap another user.",
    usage: "!slap <user>",
    enabled: true,
    listed: true,
    requires_privilege: true,
    sort_order: 130,
  },
  {
    name: "!so",
    handler: "shoutout_lookup",
    response: null,
    description: "Trigger a manual shoutout for a user with a custom override fallback.",
    usage: "!so <user>",
    enabled: true,
    listed: true,
    requires_privilege: true,
    sort_order: 140,
  },
  {
    name: "!name",
    handler: "text",
    response: "Hello @{user}, my name is SpookyBot! Boo!",
    description: "Introduce the bot.",
    usage: "!name",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 150,
  },
  {
    name: "!hug",
    handler: "template",
    response: "{target} just got hugged by {user}",
    description: "Hug another user in chat.",
    usage: "!hug <user>",
    enabled: true,
    listed: true,
    requires_privilege: false,
    sort_order: 160,
  },
  {
    name: "!counter",
    handler: "counter",
    response: null,
    description: "Create, inspect, increment, decrement, and delete in-memory counters.",
    usage: "!counter | !counter <name> | !counter <name> +5 | !counter <name> -2 | !counter <name> status | !counter <name> delete",
    enabled: true,
    listed: true,
    requires_privilege: true,
    sort_order: 170,
  },
  {
    name: "!title",
    handler: "title_update",
    response: null,
    description: "Update the live stream title from chat.",
    usage: "!title <new title>",
    enabled: true,
    listed: true,
    requires_privilege: true,
    sort_order: 180,
  },
];

exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable("chat_commands");
  if (!hasTable) {
    await knex.schema.createTable("chat_commands", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.string("handler").notNullable();
      table.text("response");
      table.text("description");
      table.text("usage");
      table.boolean("enabled").notNullable().defaultTo(true);
      table.boolean("listed").notNullable().defaultTo(true);
      table.boolean("requires_privilege").notNullable().defaultTo(false);
      table.integer("sort_order").notNullable().defaultTo(0);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const existing = await knex("chat_commands").count("* as count").first();
  if (Number(existing?.count ?? 0) === 0) {
    await knex("chat_commands").insert(DEFAULT_CHAT_COMMANDS);
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("chat_commands");
};
