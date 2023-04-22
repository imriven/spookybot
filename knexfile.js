import config from "./config/appConfig"

export default environments = {
  development: {
    client: "pg",
    connection: config.dbConnectionString,
  
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./data/migrations",
    },
    seeds: {
      directory: "./data/seeds",
    },
    scripts: {
      server: "nodemon index.js",
    },
  },
  
 production: {
    client: "pg",
    connection: "",
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./data/migrations",
    },
    seeds: {
      directory: "./data/seeds",
    },
  },
} 