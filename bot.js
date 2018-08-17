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
    if(gameData.initState === 0) {
        Setup.Init(gameData, channelID, userID, message);
        return;
    }
    if(channelID != gameData.channelID) { return; }
    if(message === "!HELP") { return Game.ShowHelp(); }
    if(!gameData.started) {
        switch(gameData.initState) {
            case 1: Setup.SetPlayerCount(gameData, userID, message.toLowerCase()); break;
            case 2:
                const hasGameStarted = Setup.JoinPlayer(gameData, userID, message.toLowerCase());
                if(hasGameStarted) { gameData.gameTimer = setInterval(function() { Game.MainLoop(gameData); }, 1000); }
                break;
        }
        return;
    }
    if(gameData.players.indexOf(userID) < 0) { return; } // you don't get to do shit if you're not int he fucking game
    if(message === "!HELP") { return Game.ShowHelp(); }
    const parsedResult = Parser.Parse(message);
    if(parsedResult === null) { return; }
    Game.HandleAction(gameData, userID, parsedResult);
});

const gameData = {
    initState: 0, numPlayers: 0, players: [], started: false, gameTimer: 0, 
    serverID: "", channelID: "", hostUserID: "", hostUserName: "", 
    bot: null, map: null, playerDetails: null, orders: [], score: 0,
    secondsPlayed: 0
};

/* items: 
    - wall (can cross over to other sides or no)
    - dispenser
       - tomato, lettuce, onion, mushroom, buns, steak, fish, potato, cheese, pizza dough
    - plates (finite number or dispensed)
    - cutting board
    - pot (volume, number of items that can be put in it)
    - frying pan
    - output area
    - input area for used dishes
    - stovetop
    - oven
    - table (size, number of items that can be placed on it)
    - fire extinguisher
    - sink (washes plates)
    - trash can
    - conveyor belt (might not work in text-based)
    - events (areas become separated)
*/