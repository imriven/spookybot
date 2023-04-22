import { Client, GatewayIntentBits, ThreadMemberFlags } from 'discord.js'
import config from '../config/appConfig.js';

export default async function DiscordClient() {
    const discord = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    })

    discord.on('ready', () => {
        console.log(`Logged in as ${discord.user.tag}!`);
    });

    await discord.login(config.discordToken);
    return discord
}