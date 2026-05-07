import { createClient } from "redis";
import config from "../config/appConfig.js";

export default async function RedisClient() {
  const redisUrl = config.redisFlyConnect || config.redisFlyConnectDev;
  if (!redisUrl) {
    console.warn("Redis URL is not set. Tip rotation persistence is disabled.");
    return null;
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
