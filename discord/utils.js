import { Client, GatewayIntentBits } from "discord.js";
import config from "../config/appConfig.js";

export default async function DiscordClient() {
  if (!config.discordToken) {
    console.warn("DISCORD_TOKEN is not set. Discord features are disabled.");
    return null;
  }

  const discord = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
  });

  discord.on("ready", () => {
    console.log(`Logged in to Discord as ${discord.user.tag}`);
  });

  await discord.login(config.discordToken);
  return discord;
}
