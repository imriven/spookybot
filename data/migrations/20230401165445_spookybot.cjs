exports.up = function (knex) {
    return knex.schema
      .createTable("facts", (tbl) => {
        tbl.increments();
        tbl.string("content", 2000).notNullable();
      })
      .createTable("tips", (tbl) => {
        tbl.increments();
        tbl.string("title", 200);
        tbl.string("content", 2000); 
    })
      .createTable("exercises", (tbl) => {
        tbl.increments();
        tbl.string("exercise", 2000).notNullable();
      })
      .createTable("counters", (tbl) => {
        tbl.string("name", 50).primary().unique();
        tbl.string("user", 128);
        tbl.integer("counter").unsigned();
      })
      .createTable("zwiftWorlds", (tbl) => {
        tbl.integer("id").primary().unique().unsigned();
        tbl.string("name", 50);
        tbl.string("url", 300);
      })
      .createTable("followers", (tbl) => {
        tbl.string("userName", 50).primary().unique();
      })
      .createTable("mods", (tbl) => {
        tbl.string("userName", 50).primary().unique();
      })
      .createTable("vips", (tbl) => {
        tbl.string("userName", 50).primary().unique();
      })
      .createTable("status", (tbl) => {
        tbl.integer("configId").primary().unique().unsigned();
        tbl.integer("numViewers").unsigned();
        tbl.integer("numChatters").unsigned();
        tbl.string("zwiftActivityId", 50);
        tbl.boolean("live").defaultTo(false);
      })
      .createTable("liveTimers", (tbl) => {
        tbl.string("name").primary().unique();
        tbl.string("timerId", 50);
      })
      .createTable("customShoutouts", (tbl) => {
        tbl.string("name").primary().unique().notNullable();
        tbl.string("message", 300);
      })
  };
  
  exports.down = function (knex) {
    return knex.schema
      .dropTableIfExists("counters")
      .dropTableIfExists("exercises")
      .dropTableIfExists("tips")
      .dropTableIfExists("facts")
      .dropTableIfExists("zwiftWorlds")
      .dropTableIfExists("followers")
      .dropTableIfExists("mods")
      .dropTableIfExists("vips")
      .dropTableIfExists("status")
      .dropTableIfExists("liveTimers")
      .dropTableIfExists("customShoutouts");
  };
  
