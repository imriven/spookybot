import path from "path";
import { fileURLToPath } from "url";
import config from "./config/appConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shared = {
  client: "pg",
  connection: config.dbConnectionString,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: path.join(__dirname, "data", "migrations"),
    extension: "cjs",
  },
};

export default {
  development: shared,
  production: shared,
};
