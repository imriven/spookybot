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

// personalized commands

export function maninchair(client, channel) {
    client.say(
      channel,
      "Each stream is a large celebration! Almost as large as my heart! Come visit me at https://www.twitch.tv/afatmaninachair"
    );
  }
  
  export function angry(client, channel) {
    client.say(
      channel,
      "I'm an awesome Tekken player but Tekken makes me rage... Come watch! https://www.twitch.tv/angrytxicchaobla"
    );
  }
  
  export function arisu(client, channel) {
    client.say(
      channel,
      "I'm an artist! Check out the awesome art I did for Rockagoth's banner and panels. Follow me at https://www.twitch.tv/arisu_eva"
    );
  }
  
  export function canniman(client, channel) {
    client.say(
      channel,
      "I'm a badass Tekken (Asuka) player and I play in Street Fighter (Cammy) tournies too. Check me out at https://www.twitch.tv/canniman777"
    );
  }
  
  export function cleveland(client, channel) {
    client.say(
      channel,
      "I'm a fun & awesome Eddie main in Tekken and I play a varitety of games Come hangout https://www.twitch.tv/clevelandman98"
    );
  }
  
  export function clutchworld(client, channel) {
    client.say(
      channel,
      "Extreme streams and extreme support!!! Visit clutchworld and you won't leave the same! Visit at https://www.twitch.tv/clutchworld"
    );
  }
  
  export function elise(client, channel) {
    client.say(
      channel,
      "Sweet and Savage come see me play https://www.twitch.tv/definitelynotelsie"
    );
  }
  
  export function deuzex(client, channel) {
    client.say(
      channel,
      "Counter Strike afficionado aka Mr.Goth. I don't stream often but follow me at https://www.twitch.tv/deuzex85"
    );
  }
  
  export function devilz(client, channel) {
    client.say(
      channel,
      "It's hard to fit all these fps skills into one person come bear witness https://www.twitch.tv/devilzneverdie"
    );
  }
  
  export function daoist(client, channel) {
    client.say(
      channel,
      "The ultimate chill and kind hearted streamer, Streaming a variety of games, https://www.twitch.tv/daoistguardian."
    );
  }
  
  export function free(client, channel) {
    client.say(
      channel,
      "I'm an awesome varitety streamer that plays rare and unique come watch me play https://www.twitch.tv/freeside11"
    );
  }
  
  export function gang(client, channel) {
    client.say(
      channel,
      "You can't handle my style or my Lili visit me and see https://www.twitch.tv/gang_mediator"
    );
  }
  
  export function gmike(client, channel) {
    client.say(
      channel,
      "I'm called gmoney for a reason! Come hang out and find out why. https://www.twitch.tv/gmike777hot"
    );
  }
  
  export function gooey(client, channel) {
    client.say(
      channel,
      "Fun person with a fun community! Watch me dominate World War Z. https://www.twitch.tv/gooey_43ttv"
    );
  }
  
  export function gucci(client, channel) {
    client.say(
      channel,
      "I'm an excellent variety streamer! Everything is Gucci when ur watching GucciGotTheFlu. https://www.twitch.tv/guccigottheflu"
    );
  }
  
  export function heavenly(client, channel) {
    client.say(
      channel,
      "My skills are heavenly! Come see why and follow me https://www.twitch.tv/heavenlyshinryu"
    );
  }
  
  export function hunter(client, channel) {
    client.say(
      channel,
      "Hunter is my name and shooters are my game come see me dominate counter strike and fortnite at https://www.twitch.tv/hunter_huntsman"
    );
  }
  
  export function ili(client, channel) {
    client.say(
      channel,
      "I'm the talented community artist with a range of skills come watch me art https://www.twitch.tv/ilidraws"
    );
  }
  
  export function john(client, channel) {
    client.say(
      channel,
      "Counter Strike afficionado aka Mr.Goth. I don't stream often but follow me at https://www.twitch.tv/johnharris85"
    );
  }
  
  export function k9(client, channel) {
    client.say(
      channel,
      "Badass military superstar with a big heart, a super loveable Huie, and lovely community come help us raise money for charity!  https://www.twitch.tv/k9_oneone"
    );
  }
  
  export function foxy(client, channel) {
    client.say(
      channel,
      "Badass Leo main come watch me dominate Tekken! https://www.twitch.tv/kamikifoxy92"
    );
  }
  
  export function khal(client, channel) {
    client.say(
      channel,
      "Down to earth variety streamer who is super chill, come and chill! https://www.twitch.tv/khalkatana"
    );
  }
  
  export function kidd(client, channel) {
    client.say(
      channel,
      "I hope you like your gameplay spicy because I bring the heat with everything I play. Come watch  https://www.twitch.tv/kiddrockets"
    );
  }
  
  export function based(client, channel) {
    client.say(
      channel,
      "This based indivdual as based Tekken gameplay come be the judge https://www.twitch.tv/kornhole_the_based"
    );
  }
  
  export function skittlez(client, channel) {
    client.say(
      channel,
      "Smooth voice with a chill and relaxed atmosphere with a large game base. Come and hangout https://www.twitch.tv/j_skittlezx3"
    );
  }
  
  export function light(client, channel) {
    client.say(
      channel,
      "I'm a cool af down to earth lbgtq streamer that shows off my BB skills in 2k but also play throwback games. Come hang out!  https://www.twitch.tv/l1ghtdatassup"
    );
  }
  
  export function lesser(client, channel) {
    client.say(
      channel,
      "I'm lesser known but big on Tekken skill and knowledge https://www.twitch.tv/lesserknown99"
    );
  }
  
  export function lilivy(client, channel) {
    client.say(
      channel,
      "I may be little but I've got a big personality and big sense of humor! Come see https://www.twitch.tv/littleivyy"
    );
  }
  
  export function mnr(client, channel) {
    client.say(
      channel,
      "I stepped on a Corn Flake and now I'm a cereal killer. Thought that was randomm? Well so are we check us out https://www.twitch.tv/magicninjarobot"
    );
  }
  
  export function chop(client, channel) {
    client.say(
      channel,
      "This world has been deprived of my voice acting for way too long. Come see for yourself https://www.twitch.tv/mong0lianchop"
    );
  }
  
  export function mustache(client, channel) {
    client.say(
      channel,
      "My streams are as amazing as my mustache https://www.twitch.tv/mustache_sergio"
    );
  }
  
  export function obscure(client, channel) {
    client.say(
      channel,
      "My fps skills are anything but obscure!!! Come see for yourself! https://www.twitch.tv/obscure_menace"
    );
  }
  
  export function panda(client, channel) {
    client.say(
      channel,
      "A party in panda form! Let's hang out! https://www.twitch.tv/pandashoesttv"
    );
  }
  
  export function pickle(client, channel) {
    client.say(
      channel,
      "Fun variety streamer with a heart of gold! Not literally tho! https://www.twitch.tv/picklefriction"
    );
  }
  
  export function rai(client, channel) {
    client.say(
      channel,
      "Savage, sassy, fun streamer that mods half of twitch. Come say hi! https://www.twitch.tv/raisunshine92"
    );
  }
  
  export function rocker(client, channel) {
    client.say(
      channel,
      "I work hard and play harder! Watch me dominate Overwatch! https://www.twitch.tv/rockergirlxoxo"
    );
  }
  
  export function rounin(client, channel) {
    client.say(
      channel,
      "Fun streams with a community that likes to torture me. Send help here https://www.twitch.tv/rouninrex"
    );
  }
  
  export function savior(client, channel) {
    client.say(
      channel,
      "Fun streamer with a large community and a large heart. Come visit me https://www.twitch.tv/savior0420"
    );
  }
  
  export function shigs(client, channel) {
    client.say(
      channel,
      "Fun variety streamer with a bad ass Claudio and family friendly streams  https://www.twitch.tv/shigi44"
    );
  }
  
  export function smoke(client, channel) {
    client.say(
      channel,
      "Classy Lassy that likes to dominate apex. Come see these fps skills https://www.twitch.tv/smokeahontasx"
    );
  }
  
  export function spiku(client, channel) {
    client.say(
      channel,
      "Fun and unique conversations to be had with a variety of games!  https://www.twitch.tv/spikuzardoz"
    );
  }
  
  export function subboy(client, channel) {
    client.say(
      channel,
      "Not just a baddass Tekken player that streams a variety of games. Come for the conversation stay for the company  https://www.twitch.tv/spikuzardoz"
    );
  }
  
  export function surge(client, channel) {
    client.say(
      channel,
      "My Lili unlike anything you've ever seen. Watch me get her to TGO!  https://www.twitch.tv/surget7"
    );
  }
  
  export function t7g(client, channel) {
    client.say(
      channel,
      "Talented, spicy and savage I always bring it no matter the game! There's always a surprise in store, come see and check out my new mods! https://www.twitch.tv/t7g_"
    );
  }
  
  export function wardeness(client, channel) {
    client.say(
      channel,
      "Sweet, kind, and talented variety streamer. Currently giggling my way through hollow knight one boss at a time. https://www.twitch.tv/the_wardeness"
    );
  }
  
  export function viking(client, channel) {
    client.say(
      channel,
      "Burly biker but kind hearted and nice,I love good conversation and I don't scare easily https://www.twitch.tv/the_angry_viking_biker"
    );
  }
  
  export function chance(client, channel) {
    client.say(
      channel,
      "Chance is the name and fighting game are my thing. So much knowledge and skill in these two hands. Come see https://www.twitch.tv/thecriticalchance"
    );
  }
  
  export function gil(client, channel) {
    client.say(
      channel,
      "A conversationalist and enjoyer of a variety of games but mostly I just dominate Apex come see! https://www.twitch.tv/thegiiil"
    );
  }
  
  export function timber(client, channel) {
    client.say(
      channel,
      "Kind streamer with a big heart. Fun friendly and wholesome streams for every one! https://www.twitch.tv/timberbrick"
    );
  }
  
  export function tisagh(client, channel) {
    client.say(
      channel,
      "Fun and interesting streamer with and awesome community! Playing Tekkend and a variety of games... PC only lol.https://www.twitch.tv/tisagh"
    );
  }
  
  export function tnt(client, channel) {
    client.say(
      channel,
      "Apex afficionado that warns others to pray and spray when they come my way! https://www.twitch.tv/tntrambo"
    );
  }
  
  export function xpert(client, channel) {
    client.say(
      channel,
      "Not just an expert Tekken player, but an awesome streamer and person to know! https://www.twitch.tv/xpertj"
    );
  }
  
  export function storm(client, channel) {
    client.say(
      channel,
      "I bring love and support everywhere I go! New to streaming, player of fps, come show the love! https://www.twitch.tv/xwfx_stormgaming"
    );
  }
  
  export function urmom(client, channel) {
    client.say(
      channel,
      "Energetic, fun, and friendly! Down to chat, game and hangout! https://www.twitch.tv/yourmom77665"
    );
  }
  
export function help(client, channel, tags) {
    let splitHelp = message.split(" ")
    if (splitHelp.length == 1) {
        client.say(
            channel,
            `${ tags.username }, Quick Help: `
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
            `!hug: Insert username after command`);
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
            `Counter Help: `);
        client.say(
            channel,
            `!counter: displays counters that have been created`);
        client.say(
            channel,
            `!counter counterName: Creates counter with value of 0`);
        client.say(
            channel,
            `!counter counterName + NUMBER: Creates counter with value of NUMBER if the counter doesn't exist, if counter already exist this command will add the NUMBER to the counter`);
    client.say(
        channel,
        `!counter counterName -NUMBER: Will subtract NUMBER from counter`);
    client.say(
        channel,
        `!counter counterName delete: Will delete counter`);
}
}