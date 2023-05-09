import {setupTimers} from "./timers.js"
import DiscordClient from "./discord/utils.js"
import BotState from "./state.js";
import RedisClient from "./redis/utils.js"
import { NewTwitchClient, TwitchChatClient, refreshVipMods, getFollowers } from "./twitch/utils.js"
// import ZwiftClient from "./zwift/utils.js"

const state = new BotState()

const discordClient = await DiscordClient()
const twitchChatClient = await TwitchChatClient(state)
const newTwitchClient = await NewTwitchClient(state)
await refreshVipMods(newTwitchClient, state)
state.followers = await getFollowers(newTwitchClient)
const redisClient = await RedisClient()
// const zwiftClient = ZwiftClient()
setupTimers(twitchChatClient, discordClient, newTwitchClient, redisClient, state)
//zwiftClient, removed
