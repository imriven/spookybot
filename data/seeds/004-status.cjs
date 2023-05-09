/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("status").del().then(function () {
    // Inserts seed entries
    return knex("status").insert([
      {
        numViewers: 0,
        numChatters: 0,
        configId: 1,
        zwiftActivityId: "",
        live: false
      }
    ]);
  });
};

