const Discord = require("discord.io"), auth = require("./auth.json");
const Setup = require("./init.js"), Game = require("./game.js"), Parser = require("./parser.js"), DH = require("./discordHelper.js");
const bot = new Discord.Client({ token: auth.token, autorun: true });
const chGdM = {}; // channel gamedata mappings
bot.on("ready", function (evt) {
    console.log("Connected! Logged in as: " + bot.username + " - (" + bot.id + ")");
    bot.setPresence({ game: { name: "Undercooked" } });
});
bot.on("message", function (user, userID, channelID, message, evt) {
    if(userID === bot.id) { return; }
    
    if(chGdM[channelID] === undefined && message === "INIT") {
        console.log(`Initializing up a game on channel ${channelID}.`);
        chGdM[channelID] = GetNewGameData(bot, channelID);
    }
    const channelGameData = chGdM[channelID];
    if(channelGameData === undefined) { return; }

    if(!channelGameData.initialized) {
        Setup.Init(chGdM[channelID], channelID, userID, message);
        return;
    }
    if(!channelGameData.started) {
        if(message === "!HELP") { return Game.ShowHelp(channelGameData); }
        Setup.HandlePostInitCommand(channelGameData, userID, message.toLowerCase());
        if(channelGameData.cancelled) {
            console.log(`Cancelling the game on channel ${channelID}.`);
            KillGameData(chGdM[channelID]);
            delete chGdM[channelID];
            return;
        }
        if(channelGameData.started) {
            console.log(`The game on channel ${channelID} has began.`);
            channelGameData.gameTimer = setInterval(function() { Game.MainLoop(channelGameData); }, 1000);
        }
        return;
    }
    if(channelGameData.players.indexOf(userID) < 0) { return; } // you don't get to do shit if you're not int he fucking game
    if(message === "!HELP") { return Game.ShowHelp(channelGameData); }
    const parsedResult = Parser.Parse(message);
    if(parsedResult === null) { return; }
    Game.HandleAction(channelGameData, userID, parsedResult);
});

function GetNewGameData(bot, channelID) {
    const gameData = {
        initialized: false, started: false, 
        serverID: "", channelID: channelID, hostUserID: "", hostUserName: "", 
        numPlayers: 4, players: [], playerDetails: null, 
        bot: bot, map: null, orders: [], score: 0,
        gameTimer: 0, gameSpeed: 1, secondsPlayed: 0,
        lastActionTimeSecond: 0
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