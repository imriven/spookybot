const environment = process.env.ENVIRONMENT || "development";
const config = require("../knexfile.js")[environment];
export default require("knex")(config);