import { dailyTips, exercises, spookyFacts, streamerNotifications } from "../data.js";

export const DEFAULT_TIMERS = [
  {
    name: "thanks",
    message: "Thank you so much for stopping by and hanging out! 🎉",
    intervalMs: 7000000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
  {
    name: "follow",
    message: "✨ Please FOLLOW to show your support! ✨ Thank You! 🤗",
    intervalMs: 4700000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
  {
    name: "rules",
    message: "This is a place of positivity - Leave the negative vibes at the door!",
    intervalMs: 6600000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
  {
    name: "socials",
    message: "Check out RockAGoth's website! https://www.rockagoth.com",
    intervalMs: 5100000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
  {
    name: "welcome",
    message:
      "Welcome to the Basement! We are a fun and friendly community of gamers and streamers! Rockagoth is happy to be your host and get to know you! Don't be too afraid to say hi! Thank you for coming!",
    intervalMs: 4380000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
  {
    name: "mst",
    message:
      "Born from a passion for competition and camaraderie, MechaStormTitan is more than just a Tekken team based in the PSW—it's a movement!Join us and together we'll unleash the storm! https://www.twitch.tv/mechastormtitan",
    intervalMs: 6350000,
    channel: null,
    enabled: true,
    liveOnly: true,
  },
];

export const DEFAULT_CUSTOM_SHOUTOUTS = {
  hubby:
    "Counter Strike afficionado aka Mr.Goth. I don't stream often but follow me at https://www.twitch.tv/deuzex85",
  devilz:
    "It's hard to fit all these fps skills into one person come bear witness https://www.twitch.tv/devilzneverdie",
  free: "I'm an awesome variety streamer that plays rare and unique come watch me play https://www.twitch.tv/freeside11",
  gang: "You can't handle my style or my Lili visit me and see https://www.twitch.tv/gang_mediator",
  gmike: "I'm called gmoney for a reason! Come hang out and find out why. https://www.twitch.tv/gmike777hot",
  gooey: "Fun person with a fun community! Watch me dominate World War Z. https://www.twitch.tv/gooey_43ttv",
  heavenly: "My skills are heavenly! Come see why and follow me https://www.twitch.tv/heavenlyshinryu",
  hunter:
    "Hunter is my name and shooters are my game come see me dominate counter strike and fortnite at https://www.twitch.tv/hunter_huntsman",
  ili: "I'm the talented community artist with a range of skills come watch me art https://www.twitch.tv/ilidraws",
  k9: "Badass military superstar with a big heart, a super loveable Huie, and lovely community come help us raise money for charity!  https://www.twitch.tv/k9_oneone",
  foxy: "Badass Leo main come watch me dominate Tekken! https://www.twitch.tv/kamikifoxy92",
  kidd: "I hope you like your gameplay spicy because I bring the heat with everything I play. Come watch  https://www.twitch.tv/kiddrockets",
  based: "This based indivdual as based Tekken gameplay come be the judge https://www.twitch.tv/kornhole_the_based",
  light:
    "I'm a cool af down to earth lbgtq streamer that shows off my BB skills in 2k but also play throwback games. Come hang out!  https://www.twitch.tv/l1ghtdatassup",
  lesser: "I'm lesser known but big on Tekken skill and knowledge https://www.twitch.tv/lesserknown99",
  lilivy: "I may be little but I've got a big personality and big sense of humor! Come see https://www.twitch.tv/littleivyy",
  mnr: "I stepped on a Corn Flake and now I'm a cereal killer. Thought that was randomm? Well so are we check us out https://www.twitch.tv/magicninjarobot",
  mustache: "My streams are as amazing as my mustache https://www.twitch.tv/mustache_sergio",
  obscure: "My fps skills are anything but obscure!!! Come see for yourself! https://www.twitch.tv/obscure_menace",
  panda: "A party in panda form! Let's hang out! https://www.twitch.tv/pandashoesttv",
  pickle: "Fun variety streamer with a heart of gold! Not literally tho! https://www.twitch.tv/picklefriction",
  rai: "Savage, sassy, fun streamer that mods half of twitch. Come say hi! https://www.twitch.tv/raisunshine92",
  rounin: "Fun streams with a community that likes to torture me. Send help here https://www.twitch.tv/rouninrex",
  drew:
    "Talented, spicy and savage I always bring it no matter the game! There's always a surprise in store, come see and check out my new mods! https://www.twitch.tv/drews_rebirth_gaming",
  wardeness:
    "Sweet, kind, and talented variety streamer. Currently giggling my way through hollow knight one boss at a time. https://www.twitch.tv/the_wardeness",
  viking:
    "Burly biker but kind hearted and nice,I love good conversation and I don't scare easily https://www.twitch.tv/the_angry_viking_biker",
  gil: "A conversationalist and enjoyer of a variety of games but mostly I just dominate Apex come see! https://www.twitch.tv/thegiiil",
  tisagh:
    "Fun and interesting streamer with and awesome community! Playing Tekkend and a variety of games... PC only lol.https://www.twitch.tv/tisagh",
  tnt: "Apex afficionado that warns others to pray and spray when they come my way! https://www.twitch.tv/tntrambo",
  xpert:
    "Not just an expert Tekken player, but an awesome streamer and person to know! https://www.twitch.tv/xpertj",
  storm:
    "I bring love and support everywhere I go! New to streaming, player of fps, come show the love! https://www.twitch.tv/xwfx_stormgaming",
  timber:
    "Kind streamer with a big heart. Fun friendly and wholesome streams for every one! https://www.twitch.tv/timberbrick",
  vinnie:
    "super friendly and genuine streamer, playing tekken and street fighter in a very talented fighting game community https://www.twitch.tv/vinniescwluke",
  jace: "fun, energectic and bubbly, come join my community! https://www.twitch.tv/jaceiswimpy",
  dbk: "The Goat of commentators LFG!!! https://www.twitch.tv/devilbillykazama",
  grabz: "They call me Yeetah Cheetah for a reason! Come find out why https://www.twitch.tv/grabzttv",
  fairly: "Sweet and kind but savage at WOW: Come check me out! https://www.twitch.tv/fairlyasian",
  billion:
    "I'm one of a kind, unique and one in a billion! Come join me for the vibes! https://www.twitch.tv/billionth_",
  ra: "Variety streamer with a tiktok that has chill vibes! Reaching for affilate please help me grow! https://www.twitch.tv/ranotraw",
  neo: "My chat likes to bully me but that's because I abuse my mods. Come hangout and chill! https://www.twitch.tv/neovergil09",
  ruby:
    "Cage Free Warrior who mains Tekken 7 Eliza and Tekken 8 Jin with a kind and supportive community! Join us! https://www.twitch.tv/argubleruby68",
  super:
    "I draw, I game, and create charchters while having a heart of gold, Look what I can do! https://www.twitch.tv/superweapon667",
  tuffer:
    "I'm one of a kind, unique and one in a billion! Come join me for the vibes! https://www.twitch.tv/tuffermrdeano",
  zesty:
    "Rock calls me Zesty for my zesty and spicy personality. Come through and see what i've got for you. https://www.twitch.tv/zehster",
  ytr: "Drag main with a heart of gold! Check out YourThatRussian! https://www.twitch.tv/yourthatrussian",
  soundcloud: "Check out l1ght's sound cloud https://soundcloud.com/special-ops-1",
  mental: "becoming a master upon yoshis in tekken! Follow my journey: https://www.twitch.tv/mentalgamingttv",
  seattletekken: "Check out Seattle Tekken! Live Matches every Thursday! https://www.twitch.tv/seattletekken",
  mst: "MechaStormTitan is just beginning our Tekken journey! Join us to see us come together and shine! Unleash the Storm and catch the action! https://www.twitch.tv/mechastormtitan",
  mstErebus: "King Main and Co-Founder & Fellow MechaStormTitan teammate Come get to me!. https://www.twitch.tv/msterebus",
  hurricane:
    "Major will rock you like a hurricane with his Kuma! MST Co-Founder & Member, Come check me out! https://www.twitch.tv/majorhurricanetv",
  soulz:
    "Part of the CFW Crew, Rocky nicknamed my fists pain and regret, follow me and find out why, https://www.twitch.tv/soulznitroz ",
  comic: "Into manga and anime, come hangout and enjoy the chill vibes and great conversation!",
  mstTytan: "Co-Founder & MechaStormTitan Teammate! Come get to know me! https://www.twitch.tv/tytanjay",
  mstAngel: "Fellow MechaStormTitan teammate! Come get to know me! https://www.twitch.tv/ooangelxoo",
  mstLee: "Fellow MechaStormTitan teammate! Come get to know me! https://www.twitch.tv/lbp_tk",
  mstCav: "Fellow MechaStormTitan teammate! Come get to know me! https://www.twitch.tv/azamikimura",
  mstMitch: "Fellow MechaStormTitan teammate! Come get to know me! https://www.twitch.tv/bandupmitch",
  nicc: "Talent and vision that flows from the tip to the refined styles of the future. Check out my designs! https://www.instagram.com/uniquelyme2b21?igsh=ZXg3a3VpYzgxM3R5",
  glitter: "Kind and bubbly I play Balder's gate and more! I have a fun and non toxic community! Come stop by! https://www.twitch.tv/theglitterpanda",
  mayhem:
    "Was a law main and upgraded to Fauk. I help keep rock's skills up with regular first to 5's!! Check out my gameplay!!! https://www.twitch.tv/mayhem313",
  hasty:
    "Tekken and Variety streamer who is second to none not even Tasty Steve. Come hangout and let's game! https://www.twitch.tv/hastysteve66",
  bruh: "They call me triple threat because I kill it in Tekken,Apex, and I create artwork and more with ease! Watch me work! https://www.twitch.tv/ayyeerr",
  plushie: "I kill it in Tekken and kill them all in Apex! Watch the chaos unfold! https://www.twitch.tv/pocketplushie",
};

export const DEFAULT_STREAMER_NOTIFICATIONS = streamerNotifications;
export const DEFAULT_FACTS = spookyFacts;
export const DEFAULT_EXERCISES = exercises;
export const DEFAULT_TIPS = dailyTips;
