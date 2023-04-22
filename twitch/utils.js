import tmi from "tmi.js"
import * as chat from "./chat-commands.js"
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';
import { promises as fs } from 'fs';
import config from "../config/appConfig.js";

export async function refreshVipMods(twitchClient, state) {
  const vips = await twitchClient.channels.getVips(config.twitchChannelId)
  const fetchedVipsData = await vips.data
  state.vips = fetchedVipsData.map(v => v.name)
  const mods = await twitchClient.moderation.getModerators(config.twitchChannelId)
  const fetchedModsData = await mods.data
  const newMods = fetchedModsData.map(m => m.userName)
  newMods.push(config.twitchChannelUsername)
  state.mods = newMods
}

export async function getFollowers(twitchClient) {
  const fetchedFollowers = await twitchClient.channels.getChannelFollowers(config.twitchChannelId, config.twitchChannelId)
  const fetchedFollowersData = await fetchedFollowers.data
  return fetchedFollowersData.map(m => m.userName)
}

export async function NewTwitchClient() {
  const clientId = config.twitchClientId
  const clientSecret = config.twitchClientSecret
  const tokenData = JSON.parse(await fs.readFile(`./tokens.${config.twitchChannelId}.json`, 'UTF-8'));
  const authProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (userId, newTokenData) => await fs.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
    }
  );
  authProvider.addUser(config.twitchChannelId, tokenData, ['chat']);
    
  return new ApiClient({ authProvider });
}

export function privilegedUser(client, state, user) {
  if (!state.vips.includes(user) && !state.mods.includes(user)) {
    client.say(channel, "Must be a VIP or Mod to do that!");
  }
}

export async function TwitchChatClient(state) {
  const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "debug" },
    connection: {
      reconnect: true,
      secure: true,
    },

    identity: {
      username: `${config.twitchChannelUsername}`,
      password: `oauth:${config.twitchOauthToken}`,
    },
    channels: [`${config.twitchChannelUsername}`],
  });

  await client.connect().catch(console.error)

  client.on("message", (channel, tags, message, self) => {
    // Lack of this statement or it's inverse (!self) will make it in active
    if (self) return;

    // Create up a switch statement with some possible commands and their outputs
    // The input shall be converted to lowercase form first
    // The outputs shall be in the chats

    switch (message.split(" ")[0].toLowerCase()) {
      case "commands":
        chat.commands(client, channel, tags);
        break;

      case "!lurk":
        chat.lurk(client, channel, tags);
        break;

      case "!discord":
        chat.discord(client, channel, tags);
        break;

      case "!socials":
        chat.socials(client, channel, tags);
        break;

      case "!spooky":
        chat.fact(client, channel);
        break;

      case "!slap":
        if (!privilegedUser(client, state, tags.username)) {
          break;
        }
        chat.slap(client, channel, tags, message);
        break;

      case "!so":
        if (!privilegedUser(client, state, tags.username)) {
          break;
        }
        chat.shoutout(client, channel);
        break;

      case "!name":
        chat.name(client, channel, tags, message);
        break;

      case "!counter":
        if (!privilegedUser(client, state, tags.username)) {
          break;
        }
        chat.counter(client, channel, tags, message, state);
        break;

      case "help":
        chat.help(client, channel, tags, message);
        break;

      default:
        chat.defaultChat(client, channel, tags, message);
        break;
    }
  });

  return client
}