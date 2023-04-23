import {createClient} from "redis"
import config from "../config/appConfig.js";

export default async function RedisClient() {
    const redisClient = createClient({
        url: config.redisFlyConnectDev,
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