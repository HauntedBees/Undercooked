const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js");
const DiscordHelper = require("./discordHelper.js");
const self = module.exports = {
    Who: function(gameData, currentRoom, actingUser, actingUserID, placeNum) {
        if(placeNum < 0) { placeNum = currentRoom + 1; }
        const internalRoomNum = placeNum - 1;
        const playersInRoom = [];
        let isInRoom = false;
        for(let i = 0; i < gameData.players.length; i++) {
            const playerId = gameData.players[i];
            const playerInfo = gameData.playerDetails[playerId];
            if(playerInfo.room === internalRoomNum) {
                if(playerId === actingUserID) {
                    isInRoom = true;
                } else {
                    playersInRoom.push(playerInfo.nick);
                }
            }
        }
        if(playersInRoom.length === 0) {
            if(isInRoom) {
                DiscordHelper.SayP(`${actingUser.nick} looked for people in Room ${placeNum}, and they're the only one in there!`);
            } else {
                DiscordHelper.SayP(`${actingUser.nick} looked for people in Room ${placeNum}, and there's no one there!`);
            }
        } else {
            let res = `${actingUser.nick} looked for people in Room ${placeNum}, and found `;
            if(playersInRoom.length === 1) {
                res += playersInRoom[0];
            } else if(playersInRoom.length === 2) {
                res += `${playersInRoom[0]} and ${playersInRoom[1]}`;
            } else {
                for(let i = 0; i < playersInRoom.length; i++) {
                    if(i === (playersInRoom.length - 1)) {
                        res += `and ${playersInRoom[i]}`;
                    } else {
                        res += `${playersInRoom[i]}, `;
                    }
                }
            }
            res += isInRoom ? ", in addition to themselves." : ".";
            DiscordHelper.SayP(res);
        }
    },
    Look: function(gameData, currentRoom, actingUser, action) {
        if(action.around) { return self.LookAround(gameData, currentRoom, actingUser, action.placeNum); }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        const specificPlace = Food.FormatPlaceName(action.place, true);
        if(relevantPlaces.length === 0) {
            DiscordHelper.SayM(`${actingUser.nick} looked for ${specificPlace}s, but couldn't find any in their room!`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.SayM(`${actingUser.nick} tried to look at ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            DiscordHelper.SayP(`${actingUser.nick} looked at ${specificPlace} ${action.placeNum} in Room ${currentRoom + 1}: ${Room.GetInspectionString(chosenPlace, action.placeNum, true)}`);
        } else if(relevantPlaces.length === 1) {
            const chosenPlace = relevantPlaces[0];
            DiscordHelper.SayP(`${actingUser.nick} looked at the ${specificPlace} in Room ${currentRoom + 1}: ${Room.GetInspectionString(chosenPlace, 0, true)}`);
        } else {
            let fullStr = `${actingUser.nick} looked at the ${specificPlace}s in Room ${currentRoom + 1}:`;
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                fullStr += `\n+ ${Room.GetInspectionString(chosenPlace, i + 1, false)}`;
            }
            DiscordHelper.SayP(fullStr);
        }
    },
    LookAround: function(gameData, currentRoom, actingUser, placeNum) {
        if(placeNum < 0) { placeNum = currentRoom + 1; }
        const relevantPlaces = Room.GetObjectsInRoom(gameData.map, placeNum - 1);
        if(relevantPlaces.length === 0) {
            DiscordHelper.SayM(`${actingUser.nick} looked around Room ${placeNum}, but it's empty!`);
            return;
        }
        relevantPlaces.sort((a, b) => a.type.localeCompare(b.type));
        let fullStr = `${actingUser.nick} looked around Room ${placeNum}:`;
        let lastItemType = "", typeIter = 1;
        for(let i = 0; i < relevantPlaces.length; i++) {
            const chosenPlace = relevantPlaces[i];
            if(chosenPlace.type !== lastItemType) {
                lastItemType = chosenPlace.type;
                typeIter = 1;
            }
            fullStr += `\n+ ${Room.GetInspectionString(chosenPlace, typeIter, false)}`;
            typeIter += 1;
        }
        DiscordHelper.SayP(fullStr);
    }
};