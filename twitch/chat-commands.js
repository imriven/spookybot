import { logInfo } from "../logger.js";

function say(client, channel, message) {
  return client.say(channel, message);
}

function isPrivileged(msg) {
  const userInfo = msg?.userInfo;
  return Boolean(userInfo?.isBroadcaster || userInfo?.isMod || userInfo?.isVip);
}

function renderTemplate(template, { channel, target, user }) {
  return (template || "")
    .replaceAll("{channel}", channel)
    .replaceAll("{target}", target || "")
    .replaceAll("{user}", user);
}

function commandCandidates(rawName) {
  const normalized = (rawName || "").trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("!")) {
    return [normalized, normalized.slice(1)];
  }

  return [normalized, `!${normalized}`];
}

function listCommands(client, channel, username, contentService) {
  const commandNames = contentService.getListedChatCommands().map((command) => command.name);
  if (commandNames.length === 0) {
    return say(client, channel, `@${username}, no chat commands are currently enabled.`);
  }

  return say(client, channel, `@${username}, available commands are: ${commandNames.join(", ")}`);
}

function help(client, channel, username, message, contentService, helpCommand) {
  const parts = message.trim().split(/\s+/);
  const requested = parts[1];

  if (!requested) {
    const fallback = `@${username}, try commands or help <command>.`;
    return say(client, channel, renderTemplate(helpCommand?.response || fallback, { channel, user: username }));
  }

  const targetCommand = commandCandidates(requested)
    .map((name) => contentService.getEnabledChatCommand(name))
    .find(Boolean);

  if (!targetCommand) {
    return say(client, channel, `@${username}, no help is available for ${requested}.`);
  }

  const helpText = [targetCommand.description, targetCommand.usage ? `Usage: ${targetCommand.usage}` : null]
    .filter(Boolean)
    .join(" ");

  if (!helpText) {
    return say(client, channel, `@${username}, no help is available for ${targetCommand.name}.`);
  }

  return say(client, channel, helpText);
}

function counter(client, channel, tags, state, message) {
  const splitMessage = message.trim().split(/\s+/);

  if (splitMessage.length === 1) {
    const counters = Object.entries(state.counters);
    if (counters.length === 0) {
      return say(client, channel, "No counters have been created yet.");
    }

    counters.forEach(([counterName, currentCounter]) => {
      say(client, channel, `${counterName}: ${currentCounter.value}, ${currentCounter.creator}`);
    });
    return;
  }

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
      logInfo("twitch.counter.deleted", {
        channel,
        counterName,
        actor: tags.username,
      });
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
    logInfo("twitch.counter.created", {
      channel,
      counterName,
      actor: tags.username,
      initialValue: 0,
    });
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
    logInfo("twitch.counter.created", {
      channel,
      counterName,
      actor: tags.username,
      initialValue,
    });
    say(client, channel, `Counter ${counterName} created by ${tags.username}.`);
    return;
  }

  say(client, channel, "Counter doesn't exist.");
}

function runTemplateCommand(client, channel, user, message, command) {
  const target = message.trim().split(/\s+/)[1];
  if (!target) {
    return say(client, channel, command.usage || "A target user is required.");
  }

  return say(client, channel, renderTemplate(command.response, { channel, target, user }));
}

function runTextCommand(client, channel, user, command) {
  if (!command.response) {
    return null;
  }

  return say(client, channel, renderTemplate(command.response, { channel, user }));
}

function runShoutoutLookup(client, channel, message, shoutouts) {
  let soUser = message.trim().split(/\s+/)[1];
  if (!soUser) {
    return null;
  }

  if (soUser.startsWith("@")) {
    soUser = soUser.slice(1);
  }

  const custom = shoutouts[soUser.toLowerCase()];
  if (custom) {
    return say(client, channel, custom);
  }

  return say(client, channel, `Please check out and follow ${soUser} at Twitch.tv/${soUser}`);
}

export function registerChatHandlers(chatClient, { contentService, state, onTitleChange }) {
  chatClient.onMessage(async (channel, user, message, msg) => {
    const commandName = message.trim().split(/\s+/)[0].toLowerCase();
    const tags = { username: user };
    const shoutouts = contentService.getEnabledCustomShoutoutMap();
    const command = contentService.getEnabledChatCommand(commandName);

    if (!command) {
      if (commandName.startsWith("!") && shoutouts[commandName.slice(1)]) {
        await say(chatClient, channel, shoutouts[commandName.slice(1)]);
      }
      return;
    }

    if (command.requiresPrivilege && !isPrivileged(msg)) {
      await say(chatClient, channel, "Must be a VIP or Mod to do that!");
      return;
    }

    switch (command.handler) {
      case "text":
        await runTextCommand(chatClient, channel, user, command);
        break;
      case "template":
        await runTemplateCommand(chatClient, channel, user, message, command);
        break;
      case "random_fact": {
        const fact = contentService.getRandomFact();
        if (fact) {
          await say(chatClient, channel, fact);
        }
        break;
      }
      case "shoutout_lookup":
        await runShoutoutLookup(chatClient, channel, message, shoutouts);
        break;
      case "counter":
        counter(chatClient, channel, tags, state, message);
        break;
      case "title_update":
        try {
          const nextTitle = message.split(" ").slice(1).join(" ").trim();
          await onTitleChange(nextTitle);
          logInfo("twitch.title.updated", {
            channel,
            actor: user,
            title: nextTitle,
          });
          await say(chatClient, channel, "Stream title updated.");
        } catch (error) {
          await say(chatClient, channel, `Title update failed: ${error.message}`);
        }
        break;
      case "help":
        await help(chatClient, channel, user, message, contentService, command);
        break;
      case "list":
        await listCommands(chatClient, channel, user, contentService);
        break;
      default:
        await say(chatClient, channel, `Command ${command.name} is misconfigured.`);
        break;
    }
  });
}
