/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("status").del().then(function () {
    // Inserts seed entries
    return knex("status").insert([
      { name: "urmom", shoutout: "Energetic, fun, and friendly! Down to chat, game and hangout! https://www.twitch.tv/yourmom77665" },
      { name: "maninchair", shoutout: "Each stream is a large celebration! Almost as large as my heart! Come visit me at https://www.twitch.tv/afatmaninachair" },
      { name: "angry", shoutout: "I'm an awesome Tekken player but Tekken makes me rage... Come watch! https://www.twitch.tv/angrytxicchaobla" },
      { name: "arisu", shoutout: "I'm an artist! Check out the awesome art I did for Rockagoth's banner and panels. Follow me at https://www.twitch.tv/arisu_eva" },
      { name: "canniman", shoutout: "I'm a badass Tekken (Asuka) player and I play in Street Fighter (Cammy) tournies too. Check me out at https://www.twitch.tv/canniman777" },
      { name: "cleveland", shoutout: "I'm a fun & awesome Eddie main in Tekken and I play a varitety of games Come hangout https://www.twitch.tv/clevelandman98" },
      { name: "clutchworld", shoutout: "Extreme streams and extreme support!!! Visit clutchworld and you won't leave the same! Visit at https://www.twitch.tv/clutchworld" },
      { name: "elise", shoutout: "Sweet and Savage come see me play https://www.twitch.tv/definitelynotelsie" },
      { name: "hubby", shoutout: "Counter Strike afficionado aka Mr.Goth. I don't stream often but follow me at https://www.twitch.tv/deuzex85" },
      { name: "devilz", shoutout: "It's hard to fit all these fps skills into one person come bear witness https://www.twitch.tv/devilzneverdie" },
      { name: "free", shoutout: "I'm an awesome variety streamer that plays rare and unique come watch me play https://www.twitch.tv/freeside11" },
      { name: "daoist", shoutout: "The ultimate chill and kind hearted streamer, Streaming a variety of games, https://www.twitch.tv/daoistguardian." },
      { name: "gang", shoutout: "You can't handle my style or my Lili visit me and see https://www.twitch.tv/gang_mediator" },
      { name: "gmike", shoutout: "I'm called gmoney for a reason! Come hang out and find out why. https://www.twitch.tv/gmike777hot" },
      { name: "gooey", shoutout: "Fun person with a fun community! Watch me dominate World War Z. https://www.twitch.tv/gooey_43ttv" },
      { name: "gucci", shoutout: "I'm an excellent variety streamer! Everything is Gucci when ur watching GucciGotTheFlu. https://www.twitch.tv/guccigottheflu" },
      { name: "heavenly", shoutout: "My skills are heavenly! Come see why and follow me https://www.twitch.tv/heavenlyshinryu" },
      { name: "hunter", shoutout: "Hunter is my name and shooters are my game come see me dominate counter strike and fortnite at https://www.twitch.tv/hunter_huntsman" },
      { name: "ili", shoutout: "I'm the talented community artist with a range of skills come watch me art https://www.twitch.tv/ilidraws" },
      { name: "k9", shoutout: "Badass military superstar with a big heart, a super loveable Huie, and lovely community come help us raise money for charity!  https://www.twitch.tv/k9_oneone" },
      { name: "foxy", shoutout: "Badass Leo main come watch me dominate Tekken! https://www.twitch.tv/kamikifoxy92" },
      { name: "khal", shoutout: "Down to earth variety streamer who is super chill, come and chill! https://www.twitch.tv/khalkatana" },
      { name: "kidd", shoutout: "I hope you like your gameplay spicy because I bring the heat with everything I play. Come watch  https://www.twitch.tv/kiddrockets" },
      { name: "based", shoutout: "This based indivdual as based Tekken gameplay come be the judge https://www.twitch.tv/kornhole_the_based" },
      { name: "skittlez", shoutout: "Smooth voice with a chill and relaxed atmosphere with a large game base. Come and hangout https://www.twitch.tv/j_skittlezx3" },
      { name: "light", shoutout: "I'm a cool af down to earth lbgtq streamer that shows off my BB skills in 2k but also play throwback games. Come hang out!  https://www.twitch.tv/l1ghtdatassup" },
      { name: "lesser", shoutout: "I'm lesser known but big on Tekken skill and knowledge https://www.twitch.tv/lesserknown99" },
      { name: "lilivy", shoutout: "I may be little but I've got a big personality and big sense of humor! Come see https://www.twitch.tv/littleivyy" },
      { name: "mnr", shoutout: "I stepped on a Corn Flake and now I'm a cereal killer. Thought that was randomm? Well so are we check us out https://www.twitch.tv/magicninjarobot" },
      { name: "chop", shoutout: "This world has been deprived of my voice acting for way too long. Come see for yourself https://www.twitch.tv/mong0lianchop" },
      { name: "mustache", shoutout: "My streams are as amazing as my mustache https://www.twitch.tv/mustache_sergio" },
      { name: "obscure", shoutout: "My fps skills are anything but obscure!!! Come see for yourself! https://www.twitch.tv/obscure_menace" },
      { name: "panda", shoutout: "A party in panda form! Let's hang out! https://www.twitch.tv/pandashoesttv" },
      { name: "pickle", shoutout: "Fun variety streamer with a heart of gold! Not literally tho! https://www.twitch.tv/picklefriction" },
      { name: "rai", shoutout: "Savage, sassy, fun streamer that mods half of twitch. Come say hi! https://www.twitch.tv/raisunshine92" },
      { name: "rocker", shoutout: "I work hard and play harder! Watch me dominate Overwatch! https://www.twitch.tv/rockergirlxoxo" },
      { name: "rounin", shoutout: "Fun streams with a community that likes to torture me. Send help here https://www.twitch.tv/rouninrex" },
      { name: "savior", shoutout: "Fun streamer with a large community and a large heart. Come visit me https://www.twitch.tv/savior0420" },
      { name: "shigs", shoutout: "Fun variety streamer with a bad ass Claudio and family friendly streams  https://www.twitch.tv/shigi44" },
      { name: "smoke", shoutout: "Classy Lassy that likes to dominate apex. Come see these fps skills https://www.twitch.tv/smokeahontasx" },
      { name: "spiku", shoutout: "Fun and unique conversations to be had with a variety of games! https://www.twitch.tv/spikuzardoz" },
      { name: "subboy", shoutout: "Not just a baddass Tekken player that streams a variety of games. Come for the conversation stay for the company https://www.twitch.tv/spikuzardoz" },
      { name: "surge", shoutout: "My Lili unlike anything you've ever seen. Watch me get her to TGO!  https://www.twitch.tv/surget7" },
      { name: "t7g", shoutout: "Talented, spicy and savage I always bring it no matter the game! There's always a surprise in store, come see and check out my new mods! https://www.twitch.tv/t7g_" },
      { name: "wardeness", shoutout: "Sweet, kind, and talented variety streamer. Currently giggling my way through hollow knight one boss at a time. https://www.twitch.tv/the_wardeness" },
      { name: "viking", shoutout: "Burly biker but kind hearted and nice,I love good conversation and I don't scare easily https://www.twitch.tv/the_angry_viking_biker" },
      { name: "chance", shoutout: "Chance is the name and fighting game are my thing. So much knowledge and skill in these two hands. Come see https://www.twitch.tv/thecriticalchance" },
      { name: "gil", shoutout: "A conversationalist and enjoyer of a variety of games but mostly I just dominate Apex come see! https://www.twitch.tv/thegiiil" },
      { name: "tisagh", shoutout: "Fun and interesting streamer with and awesome community! Playing Tekkend and a variety of games... PC only lol.https://www.twitch.tv/tisagh" },
      { name: "tnt", shoutout: "Apex afficionado that warns others to pray and spray when they come my way! https://www.twitch.tv/tntrambo" },
      { name: "xpert", shoutout: "Not just an expert Tekken player, but an awesome streamer and person to know! https://www.twitch.tv/xpertj" },
      { name: "storm", shoutout: "I bring love and support everywhere I go! New to streaming, player of fps, come show the love! https://www.twitch.tv/xwfx_stormgaming" },
      { name: "timber", shoutout: "Kind streamer with a big heart. Fun friendly and wholesome streams for every one! https://www.twitch.tv/timberbrick" }
    ]);
  });
};

