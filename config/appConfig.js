// config.js
import dotenv from "dotenv"
dotenv.config()

const config = {
    twitchChannelUsername: process.env.TWITCH_CHANNEL_USERNAME,
    twitchChannelId: process.env.TWITCH_CHANNEL_ID,
    twitchOauthToken: process.env.TWITCH_OAUTH_TOKEN,
    twitchClientId: process.env.TWITCH_CLIENT_ID,
    twitchClientSecret: process.env.TWITCH_CLIENT_SECRET,    
    twitchBotUsername: process.env.TWITCH_BOT_USERNAME,
    twitchBotId: process.env.TWITCH_BOT_ID,
    discordToken: process.env.DISCORD_TOKEN,
    discordZwiftChannelId: process.env.DISCORD_ZWIFT_CHANNEL_ID,
    discordChallengeChannelId: process.env.DISCORD_CHALLENGE_CHANNEL_ID,
    discordTipChannelId: process.env.DISCORD_TIP_CHANNEL_ID,
    discordUnfollowsChannelId: process.env.DISCORD_UNFOLLOWS_CHANNEL_ID,
    dbConnectionString: process.env.DATABASE_CONN,
    zwiftUsername: process.env.ZWIFT_USERNAME,
    zwiftPassword: process.env.ZWIFT_PASSWORD,
    zwiftId: process.env.ZWIFT_ID,
    redisFlyConnect: process.env.REDIS_FLY_CONNECT,
    redisFlyConnectDev: process.env.REDIS_FLY_CONNECTD,
};

export default config;