const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js"), Strings = require("./strings.js");
const DiscordHelper = require("./discordHelper.js"), GameHelper = require("./gameHelpers.js");
const self = module.exports = {
    ShowHelp: function() {
        DiscordHelper.Say(Strings.HELP1);
        DiscordHelper.Say(Strings.HELP2);
        DiscordHelper.Say(Strings.HELP3);
        return true;
    },
    MainLoop: function(gameData) {
        gameData.secondsPlayed += 1;
        for(let i = 0; i < gameData.map.items.length; i++) {
            const place = gameData.map.items[i];
            if(place.switchedOn) { place.cookingTime += 1; }
        }
        if(gameData.secondsPlayed % 30 === 0) {
            const orders = gameData.map.potentialOrders;
            const order = orders[Math.floor(Math.random() * orders.length)];
            gameData.orders.push(order);
            DiscordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
        }
    },
    HandleAction: function(gameData, userID, action) {
        try {
            const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
            switch(action.type) {
                case "grab": return self.Grab(gameData, userID, action);
                case "drop": return self.Drop(gameData, userID, action);
                case "chop": return self.Chop(gameData, userID, action);
                case "plate": return self.Plate(gameData, userID, action);
                case "serve": return self.Serve(gameData, userID, action);
                case "move": return self.Move(gameData, userID, action);
                case "fry": return self.Fry(gameData, userID, action);
                case "turn": return self.Turn(gameData, userID, action);
                case "look": return self.Look(gameData, currentRoom, actingUser, action);
                case "who": return self.Who(gameData, currentRoom, actingUser, userID, action.placeNum);
            }
        } catch(e) {
            DiscordHelper.Log(e.stack);
            DiscordHelper.SayM(`Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.`);
        }
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
    },
    Turn: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(!GameHelper.NoPlacesCheck(actingUser, relevantPlaces, `turn ${action.switchType}`, action.displayPlace)) { return; }
        if(action.placeNum < 0 && relevantPlaces.length > 1) {
            DiscordHelper.SayM(`${actingUser.nick} tried to turn ${action.switchType} ${Food.AorAN(action.displayPlace)}, but there are ${relevantPlaces.length} of those, and they didn't specify which one!`);
            return;
        }
        const placeNum = action.placeNum < 0 ? 0 : (action.placeNum - 1);
        const chosenPlace = relevantPlaces[placeNum];
        if(chosenPlace.switchedOn && action.switchType === "on") { return DiscordHelper.SayM(`${actingUser.nick} tried to turn on ${action.displayPlace} ${placeNum + 1}, but it's already on!`); }
        if(!chosenPlace.switchedOn && action.switchType === "off") { return DiscordHelper.SayM(`${actingUser.nick} tried to turn off ${action.displayPlace} ${placeNum + 1}, but it's already off!`); }
        if(chosenPlace.contents.length === 0 && !chosenPlace.switchedOn) { return DiscordHelper.SayM(`${actingUser.nick} tried to turn on ${action.displayPlace} ${placeNum + 1}, but it's empty! Put some food in it before turning it on!`); }

        if(action.switchType === "on") {
            chosenPlace.switchedOn = true;
            chosenPlace.modifier = 1;
            chosenPlace.cookingTime = 0;
            chosenPlace.cookRangeDetails = Food.GetCookTime(chosenPlace, gameData.gameSpeed);
            const newFood = Food.TransformFood(chosenPlace);
            DiscordHelper.SayP(`${actingUser.nick} turned ${action.displayPlace} ${placeNum + 1} on, and is now boiling ${Food.GetFoodDisplayNameFromObj(newFood)}!
+ It will be ready in ${chosenPlace.cookRangeDetails.time - chosenPlace.cookRangeDetails.range}-${chosenPlace.cookRangeDetails.time + chosenPlace.cookRangeDetails.range} seconds!`);
        } else {
            chosenPlace.switchedOn = false;
            chosenPlace.modifier = Food.GetCookingModifier(chosenPlace);
            const newFood = Food.TransformFood(chosenPlace);
            chosenPlace.contents = [ newFood ];
            DiscordHelper.SayP(`${actingUser.nick} turned ${action.displayPlace} ${placeNum + 1} off, and made ${Food.GetFoodDisplayNameFromObj(newFood)}!`);
        }
    },
    Move: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        if(action.direction !== undefined) { // trying to move in a specific direction
            const nextRoom = gameData.map.rooms[currentRoom][action.direction];
            if(nextRoom === undefined) {
                DiscordHelper.SayM(`${actingUser.nick} walked ${action.direction}, and successfully walked into a wall!`);
                return;
            }
            gameData.playerDetails[userID].room = nextRoom;
            DiscordHelper.SayP(`${actingUser.nick} walked ${action.direction} from room ${currentRoom + 1} to room ${nextRoom + 1}!`);
        } else { // trying to move to a specific room
            if(currentRoom === action.roomNo) {
                DiscordHelper.SayM(`${actingUser.nick} successfully walked to room ${action.roomNo + 1} from... room ${currentRoom + 1}. Good job.`);
                return;
            }
            const potentialRooms = gameData.map.rooms[currentRoom];
            for(const direction in potentialRooms) {
                if(potentialRooms[direction] === action.roomNo) {
                    gameData.playerDetails[userID].room = action.roomNo;
                    DiscordHelper.SayP(`${actingUser.nick} walked ${direction} from room ${currentRoom + 1} to room ${action.roomNo + 1}!`);
                    return;
                }
            }
            DiscordHelper.SayM(`${actingUser.nick} tried to walk to room ${action.roomNo + 1}, but they can't reach it from room ${currentRoom + 1}!`);
        }
    },
    Serve: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action, true);
        if(!GameHelper.HoldingCheck(actingUser, "serve", action, objectDisplayName)) { return; }
        
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "output");
        if(!GameHelper.NoPlacesCheck(actingUser, relevantPlaces, "serve", "serving area")) { return; }
        
        const orders = gameData.orders;
        for(let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if(Food.DoesFoodMatchOrder(actingUser.holding, order)) {
                DiscordHelper.SayP(`${actingUser.nick} served ${Food.GetFoodDisplayNameFromObj(actingUser.holding, true)} and earned $${order.score}!`);
                gameData.score += order.score;
                actingUser.holding = null;
                orders.splice(i, 1);
                return;
            }
        }
        DiscordHelper.SayM(`${actingUser.nick} tried to serve ${objectDisplayName}, but nobody ordered that!`);
    },
    Fry: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        if(!GameHelper.EmptyHandsCheck(actingUser, "fry", objectDisplayName)) { return; }
       
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "pan");
        if(!GameHelper.NoPlacesCheck(actingUser, relevantPlaces, "fry", "frying pan")) { return; }
        
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(!GameHelper.ChosenPlaceCheck(actingUser, chosenPlace, action, objectDisplayName, relevantPlaces.length, "fry", "frying pan")) { return; }
            
            const itemInfo = chosenPlace.contents[0];
            if(itemInfo.type !== action.object) {
                DiscordHelper.SayM(`${actingUser.nick} tried to fry ${objectDisplayName} on frying pan ${action.placeNum}, but all that's on there is ${Food.GetFoodDisplayNameFromObj(itemInfo)}!`);
                return;
            }
            if(!GameHelper.DuplicateAttributeCheck(itemInfo, "fried", "fry")) { return false; }
            chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "fried");
            DiscordHelper.SayP(`${actingUser.nick} fried ${objectDisplayName} on frying pan ${action.placeNum}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                if(chosenPlace.contents.length === 0) { continue; }
                const itemInfo = chosenPlace.contents[0];
                if(itemInfo.type !== action.object) { continue; }
                if(!GameHelper.DuplicateAttributeCheck(itemInfo, "fried")) { continue; }
                chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "fried");
                DiscordHelper.SayP(`${actingUser.nick} fried ${objectDisplayName} on frying pan ${i + 1}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
                return;
            }
            DiscordHelper.SayM(`${actingUser.nick} tried to fry ${objectDisplayName}, but none of the frying pans had ${objectDisplayName} that needed frying on them!`);
        }
    },
    Chop: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        if(!GameHelper.EmptyHandsCheck(actingUser, "chop", objectDisplayName)) { return; }
        
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "cuttingboard");
        if(!GameHelper.NoPlacesCheck(actingUser, relevantPlaces, "chop", "cutting board")) { return; }
       
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(!GameHelper.ChosenPlaceCheck(actingUser, chosenPlace, action, objectDisplayName, relevantPlaces.length, "chop", "cutting board")) { return; }
            
            const itemInfo = chosenPlace.contents[0];
            if(itemInfo.type !== action.object) {
                DiscordHelper.SayM(`${actingUser.nick} tried to chop ${objectDisplayName} on cutting board ${action.placeNum}, but all that's on there is ${Food.GetFoodDisplayNameFromObj(itemInfo)}!`);
                return;
            }
            if(!GameHelper.DuplicateAttributeCheck(itemInfo, "sliced", "chop")) { return false; }
            chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "sliced");
            DiscordHelper.SayP(`${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${action.placeNum}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                if(chosenPlace.contents.length === 0) { continue; }
                const itemInfo = chosenPlace.contents[0];
                if(itemInfo.type !== action.object) { continue; }
                if(!GameHelper.DuplicateAttributeCheck(itemInfo, "sliced")) { continue; }
                chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "sliced");
                DiscordHelper.SayP(`${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${i + 1}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
                return;
            }
            DiscordHelper.SayM(`${actingUser.nick} tried to chop ${objectDisplayName}, but none of the cutting boards had ${objectDisplayName} that needed chopping on them!`);
        }
    },
    Plate: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        if(!GameHelper.HoldingCheck(actingUser, "plate", action, objectDisplayName)) { return; }
        
        const heldDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        if(actingUser.holding.type === "plate") { return DiscordHelper.SayM(`${actingUser.nick} tried to plate a plate! Why would you do that? What is your goal here?!`); }
        if(actingUser.holding.class === "cooking") { return DiscordHelper.SayM(`${actingUser.nick} tried to plate a ${objectDisplayName}! Why would you do that? What is your goal here?!`); }
        if(Food.HasAttribute(actingUser.holding, "plated")) { return DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName}, but it doesn't need ANOTHER plate!`); }

        let relevantPlaces = null, placeType = "";
        if(action.place === "") { // chose just any plate
            relevantPlaces = Room.GetObjectsInRoom(gameData.map, currentRoom);
            placeType = "";
        } else { // chose a plate in a specific type of place
            relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
            placeType = action.place;
        }
        
        if(relevantPlaces.length === 0) {
            if(placeType === "") { return DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on a ${aPlace}, but there is nothing that they can reach!`); }
            else { return DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on a ${aPlace}, but there is no ${specificPlace} that they can reach!`); }
        }
        if(action.placeNum > 0) { // chose a plate on a specific place (can never occur when placeType === "")
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            const plateStatus = Room.TryPlateObjectOnPlace(chosenPlace, actingUser.holding);
            switch(plateStatus) {
                case "ok":
                    actingUser.holding = null;
                    DiscordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${specificPlace} ${action.placeNum}!`);
                    break;
                case "none":
                    DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there was no plate there!`);
                    break;
                case "invalid":
                    DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but you can't plate ${heldDisplayName} on ${aPlace}!!`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryPlateObjectOnPlace(relevantPlaces[i], actingUser.holding);
                if(attempt === "ok") {
                    if(placeType === "") {
                        DiscordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${Food.FormatPlaceName(relevantPlaces[i].type)}!`); // EH: add number?
                    } else {
                        DiscordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${specificPlace} ${i + 1}!`);
                    }
                    actingUser.holding = null;
                    return;
                }
            }
            DiscordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName}, but couldn't find any plates!`);
        }    
    },
    Drop: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        if(!GameHelper.HoldingCheck(actingUser, "drop", action, objectDisplayName)) { return; }

        if(action.place === "plate") {
            self.Plate(gameData, userID, {
                type: "plate",
                object: action.object,
                place: "", placeNum: -1
            });
            return;
        }
        
        const heldDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        const onOrIn = (["table", "floor"].indexOf(place.type) < 0 ? "in" : "down on");
        if(relevantPlaces.length === 0) {
            DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but there is no ${specificPlace} that they can reach!`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            const addStatus = Room.TryAddObjectToPlace(chosenPlace, actingUser.holding);
            switch(addStatus) {
                case "ok":
                    actingUser.holding = null;
                    DiscordHelper.SayP(`${actingUser.nick} put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}!`);
                    break;
                case "full":
                    DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}, but there was no more room!`);
                    break;
                case "invalid":
                    DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}, but you can't put ${heldDisplayName} on ${aPlace}!!`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryAddObjectToPlace(relevantPlaces[i], actingUser.holding);
                if(attempt === "ok") {
                    DiscordHelper.SayP(`${actingUser.nick} put ${heldDisplayName} ${onOrIn} ${specificPlace} ${i + 1}!`);
                    actingUser.holding = null;
                    return;
                }
                if(attempt === "invalid") {
                    DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but you can't put ${heldDisplayName} on ${aPlace}!!`);
                    return;
                }
            }
            DiscordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but there was no more room!`);
        }
    },
    Grab: function(gameData, userID, action) { // TODO: maybe care about attributes
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(relevantPlaces.length === 0) {
            DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but there is no ${action.place} that they can reach!`);
            return;
        }
        if(!GameHelper.EmptyHandsCheck(actingUser, "grab", objectDisplayName)) { return false; }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            if(chosenPlace.switchedOn) {
                const type = specificPlace === "pot" ? "stove" : specificPlace;
                DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but the ${type} is on! Turn it off first!`);
                return;
            }
            const item = Room.TryTakeObjectFromPlace(chosenPlace, action.object);
            if(item !== null) {
                DiscordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${specificPlace} ${action.placeNum}!`);
                actingUser.holding = item;
            } else {
                DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but there was no ${action.object} there to grab!`);
            }
        } else {
            let itemsOn = false;
            for(let i = 0; i < relevantPlaces.length; i++) {
                if(relevantPlaces[i].switchedOn) { itemsOn = true; continue; }
                const item = Room.TryTakeObjectFromPlace(relevantPlaces[i], action.object);
                if(item !== null) {
                    DiscordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${specificPlace} ${i + 1}!`);
                    actingUser.holding = item;
                    return;
                }
            }
            if(itemsOn) {
                const type = specificPlace === "pot" ? "stove" : specificPlace;
                DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but the only ${action.object}s are in ${type}s that are turned on! Turn them off first!`);
            } else {
                DiscordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but there was no ${action.object} there to grab!`);
            }
        }
    }
};