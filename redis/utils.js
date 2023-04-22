import Redis from "redis"
Redis.debug_mode = true;
import config from "../config/appConfig.js";

export default async function RedisClient() {
    const redisClient = Redis.createClient({
        url: config.redisFlyConnect,
        pingInterval: 120000,
    })
    redisClient.on('error', (err) => console.log('Redis Client Error', err))
    redisClient.on('reconnecting', () => console.log('Redis reconnecting'));
    await redisClient.connect()
    const setup = await redisClient.exists("tipCounter")
    if (!setup) {
        await redisClient.set("tipCounter", 0)
    }
    return redisClient
}