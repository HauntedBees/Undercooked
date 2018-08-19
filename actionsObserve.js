const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js");
const self = module.exports = {
    Find: function(gameData, currentRoom, actingUser, action) {
        const roomNo = (action.placeNum < 0 ? currentRoom : (action.placeNum - 1));
        const itemToFind = action.object, itemName = Food.GetFoodDisplayNameFromAction(action);
        if(action.all) { // search every room
            let found = self.FindInRoom(gameData.map, roomNo, itemToFind); // start with your room
            if(found !== null) {
                gameData.discordHelper.SayP(`${actingUser.nick} looked for ${itemName} and found one at ${found} in Room ${roomNo + 1}!`);
                return;
            }
            for(let i = 0; i < gameData.map.rooms.length; i++) {
                if(i === roomNo) { continue; } // don't search your room again!
                found = self.FindInRoom(gameData.map, i, itemToFind);
                if(found !== null) {
                    gameData.discordHelper.SayP(`${actingUser.nick} looked for ${itemName} and found one at ${found} in Room ${i + 1}!`);
                    return;
                }
            }
            gameData.discordHelper.SayM(`${actingUser.nick} looked everywhere for ${itemName}, but found none! Check a dispenser!`);
        } else {
            const found = self.FindInRoom(gameData.map, roomNo, itemToFind);
            if(found === null) {
                gameData.discordHelper.SayM(`${actingUser.nick} looked for ${itemName} in Room ${roomNo + 1}, but found none! Check another room or a dispenser!`);
            } else {
                gameData.discordHelper.SayP(`${actingUser.nick} looked for ${itemName} in Room ${roomNo + 1} and found one at ${found}!`);
            }
        }
    },
    FindInRoom: function(map, roomNo, obj) {
        const roomItems = Room.GetObjectsInRoom(map, roomNo);
        let lastItemType = "", typeIter = 1;
        for(let i = 0; i < roomItems.length; i++) {
            const item = roomItems[i];
            if(item.contents === undefined) { continue; }
            if(item.type !== lastItemType) {
                lastItemType = item.type;
                typeIter = 1;
            }
            for(let j = 0; j < item.contents.length; j++) {
                const food = item.contents[j];
                if(food.type === obj) {
                    if(item.type === "floor") { return "the floor"; }
                    return `${Food.FormatPlaceName(item.type, true)} ${typeIter}`;
                }
            }
            typeIter += 1;
        }
        return null;
    },
    Holding: function(gameData, actingUser) {
        gameData.discordHelper.SayP(`${actingUser.nick} is currently holding ${actingUser.holding === null ? "nothing" : Food.GetFoodDisplayNameFromObj(actingUser.holding)}.`);
    },
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
                gameData.discordHelper.SayP(`${actingUser.nick} looked for people in Room ${placeNum}, and they're the only one in there!`);
            } else {
                gameData.discordHelper.SayP(`${actingUser.nick} looked for people in Room ${placeNum}, and there's no one there!`);
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
            gameData.discordHelper.SayP(res);
        }
    },
    What: function(gameData, actingUser, food) {
        gameData.discordHelper.SayP(Food.GetRecipeNameAndHowMake(actingUser.nick, food));
    },
    Look: function(gameData, currentRoom, actingUser, action) {
        if(action.around) { return self.LookAround(gameData, currentRoom, actingUser, action.placeNum); }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        const specificPlace = Food.FormatPlaceName(action.place, true);
        if(relevantPlaces.length === 0) {
            gameData.discordHelper.SayM(`${actingUser.nick} looked for ${specificPlace}s, but couldn't find any in their room!`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to look at ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            gameData.discordHelper.SayP(`${actingUser.nick} looked at ${specificPlace} ${action.placeNum} in Room ${currentRoom + 1}: ${Room.GetInspectionString(chosenPlace, action.placeNum, true)}`);
        } else if(relevantPlaces.length === 1) {
            const chosenPlace = relevantPlaces[0];
            gameData.discordHelper.SayP(`${actingUser.nick} looked at the ${specificPlace} in Room ${currentRoom + 1}: ${Room.GetInspectionString(chosenPlace, 0, true)}`);
        } else {
            let fullStr = `${actingUser.nick} looked at the ${specificPlace}s in Room ${currentRoom + 1}:`;
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                fullStr += `\n+ ${Room.GetInspectionString(chosenPlace, i + 1, false)}`;
            }
            gameData.discordHelper.SayP(fullStr);
        }
    },
    LookAround: function(gameData, currentRoom, actingUser, placeNum) {
        if(placeNum < 0) { placeNum = currentRoom + 1; }
        const relevantPlaces = Room.GetObjectsInRoom(gameData.map, placeNum - 1);
        if(relevantPlaces.length === 0) {
            gameData.discordHelper.SayM(`${actingUser.nick} looked around Room ${placeNum}, but it's empty!`);
            return;
        }
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
        gameData.discordHelper.SayP(fullStr);
    }
};