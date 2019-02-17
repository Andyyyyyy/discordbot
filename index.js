const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true });
const token = require('./token');
const fs = require("fs");
const redditKey = require('./redditKey');
const snoowrap = require('snoowrap');
const weather = require('weather-js');
const UrbanDictionary = require('easyurban');
const dictionary = new UrbanDictionary;
const wiki = require('wikijs').default;

const shoutBackRegEx = /^[A-Z ]+$/;
let intervalCount = 0;

/**
 * Load server settings
 */
let serversJSON = fs.readFileSync('./servers.json');
serversJSON = JSON.parse(serversJSON);

let servers = {}; //server classes dict

/** Server Class */
const server = function(id) {
    this.id = id;
    this.memeChannel = "";
    this.shoutback = true;
    this.nsfw = false;
}

let r = new snoowrap({
    userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9b5pre) Gecko/2008030706 Firefox/3.0b5pre',
    clientId: redditKey.id,
    clientSecret: redditKey.secret,
    username: redditKey.username,
    password: redditKey.password
});

const oof = ['https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3', 'https://www.myinstants.com/media/sounds/sm64_mario_oof.mp3', 'https://www.myinstants.com/media/sounds/classic_hurt.mp3']

const commands = [
    "!help",
    "!ping",
    "!hmmm",
    "!dafuq",
    "!vid",
    "!meirl",
    "!dank",
    "!deepfry",
    "!kitty",
    "!doggo",
    "!nicememe",
    "!oof",
    "!bruh",
    "!source",
    "!poll <question>",
    "!weather <location>",
    "!reddit <subreddit>",
    "!define <term>",
    "!wiki <term>"
];
let commandsString = "List of commands:";

for (let cmd of commands) {
    commandsString += "\n``" + cmd + "``";
}
commandsString += `
----------------
Admin commands:
\`!setmemechannel\` - turns hourly posts on and sets the bots 'auto meme' channel (off by default)
\`!resetmemechannel\` - turns hourly posts off (why)
\`!shoutback\` - turns 'shoutback' on/off (on by default)
\`!nsfw\` - allows NSFW posts from !reddit command (off by default, works only in NSFW channels)
Bot by awieandy#4205`;

/** On bot start up */
client.on('ready', () => {
    console.log(`Bot started.`);
    console.log(`Logged in as ${client.user.tag}!`);
    loadServers();
    setPresenceText(`ayy lmao`);
});

/**
 * Bot joines a Discord server
 */
client.on('guildCreate', (guild) => {
    //create new server instance
    let newServer = new server(guild.id);
    servers["" + guild.id] = newServer;
    serversToJson();

    console.log(`Bot added to  ${guild.name}`);

    //Send help text into default text channel
    let defaultChannel = guild.channels.find(e => {
        return e.type === "text" && e.permissionsFor(guild.me).has(`SEND_MESSAGES`)
    });

    if (defaultChannel != null) {
        defaultChannel.send(commandsString);
    }
});

/**
 * Bot gets kicked from Discord server
 */
client.on('guildDelete', guild => {
    delete servers["" + guild.id];
    serversToJson();
    console.log(`Bot kicked from ${guild.name}`);
});

/**
 * Respond to incoming messages f.e. commands
 */
client.on('message', msg => {
    //debug
    /* if (msg.content === 'test') {
        sendHourlyMemes('DEBUG');
    } */

    //commands - messages that start with '!'
    if (msg.content[0] == "!") {
        if (msg.content === '!ping') {
            msg.channel.send('Pong 🏓');
        } else if (msg.content === '!help') {
            msg.reply(commandsString);
        } else if (msg.content === '!hmmm') {
            r.getSubreddit('hmmm').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("🤔") }) });
        } else if (msg.content === '!dafuq') {
            r.getSubreddit('cursedimages').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("✝") }) });
        } else if (msg.content === '!meirl') {
            r.getSubreddit('me_irl').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("👀") }) });
        } else if (msg.content === '!vid') {
            r.getSubreddit('youtubehaiku').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("📼") }) });
        } else if (msg.content === '!deepfry') {
            r.getSubreddit('DeepFriedMemes').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("🍤") }) });
        } else if (msg.content === '!dank') {
            r.getSubreddit('dankmemes').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("💯") }) });
        } else if (msg.content === '!kitty') {
            r.getSubreddit('kitty').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("🐱") }) });
        } else if (msg.content === '!doggo') {
            r.getSubreddit('woof_irl').getRandomSubmission().url.then(data => { msg.channel.send(data).then(m => { m.react("🐶") }) });
        } else if (msg.content === '!joke') {
            r.getSubreddit('jokes').getRandomSubmission().then(data => {
                msg.channel.send(`*${data.title}*\n\n${data.selftext}`);
            });
        } else if (msg.content == "!source") {
            msg.reply("dankbot sourcecode: https://github.com/Andyyyyyy/discordbot")

        } else if (msg.content.split(" ")[0] === "!weather") {
            let location = msg.content.substring(9);
            if (location === "") {
                msg.channel.send("Usage: !weather <location>");
                return;
            }
            getWeather(location, msg);
        } else if (msg.content.split(" ")[0] === "!reddit") {
            let subreddit = msg.content.split(" ")[1];
            if (subreddit === undefined) {
                msg.channel.send("Usage: !reddit <subreddit>");
                return;
            }
            getRandomSubmission(subreddit, msg);

        } else if (msg.content.split(" ")[0] === "!define") {
            let term = msg.content.substring(8);
            if (term == "") {
                msg.channel.send("Usage: !define <term>");
                return;
            }
            udDefine(term, msg);
        } else if (msg.content.split(" ")[0] === "!wiki") {
            let term = msg.content.substring(6);
            if (term == "") {
                msg.channel.send("Usage: !wiki <term>");
                return;
            }
            wiki().page(term)
                .then(data => msg.channel.send(data.raw.fullurl))
                .catch(err => { msg.channel.send("⚠ Error. No article found.") })
        } else if (msg.content.split(" ")[0] === "!poll") {
            let question = msg.content.substring(6);
            if (question == "") {
                msg.channel.send("Usage: !poll <question>");
                return;
            }
            msg.channel.send(`**Poll:** ${question}`)
                .then(m => {
                    m.react("👍");
                    m.react("👎")
                });
        }
        /* Sound commands */
        else if (msg.content == "!oof") {
            let rand = Math.floor(Math.random() * (oof.length - 1 + 1));
            msg.channel.send("***OOF***");
            msg.channel.send({
                files: [oof[rand]]
            });
        } else if (msg.content == "!nicememe") {
            msg.channel.send("***Nice Meme!***");
            msg.channel.send({
                files: ['http://niceme.me/nicememe.mp3']
            });
        } else if (msg.content == "!bruh") {
            msg.channel.send("***BRUH***");
            msg.channel.send({
                files: ['https://www.myinstants.com/media/sounds/movie_1.mp3']
            });
        }
        /** 
         * Admin Commands 
         */
        else if (msg.content === "!setmemechannel") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("You don't have permissions for this action");
                return;
            }
            let currentServer = servers["" + msg.guild.id];
            currentServer.memeChannel = msg.channel.id;
            serversToJson();
            msg.channel.send("Meme channel set to this one.");
        } else if (msg.content === "!resetmemechannel") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("You don't have permissions for this action");
                return;
            }
            let currentServer = servers["" + msg.guild.id];
            currentServer.memeChannel = "";
            serversToJson();
            msg.channel.send("Hourly memes turned off (why tho).");
        } else if (msg.content === "!shoutback") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("You don't have permissions for this action");
                return;
            }
            let currentServer = servers["" + msg.guild.id];
            currentServer.shoutback = !currentServer.shoutback;
            serversToJson();
            msg.channel.send(`Shoutback has been turned ${currentServer.shoutback ? "on" : "off"}.`);
        } else if (msg.content === "!nsfw") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("You don't have permissions for this action");
                return;
            }
            let currentServer = servers["" + msg.guild.id];
            currentServer.nsfw = !currentServer.nsfw;
            serversToJson();
            msg.channel.send(`NSFW Posts are now ${currentServer.nsfw ? "allowed" : "forbidden"}.`);
        }
    }
    //Actions without command
    else if (msg.content === 'ayy') {
        msg.channel.send('lmao😂');
    } else if (msg.content === 'nice') {
        msg.react('🇳').then(() => {
            msg.react('🇮').then(() => {
                msg.react('🇨').then(() => {
                    msg.react('🇪')
                })
            })
        });
    } else if (msg.content === 'lmao') {
        msg.react('🇱').then(() => {
            msg.react('🇲').then(() => {
                msg.react('🇦').then(() => {
                    msg.react('🇵')
                })
            })
        });
    }
    //Shoutback
    else if (msg.content.length > 3 && shoutBackRegEx.test(msg.content)) {
        let currentServer = servers["" + msg.guild.id];
        if (currentServer.shoutback) {
            msg.channel.send(textToRegionalIndicator(msg.content));
        }
    }
});

client.on('error', err => {
    console.log('Error! ' + err.message);
});

client.on('disconnect', e => {
    console.log('disconnected.');
});

function sendHourlyMemes(text) {
    console.log("Sending out dem memes...");

    for (let s of Object.keys(servers)) {
        s = servers[s];
        if (s.memeChannel === "") continue;
        let thisServer = client.guilds.get(s.id);
        let thisChannel = thisServer.channels.get(s.memeChannel);

        console.log(`Send meme to ${thisServer.name}`);
        thisChannel.send(text);
    }
}


let minuteInterval = setInterval(() => {
    intervalCount++;
    if (intervalCount === 60) {
        r.getTop("hmmm", { "time": "hour" })[0].url.then(function(data) { sendHourlyMemes(data) });
        intervalCount = 0;
    }
    if (intervalCount % 9 === 0) {
        setPresenceText(`Use !help for commands`);
    } else {
        setPresenceText(`Shitpost incoming in ${60-intervalCount} minutes`);
    }
}, 60 * 1000);


function loadServers() {
    for (let s of Object.keys(serversJSON)) {
        s = serversJSON[s];
        let newServer = new server(s.id);
        newServer.memeChannel = s.memeChannel;
        newServer.shoutback = s.shoutback;
        newServer.nsfw = s.nsfw;
        servers["" + s.id] = newServer;
    }
}

function textToRegionalIndicator(text) {
    let lower = text.toLowerCase();
    let output = "";
    for (let i = 0; i < lower.length; i++) {
        let char = lower.charAt(i);
        if (char === " ") {
            output += char;
        } else {
            output += ":regional_indicator_" + char + ": ";
        }
    }
    return output;
}

function setPresenceText(text) {
    client.user.setPresence({ game: { name: text, type: 'WATCHING' }, status: 'online' });
}

function getWeather(location, msg) {
    let output = "";
    weather.find({ search: location, degreeType: 'C' }, function(err, result) {
        if (err) {
            console.log(err);
            output = "Error";
        } else {
            result = result[0];
            if (result === undefined) {
                msg.channel.send("? Unknown location.");
                return;
            }
            output = `In **${result.location.name}** it's **${result.current.temperature} °C** and ${result.current.skytext}.`
            output += "\n__Forecast:__"
            for (let i = 2; i < 5; i++) {
                output += `\n**${result.forecast[i].day}:** ${result.forecast[i].skytextday} at **${result.forecast[i].low}** to **${result.forecast[i].high} °C**`;
            }
        }
        msg.channel.send(output);
    });
}

function udDefine(term, msg) {
    dictionary.lookup(term)
        .then(result => {
            if (result.list.length == 0) {
                msg.channel.send("Couldn't find definition for " + term);
                return;
            }
            let definition = `**${result.list[0].word}**:
${result.list[0].definition}
Example: *${result.list[0].example}*`;
            definition = definition.replace(/\[/g, "");
            definition = definition.replace(/\]/g, "");
            msg.channel.send(definition);
        })
        .catch(console.error);
}

function serversToJson() {
    fs.writeFileSync('servers.json', JSON.stringify(servers));
}

function getRandomSubmission(subreddit, msg) {
    r.getSubreddit(subreddit).getRandomSubmission()
        .then(data => {
            if (data.url === undefined) {
                msg.channel.send("Subreddit does not exist or Reddit API fucks around");
                return;
            }
            if (msg.channel.type == "text") {
                if (data.over_18) {
                    if (!servers["" + msg.guild.id].nsfw) {
                        msg.channel.send("? Post is NSFW. Use !nsfw to allow NSFW posts.");
                        return;
                    }
                    if (!msg.channel.nsfw) {
                        msg.channel.send("? Post is NSFW. This isn't a NSFW channel.");
                        return;
                    }
                    msg.channel.send(data.url);
                } else {
                    msg.channel.send(data.url);
                }
            } else if (msg.channel.type == "dm" || msg.type == "group") {
                msg.channel.send(data.url);
            }
        });
}
/** Log into Discord */
client.login(token);
