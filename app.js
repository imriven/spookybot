const Data = require('./data');
// Require necessary node modules
// Make the variables inside the .env element available to our Node project
require('dotenv').config();

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
    "kamikifoxy92"
]

const tmi = require('tmi.js');

// COUNTER: 
// - We need to create something that will hold our counters
// - Const or let? Are we going to need to modify it?
// - Should it be an array or an object? What are the advantages / disadvantages for each? What's easier? How are we likely to access them?
// - What data do we need to store in it? Creator, count, name, maybe the time it was created? (so we can clean up old ones)

// Timers
// COUNTER:
// - If you decided to store the creation time, do we need a timer to run every so often to clear expired counters?
// - How often? How is it going to find expired ones?

function tyTimer() {
    let ty = "Thank you so much for stopping by and hanging out! 🎉"
    client.say("#rock_a_goth", ty);
}

function followTimer() {
    let follow = "✨ Please FOLLOW to show your support! ✨ Thank You! 🤗"
    client.say("#rock_a_goth", follow);
}

function rulesTimer() {
    let rules = "This is a place of positivity - Leave the negative vibes at the door!"
    client.say("#rock_a_goth", rules);
}

function spookyTimer() {
    let spooky = "Hey I'm Spooky. I ate nightbot... Well parts... It can do some commands but I'm better. Type in the word, commands to see what I can do! "
    client.say("#rock_a_goth", spooky);
}
  
function spookyIntervalFunc() {
    let factIndex = Math.floor(Math.random() * (Data.length - 0 + 1) + 0)
    let fact = Data[factIndex]
    client.say("#rock_a_goth", fact);
}


// Setup connection configurations
// These include the channel, username and password
const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },

    // Lack of the identity tags makes the bot anonymous and able to fetch messages from the channel
    // for reading, supervision, spying, or viewing purposes only
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `oauth:${process.env.TWITCH_OAUTH}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

// Connect to the channel specified using the setings found in the configurations
// Any error found shall be logged out in the console
client.connect().catch(console.error);

//call timer functions
setInterval(spookyIntervalFunc, 900000); //15 mins
setInterval(followTimer, 18000000); //30
setInterval(spookyTimer, 24000000); //40
setInterval(tyTimer, 27000000); //45
setInterval(rulesTimer, 36000000); //60



// When the bot is on, it shall fetch the messages send by user from the specified channel
client.on('message', (channel, tags, message, self) => {
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

        case 'commands':
            client.say(channel, `@${tags.username}, available commands are:
            - commands - help - !lurk - !socials - !spooky - !slap user - !so user - !name - !spooky - For more info just type "help"
            `);
            break;
            
            // In case the message in lowercase is equal to the string '!website', send the sender of that message your personal website
        case '!lurk':
            client.say(channel, `@${tags.username}, has entered the shadowy realm of the LURK,  ever watching, ever present, but silent among the mists...  Thank you for the support and LURK ON!`);
            break;

        case '!socials':
                client.say(channel, `visit my linktree for my socials! https://linktr.ee/rockagoth`);
                break;
            
        //     // In case the message in lowercase is equal to the string 'greetings', send the sender of that message 'Hello @Username, what's up?!'
        // case 'greetings':
        //     client.say(channel, `Hello @${tags.username}, what's up?!`);
        //     break;

        // case '!sexybear':
        //     client.say(channel, `@${tags.username}, Nina is the sexy bear!`);
        //     break;

        // case '!kitty':
        //     client.say(channel, `LEILA BEAR!`);
        //     break;

        case '!spooky':
            let factIndex = Math.floor(Math.random() * (Data.length - 0 + 1) + 0)
            let fact = Data[factIndex]
            client.say(channel, fact);
            break;
        
            // In case the message in lowercase is equal to the string 'hi', send the sender of that message 'Username, hola'

        case '!slap':
            if (!vips.includes(tags.username)) {
                client.say(channel, "Must be a Sub, VIP or Mod to slap someone")
                break;
            }
            let slappedUser = message.split(" ")[1]
            client.say(channel, `${slappedUser} just got slapped by ${tags.username}`);
            break;

        case '!so':
            if (!vips.includes(tags.username)) {
                client.say(channel, "Must be a VIP or Mod to give shoutout")
                break;
            }
            let soUser = message.split(" ")[1]
            client.say(channel, `Please check out and follow ${soUser} at Twitch.tv/${soUser}`);
            break;
            
            // In case the message in lowercase is equal to the string '!name', send the sender of that message the name of the chatbot
        case '!name':
            client.say(channel, `Hello @${tags.username}, my name is SpookyBot! Boo!`);
            break;

        // COUNTER: 
        // - We need a new command for our counters. What should we call it?
        // - We'll also need to split the command into all it's pieces (see structure below), how can we do that and save each 'piece' (counter name, value, etc...)
        // - What's the structure of our counter messages going to be? !counter <counter> <value>? Or maybe !counter <command, delete, create etc...?> <counter>?
        // - Who can manipulate counters? Who can create them? Who can add / subtract from them? Who can delete them?
        // - What are the different things I can do with counters? Create, add / subtract, list, delete, etc..., any others? We should handle each case one 
        // at a time and make sure we cover all the requirements.
        // - We need to make sure counters can't go negative, either at the start or as people subtract from them.
        // - Message text is always a string, if we need to do math on the input (to add / subtract / keep track of totals) what do we need to do?
            
            // In case the message in lowercase is equal to the string 'help', send the sender of that message all the available help and commands
        case 'help':
            client.say(channel, `${tags.username}, Quick Help:

            commands: Get Commands || 
            help: Get Help || 
            !spooky: Get random spooky fact || 
            !lurk: Lurk Mode ||     }
            !socials: My Linktree || 
            !slap: Insert username after command - SUB, VIP, MOD only || 
            !so: Give yourself a shoutout - SUB, VIP, MOD only ||
            !name: Spookybot wants to say hi

            `);
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