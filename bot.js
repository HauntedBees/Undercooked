const Discord = require("discord.io"), logger = require("winston"), auth = require("./auth.json");
const Setup = require("./init.js"), Game = require("./game.js"), Parser = require("./parser.js");
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true });
logger.level = "debug";
logger.info("Connecting");
const bot = new Discord.Client({ token: auth.token, autorun: true });
bot.on("ready", function (evt) {
    logger.info("Connected! Logged in as: " + bot.username + " - (" + bot.id + ")");
    gameData.bot = bot;
    bot.setPresence({ game: { name: "Garfield: Caught in the Act" } });
});
bot.on("message", function (user, userID, channelID, message, evt) {
    if(userID === bot.id) { return; }
    if(message === "!DEBUGPRINT") {
        logger.info(JSON.stringify(gameData.map));
        return;
    }
    if(!gameData.initialized) {
        Setup.Init(gameData, channelID, userID, message);
        return;
    }
    if(channelID != gameData.channelID) { return; }
    if(!gameData.started) {
        if(message === "!HELP") { return Game.ShowHelp(); }
        Setup.HandlePostInitCommand(gameData, userID, message.toLowerCase());
        if(gameData.started) { gameData.gameTimer = setInterval(function() { Game.MainLoop(gameData); }, 1000); }
        return;
    }
    if(gameData.players.indexOf(userID) < 0) { return; } // you don't get to do shit if you're not int he fucking game
    if(message === "!HELP") { return Game.ShowHelp(); }
    const parsedResult = Parser.Parse(message);
    if(parsedResult === null) { return; }
    Game.HandleAction(gameData, userID, parsedResult);
});

const gameData = {
    initialized: false, started: false, 
    serverID: "", channelID: "", hostUserID: "", hostUserName: "", 
    numPlayers: 4, players: [], playerDetails: null, 
    bot: null, map: null, orders: [], score: 0,
    gameTimer: 0, gameSpeed: 1, secondsPlayed: 0 
};