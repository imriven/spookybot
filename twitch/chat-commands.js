export function commands(client, channel, tags) {
    client.say(
        channel,
        `@${tags.username}, available commands are:
                - commands - help - !lurk - !socials - !counter - !spooky - !slap - !so - !name - !spooky - For more info just type "help"
                `
    )
}

export function lurk(client, channel, tags) {
    client.say(
        channel,
        `@${tags.username}, has entered the shadowy realm of the LURK,  ever watching, ever present, but silent among the mists...  Thank you for the support and LURK ON!`
    )
}

export function discord(client, channel, tags) {
    client.say(
        channel,
        `@${tags.username}, https://discord.gg/B4NGMMmh86`
    )
}

export function socials(client, channel) {
    client.say(
        channel,
        `visit my linktree for my socials! https://linktr.ee/rockagoth`
    )
}

export function fact(client, channel) {
    let factIndex = Math.floor(Math.random() * (SpookyFacts.length - 0 + 1) + 0);
    let fact = SpookyFacts[factIndex];
    client.say(channel, fact);
}

export function slap(client, channel, tags, message) {
    let slappedUser = message.split(" ")[1];
    client.say(
        channel,
        `${slappedUser} just got slapped by ${tags.username}`
    )
}

export function hug(client, channel, tags, message) {
    let huggedUser = message.split(" ")[1];
    client.say(
        channel,
        `${huggedUser} just got hugged by ${tags.username}`
    )
}

export function shoutout(client, channel, message) {
    let soUser = message.split(" ")[1];
    if (soUser.startsWith("@")) {
        soUser = soUser.slice(1)
    }
    client.say(
        channel,
        `Please check out and follow ${soUser} at Twitch.tv/${soUser}`
    )
}

export function name(client, channel, tags) {
    client.say(
        channel,
        `Hello @${tags.username}, my name is SpookyBot! Boo!`
    )
}

export function counter(client, channel, tags, state, message) {
    //loops through counter and prints out name value and creator
    if (message === "!counter") {
        for (const counterName in state.counters) {
            const currentCounter = state.counters[counterName]
            client.say(channel, `${counterName}: ${currentCounter.value}, ${currentCounter.creator}`);
        }
        return
    }
    let splitMessage = message.split(" ")
    let counterName = splitMessage[1]
    if (state.counters.hasOwnProperty(counterName)) {
        if (splitMessage[2] == "status") {
            client.say(channel, `${counterName}: ${state.counters[counterName].value}, ${state.counters[counterName].creator}`)
            return;
        }
        if (splitMessage[2] == "delete") {
            state.deleteCounter(counterName)
            client.say(channel, `Counter ${counterName} has been deleted`);
            return;
        } else if (splitMessage[2].startsWith("+")) {
            let num = splitMessage[2].slice(1)
            let nn = parseInt(num)
            if (isNaN(nn)) {
                client.say(channel, "you can only add numbers to a counter")
                return;
            }
            state.incrementCounter(counterName, nn)
            client.say(channel, `${counterName}: ${state.counters[counterName].value}`)
            return;
        } else if (splitMessage[2].startsWith("-")) {
            let num = splitMessage[2].slice(1)
            let nn = parseInt(num)
            if (isNaN(nn)) {
                client.say(channel, "you can only add numbers to a counter")
                return;
            }
            if (state.counters[counterName].value - nn < 0) {
                client.say(channel, "Counter numbers can't go below zero")
            } else {
                state.decrementCounter(counterName, amount)
                client.say(channel, `${counterName}: ${state.counters[counterName].value}`)
            }
            return;
        } else {
            client.say(channel, "Invalid operation for a counter")
            return;
        }
    } else {
        if (splitMessage.length < 3) {
            state.setCounter(counterName, {
                value: 0,
                creator: tags.username
            })
            client.say(channel, `Counter ${counterName} created by ${tags.username}!`)
            return;
        }
        if (splitMessage[2].startsWith("+")) {
            let num = splitMessage[2].slice(1)
            let nn = parseInt(num)
            if (isNaN(nn)) {
                client.say(channel, "you can only add numbers to a counter")
                return;
            }
            state.setCounter(counterName, {
                value: nn,
                creator: tags.username
            })
            client.say(channel, `Counter ${counterName} created by ${tags.username}!`)
            return;
        } else {
            client.say(channel, "counter doesn't exist")
            return;
        }
    }
}

export function help(client, channel, tags) {
    let splitHelp = message.split(" ")
    if (splitHelp.length == 1) {
        client.say(
            channel,
            `${tags.username}, Quick Help:`
        );
        client.say(
            channel,
            `commands: Get Commands`);
        client.say(
            channel,
            `help: Get Help`);
        client.say(
            channel,
            `!spooky: Get random spooky fact`);
        client.say(
            channel,
            `!lurk: Lurk Mode`);
        client.say(
            channel,
            `!discord: discord link`);
        client.say(
            channel,
            `!hug: Insert username after command `);
        client.say(
            channel,
            `!socials: Linktree`);
        client.say(
            channel,
            `!slap: Insert username after command - SUB, VIP, MOD only`);
        client.say(
            channel,
            `!so: Give a shoutout - SUB, VIP, MOD only`);
        client.say(
            channel,
            `!name: Spookybot wants to say hi`);
        client.say(
            channel,
            `!counter: type "help counter" for full sub commands`);
    } else if (splitHelp[1] == "counter") {
        client.say(
            channel,
            `Counter Help:`);
        client.say(
            channel,
            `!counter: displays counters that have been created`);
        client.say(
            channel,
            `!counter counterName: Creates counter with value of 0`);
        client.say(
            channel,
            `!counter counterName +NUMBER: Creates counter with value of NUMBER if the counter doesn't exist, if counter already exist this command will add the NUMBER to the counter`);
        client.say(
            channel,
            `!counter counterName -NUMBER: Will subtract NUMBER from counter`);
        client.say(
            channel,
            `!counter counterName delete: Will delete counter`);
    }
}