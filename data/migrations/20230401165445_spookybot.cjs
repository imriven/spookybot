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
        tbl.increments();
        tbl.string("name", 50);
        tbl.string("user", 128);
        tbl.integer("counter").unsigned();
      })
      .createTable("zwiftWorlds", (tbl) => {
        tbl.integer("id").primary().unique();
        tbl.string("name", 50);
        tbl.string("url", 300);
      })
  };
  
  exports.down = function (knex) {
    return knex.schema
      .dropTableIfExists("counters")
      .dropTableIfExists("exercises")
      .dropTableIfExists("tips")
      .dropTableIfExists("facts");
  };
  
