import dotenv from "dotenv";

const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || "development";
const isLocal = environment === "development" || environment === "test";
const isProduction = environment === "production";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

if (isLocal) {
  dotenv.config();
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

if (!process.env.TOKEN_ENCRYPTION_KEY) {
  throw new Error("TOKEN_ENCRYPTION_KEY must be set.");
}

const defaultTwitchTarget = {
  key: "main",
  label: "rockagoth",
  username: "rockagoth",
  channelId: "266329643",
  isTest: false,
};

const twitchTargets = [
  defaultTwitchTarget,
  {
    key: "test",
    label: "rockagoth_test_stream",
    username: "rockagoth_test_stream",
    channelId: "850290091",
    isTest: true,
  },
];

const config = {
  environment,
  isLocal,
  isProduction,
  sessionCookieSecure: !isLocal,
  port,
  defaultTwitchTarget,
  defaultTwitchTargetKey: defaultTwitchTarget.key,
  twitchTargets,
  twitchClientId: process.env.TWITCH_CLIENT_ID,
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET,
  twitchBotUsername: process.env.TWITCH_BOT_USERNAME,
  twitchBotId: process.env.TWITCH_BOT_ID,
  twitchRedirectUri: process.env.TWITCH_REDIRECT_URI || `http://localhost:${port}/auth/twitch/callback`,
  twitchRequiredScopes: [
    "chat:read",
    "chat:edit",
    "moderator:read:followers",
    "moderator:read:chatters",
    "channel:manage:broadcast",
  ],
  discordToken: process.env.DISCORD_TOKEN,
  discordChallengeChannelId: process.env.DISCORD_CHALLENGE_CHANNEL_ID,
  discordTipChannelId: process.env.DISCORD_TIP_CHANNEL_ID,
  discordUnfollowsChannelId: process.env.DISCORD_UNFOLLOWS_CHANNEL_ID,
  dbConnectionString: process.env.DATABASE_URL,
  redisFlyConnect: process.env.REDIS_FLY_CONNECT,
  redisFlyConnectDev: process.env.REDIS_FLY_CONNECTD,
  sessionSecret: process.env.SESSION_SECRET,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
};

export default config;
