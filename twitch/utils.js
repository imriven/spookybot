import tmi from "tmi.js"
import * as chat from "./chat-commands.js"
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';
import { promises as fs } from 'fs';
import config from "../config/appConfig.js";
import { setUpLiveTwitchTimers } from "../timers.js";

export async function refreshVipMods(twitchClient, state) {
  const vips = await twitchClient.channels.getVipsPaginated(config.twitchChannelId)
  const fetchedVipsData = await vips.getAll()
  state.vips = fetchedVipsData.map(v => v.name)
  const mods = await twitchClient.moderation.getModeratorsPaginated(config.twitchChannelId)
  const fetchedModsData = await mods.getAll()
  const newMods = fetchedModsData.map(m => m.userName)
  newMods.push(config.twitchChannelUsername)
  state.mods = newMods
}

export async function checkIfLive(twitchChatClient, twitchClient, state) {
  const stream = await twitchClient.streams.getStreamByUserId(config.twitchChannelId)
  if (stream && !state.isLive) {
    setUpLiveTwitchTimers(twitchChatClient, twitchClient, state)
  }
  if (!stream && state.isLive) {
    for (var key in state.twitchTimers) {
      if (state.twitchTimers.hasOwnProperty(key)) {
        if (state.twitchTimers[key] === null || isEmpty(state.twitchTimers[key])) {
          clearInterval(state.twitchTimers[key])
          state.deleteTwitchTimer(key)
        }
      }
    }
  }
}

export async function getFollowers(twitchClient) {
  const fetchedFollowers = await twitchClient.channels.getChannelFollowersPaginated(config.twitchChannelId, config.twitchChannelId)
  const allFetchedFollowers = await fetchedFollowers.getAll()
  return allFetchedFollowers.map(m => m.userName)
}

export async function getNumViewers(twitchClient) {
  const stream = await twitchClient.streams.getStreamByUserId(config.twitchChannelId)
  return stream.viewers
}

export async function getNumChatters(twitchClient) {
  const fetchedChatters = await twitchClient.chat.getChattersPaginated(config.twitchChannelId, config.twitchChannelId)
  const allFetchedChatters = await fetchedChatters.getAll()
  return allFetchedChatters.length
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
    return false;
  }
  return true;
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
        chat.socials(client, channel);
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
        chat.shoutout(client, channel, message);
        break;

      case "!name":
        chat.name(client, channel, tags, message);
        break;

      case "!hug":
        chat.hug(client, channel, tags, message);
        break;

      case "!counter":
        if (!privilegedUser(client, state, tags.username)) {
          break;
        }
        chat.counter(client, channel, tags, state, message);
        break;

      case "help":
        chat.help(client, channel, tags, message);
        break;

      // personalized shoutouts

      case "!urmom":
        chat.urmom(client, channel);
        break;

      case "!maninchair":
        chat.maninchair(client, channel);
        break;

      case "!angry":
        chat.angry(client, channel);
        break;

      case "!arisu":
        chat.arisu(client, channel);
        break;

      case "!canniman":
        chat.canniman(client, channel);
        break;

      case "!cleveland":
        chat.cleveland(client, channel);
        break;

      case "!clutchworld":
        chat.clutchworld(client, channel);
        break;

      case "!elise":
        chat.elise(client, channel);
        break;

      case "!deuzex":
        chat.deuzex(client, channel);
        break;

      case "!devilz":
        chat.devilz(client, channel);
        break;

      case "!free":
        chat.free(client, channel);
        break;

      case "!gang":
        chat.gang(client, channel);
        break;

      case "!gmike":
        chat.gmike(client, channel);
        break;

      case "!gooey":
        chat.gooey(client, channel);
        break;

      case "!gucci":
        chat.gucci(client, channel);
        break;

      case "!heavenly":
        chat.heavenly(client, channel);
        break;

      case "!hunter":
        chat.hunter(client, channel);
        break;

      case "!ili":
        chat.ili(client, channel);
        break;

      case "!john":
        chat.john(client, channel);
        break;

      case "!k9":
        chat.k9(client, channel);
        break;

      case "!foxy":
        chat.foxy(client, channel);
        break;

      case "!khal":
        chat.khal(client, channel);
        break;

      case "!kidd":
        chat.kidd(client, channel);
        break;

      case "!based":
        chat.based(client, channel);
        break;

      case "!skittlez":
        chat.skittlez(client, channel);
        break;

      case "!light":
        chat.light(client, channel);
        break;

      case "!lesser":
        chat.lesser(client, channel);
        break;

      case "!lilivy":
        chat.lilivy(client, channel);
        break;

      case "!chop":
        chat.chop(client, channel);
        break;

      case "!mustache":
        chat.mustache(client, channel);
        break;

      case "!obscure":
        chat.obscure(client, channel);
        break;

      case "!panda":
        chat.panda(client, channel);
        break;

      case "!pickle":
        chat.pickle(client, channel);
        break;

      case "!rai":
        chat.rai(client, channel);
        break;

      case "!rocker":
        chat.rocker(client, channel);
        break;

      case "!rounin":
        chat.rounin(client, channel);
        break;

      case "!savior":
        chat.savior(client, channel);
        break;

      case "!shigs":
        chat.shigs(client, channel);
        break;

      case "!smoke":
        chat.smoke(client, channel);
        break;

      case "!spiku":
        chat.spiku(client, channel);
        break;

      case "!subboy":
        chat.subboy(client, channel);
        break;

      case "!surge":
        chat.surge(client, channel);
        break;

      case "!t7g":
        chat.t7g(client, channel);
        break;

      case "!wardeness":
        chat.wardeness(client, channel);
        break;

      case "!chance":
        chat.chance(client, channel);
        break;

      case "!gil":
        chat.gil(client, channel);
        break;

      case "!timber":
        chat.timber(client, channel);
        break;

      case "!tisagh":
        chat.tisagh(client, channel);
        break;


      case "!timber":
        chat.timber(client, channel);
        break;


      case "!tnt":
        chat.tnt(client, channel);
        break;


      case "!xpert":
        chat.xpert(client, channel);
        break;


      case "!storm":
        chat.storm(client, channel);
        break;


      case "!urmom":
        chat.urmom(client, channel);
        break;
    }
  });

  return client
}