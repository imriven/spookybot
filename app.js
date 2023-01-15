const Data = require("./data");
 
// Require necessary node modules
// Make the variables inside the .env element available to our Node project
const { Client, GatewayIntentBits, ThreadMemberFlags } = require('discord.js')
require("dotenv").config();
const ZwiftAccount = require("zwift-mobile-api");
const tmi = require("tmi.js");

const worldMap = {
  1: "Watopia",
  3: "London",
  4: "New York",
  9: "Murkai Islands",
}

const vips = [
  "angrytxicchaobla",
  "canniman777",
  "definatelynotelsie",
  "deuzex85",
  "johnharris85",
  "freeside11",
  "gangmediator",
  "guccigottheflu",
  "johnharris85",
  "love_ivy54",
  "t7g_",
  "thecriticalchance",
  "thegiiil",
  "tougodotio",
  "rock_a_goth",
  "kamikifoxy92",
  "savior0420",
  "smokeahontasx",
  "surgetekken",
  "timberbrick"
];


// COUNTER:
// - We need to create something that will hold our counters
// - Const or let? Are we going to need to modify it?
// - Should it be an array or an object? What are the advantages / disadvantages for each? What's easier? How are we likely to access them?
// - What data do we need to store in it? Creator, count, name, maybe the time it was created? (so we can clean up old ones)




//Counter 
//create a new counter
//can enter where we want to start the counter upon creation
//want to add to the counter and have it display updated number after being added to
//also need the ability to subtract
//ability to erase counter and show what counters are active or have been created
// command counter_name number(optional default to 0)



// Timers
// COUNTER:
// - If you decided to store the creation time, do we need a timer to run every so often to clear expired counters?
// - How often? How is it going to find expired ones?

let currentActivityId = null;

function zwiftTimer() {
  account.getProfile(process.env.Z_ID).profile().then(p => {
    if (p.currentActivityId) {
      console.log(p)
      if (currentActivityId === p.currentActivityId){
        return;
      }
      console.log(p.currentActivityId)
      currentActivityId = p.currentActivityId;
      // account.getActivity(process.env.Z_ID).getActivity(p.currentActivityId).then(activity => {
      //   console.log(activity)
      // })
      discord.channels.fetch(process.env.DISCORD_CHANNEL_ID).then(channel => {
        channel.send("Christina is working out on zwift")
      }) 
    } else {
      if (currentActivityId != null) {
        discord.channels.fetch(process.env.DISCORD_CHANNEL_ID).then(channel => {
          channel.send("Christina stopped working out on zwift")
        }) 
        currentActivityId = null;
      }
    }
});
}
const getOrdinalNum = (number) => {
  let selector;

  if (number <= 0) {
    selector = 4;
  } else if ((number > 3 && number < 21) || number % 10 > 3) {
    selector = 0;
  } else {
    selector = number % 10;
  }

  return number + ['th', 'st', 'nd', 'rd', ''][selector];
};

function dailyChallenge() {
  const date = new Date()
  if (date.getUTCHours() !== 14) {
    return
  }
  // while new array is not equal to Three
let dailyExercises = [] 
  while (dailyExercises.length != 3) {

      const randomIndex = Math.floor(Math.random() * Data.ExerciseArray.length)
      if (!dailyExercises.includes(randomIndex)){
        dailyExercises.push(randomIndex)
      } 
  }
  
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const yearMonth = ["January","February","March","April","May","June","July",
  "August","September","October","November","December"]
  let day = weekday[date.getDay()]
  let month = yearMonth[date.getMonth()]
  let dateNum = getOrdinalNum(date.getDate())
  let year = date.getFullYear()
  discord.channels.fetch(process.env.DISCORD_DAILY_ID).then(channel => {
    channel.send(`
**${day} ${month} ${dateNum}, ${year}**
*1 - 5 sets*
${Data.ExerciseArray[dailyExercises[0]]}
${Data.ExerciseArray[dailyExercises[1]]}
*extra credit*
${Data.ExerciseArray[dailyExercises[2]]}
    `)
  }) 
}





function tyTimer() {
  let ty = "Thank you so much for stopping by and hanging out! 🎉";
  client.say("#rock_a_goth", ty);
}

function followTimer() {
  let follow = "✨ Please FOLLOW to show your support! ✨ Thank You! 🤗";
  client.say("#rock_a_goth", follow);
}

function rulesTimer() {
  let rules =
    "This is a place of positivity - Leave the negative vibes at the door!";
  client.say("#rock_a_goth", rules);
}

function spookyTimer() {
  let spooky =
    "Hey I'm Spooky. Type in the word, commands, to see what I can do! ";
  client.say("#rock_a_goth", spooky);
}

function spookyIntervalFunc() {
  let factIndex = Math.floor(Math.random() * (Data.length - 0 + 1) + 0);
  let fact = Data[factIndex];
  client.say("#rock_a_goth", fact);
}

function discordHomieTimer() {
  let homieDiscord = "Network, stream, game, make friends, become a homie and join our discord! https://discord.gg/GkmqJq6Q";
 
  client.say("#rock_a_goth", homieDiscord);
}

function linkTreeTimer() {
  let linkTree = "Check out RockAGoth's socials! https://linktr.ee/rockagoth";
  client.say("#rock_a_goth", linkTree);
}



const account = new ZwiftAccount(`${process.env.Z_USERNAME}`, `${process.env.Z_PASSWORD}`);

// Setup connection configurations
// These include the channel, username and password
const client = new tmi.Client({
  options: { debug: true, messagesLogLevel: "debug" },
  connection: {
    reconnect: true,
    secure: true,
  },
  
  // Lack of the identity tags makes the bot anonymous and able to fetch messages from the channel
  // for reading, supervision, spying, or viewing purposes only
  identity: {
    username: `${process.env.TWITCH_USERNAME}`,
    password: `oauth:${process.env.TWITCH_OAUTH}`,
  },
  channels: [`${process.env.TWITCH_CHANNEL}`],
});

// Connect to the channel specified using the settings found in the configurations
client.connect().catch(console.error)
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


//make sure this line is the last line
discord.login(process.env.DISCORD_TOKEN); //login bot using token
// Any error found shall be logged out in the con

// setInterval(zwiftTimer, 300000); //5
setInterval(zwiftTimer, 30000); //
setInterval(followTimer, 1800000); //30
setInterval(spookyIntervalFunc, 900000); //15 mins
setInterval(linkTreeTimer, 18500000); //35
setInterval(spookyTimer, 2400000); //40
setInterval(tyTimer, 2700000); //45
setInterval(rulesTimer, 3600000); //60
setInterval(dailyChallenge, 3600000) //60
setInterval(discordHomieTimer, 36500000); //65

let counters = {}
let counterExample = {

  "death": {
    "value": 5,
    "creator": "christina"
  }
}
/* #region */
// When the bot is on, it shall fetch the messages send by user from the specified channel
client.on("message", (channel, tags, message, self) => {
  // Lack of this statement or it's inverse (!self) will make it in active
  if (self) return;

  // Create up a switch statement with some possible commands and their outputs
  // The input shall be converted to lowercase form first
  // The outputs shall be in the chats

  switch (message.split(" ")[0].toLowerCase()) {
    // Use 'tags' to obtain the username of the one who has keyed in a certain input
    // 'channel' shall be used to specify the channel name in which the message is going to be displayed
    //For one to send a message in a channel, you specify the channel name, then the message
    // We shall use backticks when using tags to support template interpolation in JavaScript

    // In case the message in lowercase is equal to the string 'commands', send the sender of that message some of the common commands

    case "commands":
      client.say(
        channel,
        `@${tags.username}, available commands are:
            - commands - help - !lurk - !socials - !spooky - !slap user - !so user - !name - !spooky - For more info just type "help"
            `
      );
      break;

    // In case the message in lowercase is equal to the string '!website', send the sender of that message your personal website
    case "!lurk":
      client.say(
        channel,
        `@${tags.username}, has entered the shadowy realm of the LURK,  ever watching, ever present, but silent among the mists...  Thank you for the support and LURK ON!`
      );
      break;

    case "!socials":
      client.say(
        channel,
        `visit my linktree for my socials! https://linktr.ee/rockagoth`
      );
      break;

    //     // In case the message in lowercase is equal to the string 'greetings', send the sender of that message 'Hello @Username, what's up?!'
    // case 'greetings':
    //     client.say(channel, `Hello @${tags.username}, what's up?!`);
    //     break;

    // case '!fuzzybear':
    //     client.say(channel, `@${tags.username}, Leila is the fuzzy bear!`);
    //     break;

    // case '!kitty':
    //     client.say(channel, `LEILA BEAR!`);
    //     break;

    case "!spooky":
      let factIndex = Math.floor(Math.random() * (Data.length - 0 + 1) + 0);
      let fact = Data[factIndex];
      client.say(channel, fact);
      break;

    // In case the message in lowercase is equal to the string 'hi', send the sender of that message 'Username, hola'

    case "!slap":
      if (!vips.includes(tags.username)) {
        client.say(channel, "Must be a Sub, VIP or Mod to slap someone");
        break;
      }
      let slappedUser = message.split(" ")[1];
      client.say(
        channel,
        `${slappedUser} just got slapped by ${tags.username}`
      );
      break;

    case "!so":
      if (!vips.includes(tags.username)) {
        client.say(channel, "Must be a VIP or Mod to give shoutout");
        break;
      }
      let soUser = message.split(" ")[1];
      client.say(
        channel,
        `Please check out and follow ${soUser} at Twitch.tv/${soUser}`
      );
      break;

    // In case the message in lowercase is equal to the string '!name', send the sender of that message the name of the chatbot
    case "!name":
      client.say(
        channel,
        `Hello @${tags.username}, my name is SpookyBot! Boo!`
      );
      break;
    /* #endregion */
    // COUNTER:
    // - We need a new command for our counters. What should we call it?
    // - We'll also need to split the command into all it's pieces (see structure below), how can we do that and save each 'piece' (counter name, value, etc...)
    // - What's the structure of our counter messages going to be? !counter <counter> <value>? Or maybe !counter <command, delete, create etc...?> <counter>?
    // - Who can manipulate counters? Who can create them? Who can add / subtract from them? Who can delete them?
    // - What are the different things I can do with counters? Create, add / subtract, list, delete, etc..., any others? We should handle each case one
    // at a time and make sure we cover all the requirements.
    // - We need to make sure counters can't go negative, either at the start or as people subtract from them.
    // - Message text is always a string, if we need to do math on the input (to add / subtract / keep track of totals) what do we need to do?


    case "!counter":
      if (!vips.includes(tags.username)) {
        client.say(channel, "Must be a VIP or Mod make counter");
        break;
      }
      if (message === "!counter") {
        for (const property in counters) {
          const cp = counters[property]
          client.say(channel, `${property}: ${cp.value}, ${cp.creator}`);
        } 
        break;
      }
      let splitMessage = message.split(" ")
      let counterName = splitMessage[1]
      if (counters.hasOwnProperty(counterName)) {
        if (splitMessage[2] == "delete") {
          delete counters[counterName]
          client.say(channel, `Counter ${counterName} has been deleted`);
          break;
        } else if (splitMessage[2].startsWith("+")) {
          let num = splitMessage[2].slice(1)
          let nn = parseInt(num)
          if (isNaN(nn)) {
            client.say(channel, "you can only add numbers to a counter")
            break;
          }
          counters[counterName].value += nn
          client.say(channel, `${counterName}: ${counters[counterName].value}`)
          break;
        } else if (splitMessage[2].startsWith("-")) {
          let num = splitMessage[2].slice(1)
          let nn = parseInt(num)
          if (isNaN(nn)) {
            client.say(channel, "you can only add numbers to a counter")
            break;
          }
          if (counters[counterName].value - nn < 0) {
            client.say(channel, "Counter numbers can't go below zero")
          } else {
            counters[counterName].value -= nn
            client.say(channel, `${counterName}: ${counters[counterName].value}`)
          }
          break;
        } else {
          client.say(channel, "Invalid operation for a counter")
          break;
        }
      } else {
        if(splitMessage.length < 3 ){
          counters[counterName] = {
            value: 0,
            creator: tags.username
          }
          client.say(channel, `Counter ${counterName} created by ${tags.username}!`)
          break;
        }
        if (splitMessage[2].startsWith("+")) {
          let num = splitMessage[2].slice(1)
          let nn = parseInt(num)
          if (isNaN(nn)) {
            client.say(channel, "you can only add numbers to a counter")
            break;
          }
          counters[counterName] = {
            value: nn,
            creator: tags.username
          }
          client.say(channel, `Counter ${counterName} created by ${tags.username}!`)
          break;
        } else {
          client.say(channel, "counter doesn't exist")
          break;
        }
      } 

 
    // In case the message in lowercase is equal to the string 'help', send the sender of that message all the available help and commands
    case "help":
      client.say(
        channel,
        `${tags.username}, Quick Help:

            commands: Get Commands || 
            help: Get Help || 
            !spooky: Get random spooky fact || 
            !lurk: Lurk Mode ||     }
            !socials: My Linktree || 
            !slap: Insert username after command - SUB, VIP, MOD only || 
            !so: Give yourself a shoutout - SUB, VIP, MOD only ||
            !name: Spookybot wants to say hi

            `
      );
      break;

    //         // In case the message in lowercase is none of the above, check whether it is equal to '!upvote' or '!cheers'
    //         // these are used to  like certain users' messages or celebrate them due to an achievement

    //     default:
    //         // We shall convert the message into a string in which we shall check for its first word
    //         // and use the others for output
    //         let mymessage = message.toString();

    //         // We shall split the input message and check the string before the space if it is equal to '!upvote' or 'upvote'
    //         if ((mymessage.split(' ')[0]).toLowerCase() === '!upvote' || 'upvote') {

    //             // You can add some emojis which will appear in the chat using their emoji names
    //             // For example "PopCorn" or "TwitchLit" (fire emoji)
    //             // We shall then take the first and second strings after the space and display them together with the username
    //             // This shall output 'fireEmoji first_name second_name fireEmoji you have been UPVOTED by USERNAME'
    //             client.say(channel, `TwitchLit @${(mymessage.split(' ')[1] + '_' + mymessage.split(' ')[2])} TwitchLit  you have been UPVOTED by ${ tags.username }`);

    //             // We shall check if it is !cheer or cheers
    //             // If so, we shall display beer emojis (HSCheers) and messages
    //             // The bots output shall be 'beerEmoji first_name second_name beerEmoji you have been UPVOTED by USERNAME'
    //         } else if ((mymessage.split(' ')[0]).toLowerCase() === '!cheer' || 'cheers') {
    //             console.log(`HSCheers @${(mymessage.split(' ')[1] + '_' + mymessage.split(' ')[2])} HSCheers you have been UPVOTED by ${ tags.username }`);
    //         }
    //         break;
  }
});
