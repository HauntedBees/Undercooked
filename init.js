const t = "```", d = "```diff", dn = `${d}
`;
const CONSTS = require("./strings.js"), Server = require("./serverhelpers.js"), Map = require("./maps.js");
const DiscordHelper = require("./discordHelper.js");
module.exports = {
    Init: function(gameData, channelID, userID, message) {
        if(message !== "INIT") { return; }
        gameData.channelID = channelID;
        gameData.serverID = gameData.bot.channels[channelID].guild_id;
        gameData.hostUserID = userID;
        gameData.hostUserName = Server.GetNickname(gameData.bot, gameData.serverID, userID);
        gameData.initState = 1;
        DiscordHelper.Init(gameData);
        DiscordHelper.Say(CONSTS.TITLE);
        DiscordHelper.Say(`${dn}+ How many players would you like, ${gameData.hostUserName}? 2, 3, 4, or tons?${t}`);
    },
    SetPlayerCount: function(gameData, userID, message) {
        if(userID !== gameData.hostUserID) { return; }
        switch(message) {
            case "2": 
                gameData.numPlayers = 2; gameData.initState = 2;
                DiscordHelper.Say(`${CONSTS.PLAYERS_2}${CONSTS.PLAYERS_END}`);
                break;
            case "3": 
                gameData.numPlayers = 2; gameData.initState = 2;
                DiscordHelper.Say(`${CONSTS.PLAYERS_3}${CONSTS.PLAYERS_END}`);
                break;
            case "4": 
                gameData.numPlayers = 2; gameData.initState = 2;
                DiscordHelper.Say(`${CONSTS.PLAYERS_4}${CONSTS.PLAYERS_END}`);
                break;
            case "many":
                gameData.numPlayers = 100; gameData.initState = 2;
                DiscordHelper.Say(`${CONSTS.PLAYERS_MANY}${CONSTS.PLAYERS_END}`);
                break;
            default:
                DiscordHelper.Say(CONSTS.ERROR);
                break;
        }
    },
    JoinPlayer: function(gameData, userID, message) {
        const user = Server.GetNickname(gameData.bot, gameData.serverID, userID);
        if(message === "who") {
            const users = [];
            for(let i = 0; i < gameData.players.length; i++) {
                users.push(Server.GetNickname(gameData.bot, gameData.serverID, gameData.players[i]));
            }
            DiscordHelper.Say(`${dn}+ Current Players are: ${users.join(", ")}.${t}`);
            return;
        }
        if(userID === gameData.hostUserID) {
            if(message === "start") {
                if(gameData.players.length === 0) {
                    DiscordHelper.Say(`${dn}- Come on, bro, at least wait until the match has someone in it before starting it!${t}`);
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
                        holding: "",
                        position: ""
                    };
                    if(roomsArray[playerRoom] === undefined) { roomsArray[playerRoom] = []; }
                    roomsArray[playerRoom].push(playerNick);
                }
                let informationStr = `${dn}+ The game has begun! You are on the map "${gameData.map.name}!" 
${gameData.map.img}
`;
                for(let i = 0; i < roomsArray.length; i++) {
                    const peopleInRoom = roomsArray[i];
                    informationStr += `+ ${Server.GetListStringFromArray(peopleInRoom)} ${peopleInRoom.length === 1 ? "is" : "are"} in Room ${i + 1}.
`;
                }
                informationStr += `+ Bone Apple Tea!${t}`;
                DiscordHelper.Say(informationStr);
                return true;
            } else if(message === "cancel") {
                gameData.initState = 0;
                gameData.players = [];
                DiscordHelper.Say(CONSTS.CANCELROUND);
                return false;
            }
        }
        if(message === "join") {
            if(gameData.players.indexOf(userID) >= 0) { return; }
            if(gameData.players.length >= gameData.numPlayers) {
                DiscordHelper.Say(`${dn}- This round already has ${gameData.numPlayers} players in it. ${gameData.hostUserName}, type *Start* to begin the game.${t}`);
            } else {
                gameData.players.push(userID);
                DiscordHelper.Say(`${dn}+ ${user} has joined the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} still available.${t}`);
            }
        } else if(message === "leave") {
            const playerIdx = gameData.players.indexOf(userID);
            if(playerIdx < 0) { return false; }
            gameData.players.splice(playerIdx, 1);
            DiscordHelper.Say(`${dn}+ ${user} has left the round. ${gameData.numPlayers - gameData.players.length} player slot${(gameData.numPlayers - gameData.players.length !== 1) ? "s are" : " is"} are still available.${t}`);
        }
        return false;
    }
};