const CONSTS = require("./strings.js"), Server = require("./serverhelpers.js"), Map = require("./maps.js");
const DiscordHelper = require("./discordHelper.js");
const self = module.exports = {
    Init: function(gameData, channelID, userID, message) {
        if(message !== "INIT") { return; }
        gameData.channelID = channelID;
        gameData.serverID = gameData.bot.channels[channelID].guild_id;
        gameData.hostUserID = userID;
        gameData.hostUserName = Server.GetNickname(gameData.bot, gameData.serverID, userID);
        gameData.initialized = true;
        DiscordHelper.Init(gameData);
        DiscordHelper.Say(CONSTS.TITLE);
        DiscordHelper.SayP(`Current Settings -- Maximum Players: 4 -- Game Speed: Normal
+ Anyone can type "join" to join the next match or "leave" to leave it.
+ The host can type "!players #" to set the player count (valid values are 2-100).
+ The host can type "!speed #" to set the speed (valid values are Fast, Normal, Slow, Very Slow).
+ The host can type "start" to begin the game or "cancel" to end the game.`);
    },
    HandlePostInitCommand: function(gameData, userID, message) {
        if(userID == gameData.hostUserID) {
            if(self.JustHostyThings(gameData, message)) { return; }
        }
        if(message === "who") {
            const users = [];
            for(let i = 0; i < gameData.players.length; i++) {
                users.push(Server.GetNickname(gameData.bot, gameData.serverID, gameData.players[i]));
            }
            DiscordHelper.SayP(`Current Players are: ${users.join(", ")}.`);
            return;
        }
        const user = Server.GetNickname(gameData.bot, gameData.serverID, userID);
        if(message === "join") {
            if(gameData.players.indexOf(userID) >= 0) { return; }
            if(gameData.players.length >= gameData.numPlayers) {
                DiscordHelper.SayM(`This round already has ${gameData.numPlayers} players in it. ${gameData.hostUserName}, type *Start* to begin the game.`);
            } else {
                gameData.players.push(userID);
                DiscordHelper.SayP(`${user} has joined the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} still available.`);
            }
        } else if(message === "leave") {
            const playerIdx = gameData.players.indexOf(userID);
            if(playerIdx < 0) { return false; }
            gameData.players.splice(playerIdx, 1);
            DiscordHelper.SayP(`${user} has left the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} are still available.`);
        }
    },
    JustHostyThings: function(gameData, message) {
        if(message.indexOf("!players") === 0) {
            const potentialNum = message.replace("!players ", "");
            const tryNum = parseInt(potentialNum);
            if(isNaN(tryNum) || tryNum < 2 || tryNum > 100) {
                DiscordHelper.SayM(`Invalid player count. Please enter a number from 2 to 100.`);
            } else {
                const clearNumPlayers = (tryNum < gameData.players.length);
                gameData.numPlayers = tryNum;
                DiscordHelper.SayP(`The next match's player count is now ${tryNum}!`);
                if(clearNumPlayers) {
                    DiscordHelper.SayM(`Since there were already ${gameData.players.length} players signed up, they have all been cleared from the queue. Please type "join" again to join the next match!`);
                    gameData.players = [];
                }
            }
            return true;
        } else if(message.indexOf("!speed") === 0) {
            const potentialSpeed = message.replace("!speed ", "");
            switch(potentialSpeed) {
                case "fast": gameData.gameSpeed = 0.75; break;
                case "normal": gameData.gameSpeed = 1; break;
                case "slow": gameData.gameSpeed = 2; break;
                case "very slow": gameData.gameSpeed = 4; break;
                default:
                    DiscordHelper.SayM(`Invalid speed. Please enter either Fast, Normal, Slow, or Very Slow.`);
                    return true;
            }
            DiscordHelper.SayP(`The next match's speed is now ${potentialSpeed}!`);
            return true;
        } else if(message === "start") {
            if(gameData.players.length === 0) {
                DiscordHelper.SayM(`Come on, bro, at least wait until the match has someone in it before starting it!`);
                return;
            }
            gameData.map = Map.GetMap();
            gameData.started = true;
            gameData.playerDetails = {};
            const numRooms = gameData.map.rooms.length;
            const roomsArray = [];
            for(let i = 0; i < gameData.players.length; i++) {
                const playerId = gameData.players[i];
                const playerRoom = i % numRooms;
                const playerNick = Server.GetNickname(gameData.bot, gameData.serverID, playerId);
                gameData.playerDetails[playerId] = {
                    nick: playerNick, 
                    room: playerRoom,
                    holding: null,
                    position: ""
                };
                if(roomsArray[playerRoom] === undefined) { roomsArray[playerRoom] = []; }
                roomsArray[playerRoom].push(playerNick);
            }
            let informationStr = `The game has begun! You are on the map "${gameData.map.name}!" 
${gameData.map.img}
`;
            for(let i = 0; i < roomsArray.length; i++) {
                const peopleInRoom = roomsArray[i];
                informationStr += `+ ${Server.GetListStringFromArray(peopleInRoom)} ${peopleInRoom.length === 1 ? "is" : "are"} in Room ${i + 1}.
`;
            }
            informationStr += `+ Bone Apple Tea!`;
            DiscordHelper.SayP(informationStr);
            return true;
        } else if(message === "cancel") {
            gameData.initialized = false;
            gameData.players = [];
            DiscordHelper.Say(CONSTS.CANCELROUND);
            return false;
        }
        return false;
    }
};