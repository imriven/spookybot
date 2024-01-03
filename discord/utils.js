import { Client, GatewayIntentBits, ThreadMemberFlags } from 'discord.js'
import config from '../config/appConfig.js';

export default async function DiscordClient() {
    const discord = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
        ]
    })

    discord.on('ready', () => {
        console.log(`Logged in as ${discord.user.tag}!`);
    });
    discord.on('messageReactionAdd', (reaction, user) => {
        console.dir(reaction, user)
    })

    await discord.login(config.discordToken);
    return discord
}