const CONSTS = require("./strings.js"), Map = require("./maps.js");
const IDtoNicknameMappings = {};
function GetSpeedName(i) {
    switch(i) {
        case 0.75: return "Fast";
        case 1: return "Normal";
        case 2: return "Slow";
        case 4: return "Very Slow";
    }
}
function GetMapName(mapIdx) {
    if(mapIdx < 0) { return "Random"; }
    return Map.GetMapName(mapIdx);
}
const self = module.exports = {
    GetNickname: function(bot, serverID, userID) {
        if(IDtoNicknameMappings[userID] !== undefined) { return IDtoNicknameMappings[userID]; }
        let nick = bot.servers[serverID].members[userID].nick;
        if(nick === null) {
            nick = bot.users[userID].username;
        }
        IDtoNicknameMappings[userID] = nick;
        return nick;
    },
    Init: function(gameData, channelID, userID, message) {
        if(message !== "INIT") { return; }
        gameData.bot.sendMessage({ to: channelID, message: CONSTS.TITLE }, function(err) {
            if(err === null) {
                self.Init2(gameData, channelID, userID);
            } else if(err.statusMessage !== "FORBIDDEN") { // don't initialize in blocked channels!
                self.Init2(gameData, channelID, userID, true);
            } else {
                console.log(`Match in channel ${channelID} was not started due to insufficient permissions.`);
            }
        });
    },
    Init2: function(gameData, channelID, userID, tryTitleAgain) {
        gameData.channelID = channelID;
        gameData.serverID = gameData.bot.channels[channelID].guild_id;
        gameData.hostUserID = userID;
        gameData.hostUserName = self.GetNickname(gameData.bot, gameData.serverID, userID);
        gameData.initialized = true;
        if(tryTitleAgain) { gameData.discordHelper.Say(CONSTS.TITLE); }
        const playerStr = gameData.players.length === 0 ? "" : `\n+ Current Players: ${gameData.players.map(e => self.GetNickname(gameData.bot, gameData.serverID, e)).join(", ")}.`;
        gameData.discordHelper.SayP(`Current Settings -- Maximum Players: ${gameData.numPlayers} -- Game Speed: ${GetSpeedName(gameData.gameSpeed)} -- Level: ${GetMapName(gameData.selectedMapIdx)}
+ Anyone can type "join" to join the next match or "leave" to leave it.
+ Anyone can type "!HELP" to see how to play, or "!HELP [action]" to learn more about a specific command.
- The host can type "!players #" to set the player count (valid values are 2-100).
- The host can type "!speed #" to set the speed (valid values are Fast, Normal, Slow, Very Slow).
- The host can type "!changelevel XXX", "!changelevel Random", "!viewlevels" or "!viewlevel XXX" to specify a level!
- The host can type "start" to begin the game or "cancel" to end the game.
- ${gameData.hostUserName} is the host!${playerStr}`);
    },
    HandlePostInitCommand: function(gameData, userID, message) {
        if(userID == gameData.hostUserID) {
            if(self.JustHostyThings(gameData, message)) { return; }
        }
        if(message === "who") {
            const users = [];
            for(let i = 0; i < gameData.players.length; i++) {
                users.push(self.GetNickname(gameData.bot, gameData.serverID, gameData.players[i]));
            }
            gameData.discordHelper.SayP(`Current Players are: ${users.join(", ")}.`);
            return;
        }
        const user = self.GetNickname(gameData.bot, gameData.serverID, userID);
        if(message === "join") {
            if(gameData.players.indexOf(userID) >= 0) { return; }
            if(gameData.players.length >= gameData.numPlayers) {
                gameData.discordHelper.SayM(`This round already has ${gameData.numPlayers} players in it. ${gameData.hostUserName}, type *Start* to begin the game.`);
            } else {
                gameData.players.push(userID);
                gameData.discordHelper.SayP(`${user} has joined the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} still available.`);
            }
        } else if(message === "leave") {
            const playerIdx = gameData.players.indexOf(userID);
            if(playerIdx < 0) { return false; }
            gameData.players.splice(playerIdx, 1);
            gameData.discordHelper.SayP(`${user} has left the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} are still available.`);
        }
    },
    JustHostyThings: function(gameData, message) {
        if(message.indexOf("!players") === 0) {
            const potentialNum = message.replace("!players ", "");
            const tryNum = parseInt(potentialNum);
            if(isNaN(tryNum) || tryNum < 2 || tryNum > 100) {
                gameData.discordHelper.SayM(`Invalid player count. Please enter a number from 2 to 100.`);
            } else {
                const clearNumPlayers = (tryNum < gameData.players.length);
                gameData.numPlayers = tryNum;
                gameData.discordHelper.SayP(`The next match's player count is now ${tryNum}!`);
                if(clearNumPlayers) {
                    gameData.discordHelper.SayM(`Since there were already ${gameData.players.length} players signed up, they have all been cleared from the queue. Please type "join" again to join the next match!`);
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
                    gameData.discordHelper.SayM(`Invalid speed. Please enter either Fast, Normal, Slow, or Very Slow.`);
                    return true;
            }
            gameData.discordHelper.SayP(`The next match's speed is now ${potentialSpeed}!`);
            return true;
        } else if(message === "start") {
            if(gameData.players.length === 0) {
                gameData.discordHelper.SayM(`Come on, bro, at least wait until the match has someone in it before starting it!`);
                return;
            }
            gameData.map = Map.GetMap();
            if(gameData.map.isTutorial) {
                gameData.isTutorial = true;
                gameData.tutorialState = 0;
                gameData.tutWaiting = false;
            }
            gameData.started = true;
            gameData.playerDetails = {};
            const numRooms = gameData.map.rooms.length;
            const roomsArray = [];
            for(let i = 0; i < gameData.players.length; i++) {
                const playerId = gameData.players[i];
                const playerRoom = i % numRooms;
                const playerNick = self.GetNickname(gameData.bot, gameData.serverID, playerId);
                gameData.playerDetails[playerId] = {
                    nick: playerNick, 
                    room: playerRoom,
                    holding: null,
                    stuckTimer: 0,
                    activeActions: [],
                };
                if(roomsArray[playerRoom] === undefined) { roomsArray[playerRoom] = []; }
                roomsArray[playerRoom].push(playerNick);
            }
            let informationStr = `The game has begun! You are on the map "${gameData.map.name}!" 
${gameData.map.img}
`;
            for(let i = 0; i < roomsArray.length; i++) {
                const peopleInRoom = roomsArray[i];
                let peopleName = "";
                if(peopleInRoom.length === 1) { peopleName = peopleInRoom[0]; }
                else if(peopleInRoom.length === 2) { peopleName = `${peopleInRoom[0]} and ${peopleInRoom[1]}`; }
                else {
                    const lastElement = peopleInRoom.splice(-1, 1)[0];
                    peopleName = `${peopleInRoom.join(", ")}, and ${lastElement}`;
                }
                informationStr += `+ ${peopleName} ${peopleInRoom.length === 1 ? "is" : "are"} in Room ${i + 1}.\n`;
            }
            informationStr += `+ Bone Apple Tea!`;
            gameData.discordHelper.SayP(informationStr);
            return true;
        } else if(message === "cancel") {
            gameData.initialized = false;
            gameData.cancelled = true;
            gameData.players = [];
            gameData.discordHelper.SayM(`${gameData.hostUserName} cancelled the round! To start a new match, someone best be typin' INIT!`);
            return false;
        }
        return false;
    }
};