function say(client, channel, message) {
  return client.say(channel, message);
}

function isPrivileged(state, username) {
  const normalized = username.toLowerCase();
  return state.mods.some((mod) => mod.toLowerCase() === normalized)
    || state.vips.some((vip) => vip.toLowerCase() === normalized);
}

function listCommands(client, channel, username) {
  return say(
    client,
    channel,
    `@${username}, available commands are: commands, help, !lurk, !discord, !podcast, !gamer, !tuesday, !throwback, !thirsty, !friday, !socials, !counter, !spooky, !slap, !so, !name, !hug, !title`,
  );
}

function help(client, channel, username, message) {
  const parts = message.trim().split(/\s+/);
  if (parts[1] !== "counter") {
    return say(
      client,
      channel,
      `@${username}, try commands, !spooky, !lurk, !discord, !podcast, !gamer, !hug <user>, !slap <user>, !so <user>, !counter, or help counter.`,
    );
  }

  return say(
    client,
    channel,
    'Counter help: "!counter" lists counters, "!counter name" creates one, "!counter name +5" adds, "!counter name -2" subtracts, "!counter name status" shows it, "!counter name delete" removes it.',
  );
}

function counter(client, channel, tags, state, message) {
  if (message === "!counter") {
    const counters = Object.entries(state.counters);
    if (counters.length === 0) {
      return say(client, channel, "No counters have been created yet.");
    }

    counters.forEach(([counterName, currentCounter]) => {
      say(client, channel, `${counterName}: ${currentCounter.value}, ${currentCounter.creator}`);
    });
    return;
  }

  const splitMessage = message.trim().split(/\s+/);
  const counterName = splitMessage[1];
  if (!counterName) {
    say(client, channel, "Counter name is required.");
    return;
  }

  if (state.counters[counterName]) {
    const operation = splitMessage[2];
    if (!operation || operation === "status") {
      say(
        client,
        channel,
        `${counterName}: ${state.counters[counterName].value}, ${state.counters[counterName].creator}`,
      );
      return;
    }

    if (operation === "delete") {
      state.deleteCounter(counterName);
      say(client, channel, `Counter ${counterName} has been deleted.`);
      return;
    }

    if (operation.startsWith("+") || operation.startsWith("-")) {
      const delta = Number.parseInt(operation, 10);
      if (Number.isNaN(delta)) {
        say(client, channel, "You can only add or subtract numbers from a counter.");
        return;
      }

      const nextValue = state.counters[counterName].value + delta;
      if (nextValue < 0) {
        say(client, channel, "Counter numbers can't go below zero.");
        return;
      }

      state.counters[counterName].value = nextValue;
      say(client, channel, `${counterName}: ${state.counters[counterName].value}`);
      return;
    }

    say(client, channel, "Invalid counter operation.");
    return;
  }

  if (!splitMessage[2]) {
    state.setCounter(counterName, { value: 0, creator: tags.username });
    say(client, channel, `Counter ${counterName} created by ${tags.username}.`);
    return;
  }

  if (splitMessage[2].startsWith("+")) {
    const initialValue = Number.parseInt(splitMessage[2], 10);
    if (Number.isNaN(initialValue) || initialValue < 0) {
      say(client, channel, "You can only create a counter with a positive number.");
      return;
    }

    state.setCounter(counterName, { value: initialValue, creator: tags.username });
    say(client, channel, `Counter ${counterName} created by ${tags.username}.`);
    return;
  }

  say(client, channel, "Counter doesn't exist.");
}

export function registerChatHandlers(chatClient, { contentService, state, onTitleChange }) {
  chatClient.onMessage(async (channel, user, message) => {
    const command = message.split(" ")[0].toLowerCase();
    const tags = { username: user };
    const shoutouts = contentService.getEnabledCustomShoutoutMap();

    switch (command) {
      case "commands":
        await listCommands(chatClient, channel, user);
        break;
      case "!lurk":
        await say(
          chatClient,
          channel,
          `@${user}, has entered the shadowy realm of the LURK, ever watching, ever present, but silent among the mists... Thank you for the support and LURK ON!`,
        );
        break;
      case "!discord":
        await say(chatClient, channel, `@${user}, https://discord.gg/B4NGMMmh86`);
        break;
      case "!podcast":
        await say(chatClient, channel, `@${user}, https://spotifyanchor-web.app.link/e/hlkZhLRHLAb6`);
        break;
      case "!gamer":
        await say(chatClient, channel, `@${user}, psn: imriven | switch: SW-1842-0535-8897 | steam: 1531719496`);
        break;
      case "!dreewmods":
        await say(chatClient, channel, "visit the t7g patreon for exclusive Tekken mods! https://www.patreon.com/T7G");
        break;
      case "!tuesday":
        await say(chatClient, channel, "welcome to Tekken Tuesday!!! Where it's Tuesday and there is Tekken and tequila, now please buy a lady a shot!");
        break;
      case "!warrior":
        await say(chatClient, channel, "Welcome to Warrior Wednesday where we throw down with a fighting game!!!");
        break;
      case "!throwback":
        await say(chatClient, channel, "visit the t7g patreon for exclusive Tekken mods! https://www.patreon.com/T7G");
        break;
      case "!thirsty":
        await say(chatClient, channel, "welcome to Thirsty Thursday where we play anything from retro to next gen and I'm thirsty for a cocktail. Buy a lady a drink!");
        break;
      case "!friday":
        await say(chatClient, channel, "Welcome in to Fiesty Friday. We have no agenda we vibe, we chill and hangout!");
        break;
      case "!socials":
        await say(chatClient, channel, "visit my linktree for my socials! https://linktr.ee/rockagoth");
        break;
      case "!spooky": {
        const fact = contentService.getRandomFact();
        if (fact) {
          await say(chatClient, channel, fact);
        }
        break;
      }
      case "!slap": {
        if (!isPrivileged(state, user)) {
          await say(chatClient, channel, "Must be a VIP or Mod to do that!");
          break;
        }
        const slappedUser = message.trim().split(/\s+/)[1];
        if (slappedUser) {
          await say(chatClient, channel, `${slappedUser} just got slapped by ${user}`);
        }
        break;
      }
      case "!so": {
        if (!isPrivileged(state, user)) {
          await say(chatClient, channel, "Must be a VIP or Mod to do that!");
          break;
        }
        let soUser = message.trim().split(/\s+/)[1];
        if (!soUser) {
          break;
        }
        if (soUser.startsWith("@")) {
          soUser = soUser.slice(1);
        }
        const custom = shoutouts[soUser.toLowerCase()];
        if (custom) {
          await say(chatClient, channel, custom);
        } else {
          await say(chatClient, channel, `Please check out and follow ${soUser} at Twitch.tv/${soUser}`);
        }
        break;
      }
      case "!name":
        await say(chatClient, channel, `Hello @${user}, my name is SpookyBot! Boo!`);
        break;
      case "!hug": {
        const huggedUser = message.trim().split(/\s+/)[1];
        if (huggedUser) {
          await say(chatClient, channel, `${huggedUser} just got hugged by ${user}`);
        }
        break;
      }
      case "!counter":
        if (!isPrivileged(state, user)) {
          await say(chatClient, channel, "Must be a VIP or Mod to do that!");
          break;
        }
        counter(chatClient, channel, tags, state, message);
        break;
      case "help":
        await help(chatClient, channel, user, message);
        break;
      case "!title":
        if (!isPrivileged(state, user)) {
          await say(chatClient, channel, "Must be a VIP or Mod to do that!");
          break;
        }
        try {
          await onTitleChange(message.split(" ").slice(1).join(" ").trim());
          await say(chatClient, channel, "Stream title updated.");
        } catch (error) {
          await say(chatClient, channel, `Title update failed: ${error.message}`);
        }
        break;
      default: {
        if (command.startsWith("!") && shoutouts[command.slice(1)]) {
          await say(chatClient, channel, shoutouts[command.slice(1)]);
        }
      }
    }
  });
}
