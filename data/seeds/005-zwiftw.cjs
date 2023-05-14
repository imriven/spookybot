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
        id: 1,
        name: "Watopia",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923298/Zwift/watopia_o9ekvf.jpg"
      },
      {
        id: 2,
        name: "Richmond",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923298/Zwift/richmond_fibqel.jpg"
      },
      {
        id: 3,
        name: "London",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923297/Zwift/london_abgbwj.jpg"
      },
      {
        id: 4,
        name: "New York",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923297/Zwift/newyork_hncoy1.jpg"
      },
      {
        id: 5,
        name: "Innsbruck",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923298/Zwift/watopia_o9ekvf.jpg"
      },
      {
        id: 7,
        name: "Yorkshire",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923298/Zwift/yorkshire_tkhe39.jpg"
      },
      {
        id: 9,
        name: "Makuri Islands",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923297/Zwift/makuri_bmmmcz.jpg"
      },
      {
        id: 10,
        name: "France",
        url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923297/Zwift/france_ljktss.jpg"
      },
      {
      id: 11,
      name: "Paris",
      url: "https://res.cloudinary.com/dyrhhf6i8/image/upload/v1676923297/Zwift/paris_yffojr.jpg"
    }
    ]);
  });
};

