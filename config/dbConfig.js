import knex from "knex";
import knexfile from "../knexfile.js";

const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || "development";

export default knex(knexfile[environment] ?? knexfile.development);
