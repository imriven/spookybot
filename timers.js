import { getOrdinalNum } from "./utils.js"
import { zwiftTimer } from "./zwift/utils.js"
import { spookyFacts, dailyTips, exercises } from "./data.js"
import { refreshVipMods, getFollowers, checkIfLive } from "./twitch/utils.js"
import config from "./config/appConfig.js"

const timers = [
    {
        title: "thanks",
        message: "Thank you so much for stopping by and hanging out! 🎉",
        time: 3000000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "follow",
        message: "✨ Please FOLLOW to show your support! ✨ Thank You! 🤗",
        time: 4200000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "rules",
        message: "This is a place of positivity - Leave the negative vibes at the door!",
        time: 3600000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "spooky",
        message: "Hey I'm Spooky. Feel free to !lurk !slap !so !socials !spooky for spooky facts and more. Type in the word 'help' to find out more! ",
        time: 6000000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "discord",
        message: "Join the Gaming in the Basement discord! https://discord.gg/B4NGMMmh86",
        time: 8400000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "socials",
        message: "Check out RockAGoth's socials! https://linktr.ee/rockagoth",
        time: 5400000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "saCommands",
        message: "Join in the avatar fun! You can !jump, !sit, !duel (user) (points), !fart, !roll, !8ball (question), !slots (points), !attack (user), !hug (user), and !dance",
        time: 9000000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "saExtension",
        message: "Check out the stream avatar extension below the stream to change or dress up your avatar",
        time: 9600000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "saFullCommands",
        message: "Curious about what your avatar can do? Check out the full command list here https://docs.streamavatars.com/stream-avatars/commands",
        time: 12000000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "patreon",
        message: "To listen to exclusive content from the podcast check out patreon. https://patreon.com/RockAgoth",
        time: 7800000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "podcast",
        message: "Check out the Gaming in the Basement Podcast! available on several platforms https://anchor.fm/rock-a-goth",
        time: 7200000,
        channel: config.twitchChannelUsername,
    },
]

export function setUpLiveTwitchTimers(twitchClient, state) {
    timers.forEach(t => {
        const interval = setInterval(() => {
            twitchClient.say(t.channel, t.message);
        }, t.time)
        state.setTwitchTimer(t.title, interval)
    })
    const factInterval = setInterval(() => {
        let factIndex = Math.floor(Math.random() * spookyFacts.length);
        let fact = spookyFacts[factIndex];
        twitchClient.say(config.twitchChannelUsername, fact);
    }, 4800000)
    state.setTwitchTimer("fact", factInterval)
}

export function setupTimers(twitchClient, discordClient, newTwitchClient, redisClient, zwiftClient, state) {
    setInterval(async () => {
        await checkIfLive(twitchClient, newTwitchClient, state)
    }, 300000)

    setInterval(async () => {
        await refreshVipMods(newTwitchClient, state)
    }, 3600000)

    setInterval(async () => {
        const date = new Date()
        if (date.getUTCHours() !== 14) {
            return
        }
        let dailyExercises = []
        while (dailyExercises.length != 3) {
            const randomIndex = Math.floor(Math.random() * exercises.length)
            if (!dailyExercises.includes(randomIndex)) {
                dailyExercises.push(randomIndex)
            }
        }

        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const yearMonth = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"]
        let day = weekday[date.getDay()]
        let month = yearMonth[date.getMonth()]
        let dateNum = getOrdinalNum(date.getDate())
        let year = date.getFullYear()
        const channel = await discordClient.channels.fetch(config.discordChallengeChannelId)
        channel.send(`
**${day} ${month} ${dateNum}, ${year}**
*1 - 5 sets*
${exercises[dailyExercises[0]]}
${exercises[dailyExercises[1]]}
*extra credit*
${exercises[dailyExercises[2]]}
        `)
    }, 3600000)

    setInterval(async () => {
        const fetchedFollowers = await getFollowers(newTwitchClient)
        if (!state.followers) {
            state.followers = fetchedFollowers
            return
        }
        const a = new Set(state.followers);
        const b = new Set(fetchedFollowers);

        const unfollows = [...a].filter(x => !b.has(x)).join(", ")
        if (unfollows) {
            const channel = await discordClient.channels.fetch(config.discordUnfollowsChannelId)
            channel.send(`These folks just unfollowed: ${unfollows}`)
        }
        state.followers = fetchedFollowers
    }, 86400000,);


    setInterval(async () => {
        await zwiftTimer(zwiftClient, discordClient, state)
    }, 300000);

    setInterval(async () => {
        const date = new Date()
        if (date.getUTCHours() !== 14) {
            return
        }
        let tipCounter = await redisClient.get("tipCounter")
        tipCounter = parseInt(tipCounter)

        const channel = await discordClient.channels.fetch(config.discordTipChannelId)
        await channel.send(`
      **${dailyTips[tipCounter].title}**
      ${dailyTips[tipCounter].tip}
          `)
        if (tipCounter == dailyTips.length - 1) {
            await redisClient.set("tipCounter", 0)
        } else {
            await redisClient.set("tipCounter", tipCounter + 1)
        }
    }, 3600000);

}