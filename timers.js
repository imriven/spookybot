import { getOrdinalNum, msToTime } from "./utils.js"
// import { zwiftTimer } from "./zwift/utils.js"
import { spookyFacts, dailyTips, exercises } from "./data.js"
import { refreshVipMods, getFollowers, checkIfLive, getNumChatters, getNumViewers, streamersLive } from "./twitch/utils.js"
import config from "./config/appConfig.js"


const timers = [
    {
        title: "thanks",
        message: "Thank you so much for stopping by and hanging out! 🎉",
        time: 7000000,  //
        channel: config.twitchChannelUsername,
    },
    {
        title: "follow",
        message: "✨ Please FOLLOW to show your support! ✨ Thank You! 🤗",
        time: 4700000, // 
        channel: config.twitchChannelUsername,
    },
    {
        title: "rules",
        message: "This is a place of positivity - Leave the negative vibes at the door!",
        time: 6600000,  //60 minutes
        channel: config.twitchChannelUsername,
    },
    // {
    //     title: "spooky",
    //     message: "Hey I'm Spooky. Feel free to !lurk !slap !so !socials !spooky for spooky facts and more. Type in the word 'help' to find out more! ",
    //     time: 6000000,
    //     channel: config.twitchChannelUsername,
    // },
    // {
    //     title: "discord",
    //     message: "Join the Gaming in the Basement discord! https://discord.gg/B4NGMMmh86",
    //     time: 8400000, // 140 minutes
    //     channel: config.twitchChannelUsername,
    // },
    {
        title: "socials",
        message: "Check out RockAGoth's socials! https://linktr.ee/rockagoth",
        time: 5100000, // 85 mins
        channel: config.twitchChannelUsername,
    },
    {
        title: "welcome",
        message: "Welcome to the Basement! We are a fun and friendly community of gamers and streamers! Rockagoth is happy to be your host and get to know you! Don't be too afraid to say hi! Thank you for coming!",
        time: 4380000,  // 73 mins
        channel: config.twitchChannelUsername,
    },
    {
        title: "prime",
        message: "If you happen to have a prime sub laying around guess who would really really appreciate it?? This girl over here!! Thank you for supporting me 💜!",
        time: 3200000,
        channel: config.twitchChannelUsername,
    },
    {
        title: "CFW",
        message: "Cage Free Warriors (CFW) is a non-toxic casual Tekken Team! We play and learn together! Join us on Playstation! All Levels welcome! Follow our Youtube channel https://www.youtube.com/@CageFreeWarriors and join us! )",
        time: 6320000,
        channel: config.twitchChannelUsername,
    },

    {
        title: "streams",
        message: "I play Tekken every other Tuesday come join the lobby and the fun!",
        time: 7500000,
        channel: config.twitchChannelUsername,
    },

]

export function setUpLiveTwitchTimers(twitchChatClient, twitchClient, state) {
    timers.forEach(t => {
        const interval = setInterval(() => {
            twitchChatClient.say(t.channel, t.message);
        }, t.time)
        state.setTwitchTimer(t.title, interval)
    })
    const factInterval = setInterval(() => {
        let factIndex = Math.floor(Math.random() * spookyFacts.length);
        let fact = spookyFacts[factIndex];
        twitchChatClient.say(config.twitchChannelUsername, fact);
    }, 4800000)
    state.setTwitchTimer("fact", factInterval)
    const chatterViewerUptime = setInterval(async () => {
        const currentChatters = getNumChatters()
        const currentViewers = getNumViewers()
        const chatterDiff = currentChatters - state.numChatters
        const viewerDiff = currentViewers - state.numViewers
        const stream = await twitchClient.streams.getStreamByUserId(config.twitchChannelId)
        const currentDate = new Date()
        const twitchTime = new Date(stream.started_at).getTime()
        const streamTime = Math.abs(currentDate.getTime() - twitchTime)
        twitchChatClient.say(config.twitchChannelUsername, `stream time: ${msToTime(streamTime)}, chatters: ${currentChatters} (${chatterDiff}) viewers: ${currentViewers} (${viewerDiff})`);
    }, 3600000)
    state.setTwitchTimer("cvu", chatterViewerUptime)
}

export function setupTimers(twitchClient, discordClient, newTwitchClient, redisClient, state) {
    //zwiftClient taken out
    setInterval(async () => {
        await checkIfLive(twitchClient, newTwitchClient, state)
    }, 300000)

    setInterval(async () => {
        await streamersLive(newTwitchClient, discordClient, state)
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
        const previous = new Set(state.followers);
        const current = new Set(fetchedFollowers);

        const unfollows = [...previous].filter(follower => !current.has(follower)).join(", ")
        const newFollows = [...current].filter(follower => !previous.has(follower)).join(", ")
        const channel = await discordClient.channels.fetch(config.discordUnfollowsChannelId)
        if (unfollows) {
            channel.send(`These folks just unfollowed: ${unfollows}`)
        }
        if (newFollows) {
            channel.send(`These folks just followed: ${newFollows}`)
        }
        state.followers = fetchedFollowers
    }, 86400000,);


    // setInterval(async () => {
    //     await zwiftTimer(zwiftClient, discordClient, state)
    // }, 300000);mods

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