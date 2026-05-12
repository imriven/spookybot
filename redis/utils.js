import { createClient } from "redis";
import config from "../config/appConfig.js";

export default async function RedisClient() {
  const redisUrl = config.redisFlyConnect || config.redisFlyConnectDev;
  if (!redisUrl) {
    throw new Error("Redis URL is not set. Configure REDIS_FLY_CONNECT or REDIS_FLY_CONNECTD.");
  }

  const redisClient = createClient({
    url: redisUrl,
    pingInterval: 120000,
  });

  redisClient.on("error", (error) => console.log("Redis client error", error));
  redisClient.on("reconnecting", () => console.log("Redis reconnecting"));
  await redisClient.connect();

  const setup = await redisClient.exists("tipCounter");
  if (!setup) {
    await redisClient.set("tipCounter", 0);
  }

  return redisClient;
}
