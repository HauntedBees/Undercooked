const Discord = require("discord.io"), auth = require("./auth.json");
const Setup = require("./init.js"), Game = require("./game.js"), Parser = require("./parser.js"), DH = require("./discordHelper.js");
const bot = new Discord.Client({ token: auth.token, autorun: true });
const chGdM = {}; // channel gamedata mappings
bot.on("ready", function (evt) {
    console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Connected! Logged in as: ${bot.username} - (${bot.id})`);
    bot.setPresence({ game: { name: "Undercooked" } });
});
bot.on("message", function (user, userID, channelID, message, evt) {
    if(userID === bot.id) { return; }
    
    if(chGdM[channelID] === undefined && message === "INIT") {
        console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] ${user} initialized a game on channel ${channelID}.`);
        chGdM[channelID] = GetNewGameData(bot, channelID);
    }
    const channelGameData = chGdM[channelID];
    if(channelGameData === undefined) { return; }

    if(!channelGameData.initialized) {
        Setup.Init(chGdM[channelID], channelID, userID, message);
        return;
    }
    if(!channelGameData.started) {
        if(message.indexOf("!HELP") === 0) { return Game.ShowHelp(channelGameData, message); }
        Setup.HandlePostInitCommand(channelGameData, userID, message.toLowerCase());
        if(channelGameData.cancelled) {
            console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Cancelling the game on channel ${channelID}.`);
            channelGameData.discordHelper.SayM(`Round cancelled! To start a new match, someone best be typin' INIT!`);
            setTimeout(channelGameData.KillGame, 1000);
            return;
        }
        if(channelGameData.started) {
            console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] The game on channel ${channelID} has began.`);
            channelGameData.gameTimer = setInterval(function() { Game.MainLoop(channelGameData); }, 1000);
        }
        return;
    }
    if(channelGameData.players.indexOf(userID) < 0) { return; } // you don't get to do shit if you're not int he fucking game
    if(channelGameData.complete && channelGameData.hostUserID === userID) {
        if(message === "AGAIN") {
            console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Starting a follow-up round on channel ${channelID}.`);
            const kickedUserIDs = channelGameData.kickedUserIDs;
            const numPlayers = channelGameData.numPlayers;
            const mapIdx = channelGameData.selectedMapIdx === 0 ? -1 : channelGameData.selectedMapIdx;
            const speed = channelGameData.gameSpeed;
            const players = channelGameData.players.slice(0);
            KillGameData(channelGameData);
            chGdM[channelID] = GetNewGameData(bot, channelID);
            chGdM[channelID].kickedUserIDs = kickedUserIDs;
            chGdM[channelID].numPlayers = numPlayers;
            chGdM[channelID].selectedMapIdx = mapIdx;
            chGdM[channelID].gameSpeed = speed;
            chGdM[channelID].players = players;
            Setup.Init2(chGdM[channelID], channelID, userID);
            return;
        } else if(message === "CANCEL") {
            console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Not continuing the game on channel ${channelID}.`);
            channelGameData.discordHelper.SayM(`New round cancelled! To start a new match, someone best be typin' INIT!`);
            setTimeout(channelGameData.KillGame, 1000);
            return;
        }
    }
    if(message.indexOf("!HELP") === 0) { return Game.ShowHelp(channelGameData, message); }
    const parsedResult = Parser.Parse(message);
    if(parsedResult === null) { return; }
    Game.HandleAction(channelGameData, userID, parsedResult, message);
});

function GetNewGameData(bot, channelID) {
    const gameData = {
        initialized: false, started: false, selectedMapIdx: 0, 
        serverID: "", channelID: channelID, hostUserID: "", hostUserName: "", 
        numPlayers: 4, players: [], playerDetails: null, 
        bot: bot, map: null, orders: [],
        score: 0, ordersCleared: 0, platesOnField: 0, 
        gameTimer: 0, gameSpeed: 1,
        secondsPlayed: 0, endingTime: 0, 
        lastActionTimeSecond: 0, kickedUserIDs: []
    };
    gameData.discordHelper = new DH.DiscordHelper(bot, channelID);
    gameData.KillGame = function() {
        const channelID = gameData.channelID;
        KillGameData(chGdM[channelID]);
        delete chGdM[channelID];
    }
    return gameData;
}
function KillGameData(gameData) {
    clearInterval(gameData.gameTimer);
    gameData.discordHelper.CleanUp();
}