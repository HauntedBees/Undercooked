const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js"), Maintainers = require("./actionsMaintenance.js"), GameHelper = require("./gameHelpers.js");
module.exports = {
    Move: function(gameData, currentRoom, actingUser, action) {
        if(action.direction !== undefined) { // trying to move in a specific direction
            const nextRoom = gameData.map.rooms[currentRoom][action.direction];
            if(nextRoom === undefined) {
                gameData.discordHelper.SayM(`${actingUser.nick} walked ${action.direction}, and successfully walked into a wall!`);
                return;
            }
            actingUser.room = nextRoom;
            gameData.discordHelper.SayP(`${actingUser.nick} walked ${action.direction} from room ${currentRoom + 1} to room ${nextRoom + 1}!`);
        } else { // trying to move to a specific room
            if(currentRoom === action.roomNo) {
                gameData.discordHelper.SayM(`${actingUser.nick} successfully walked to room ${action.roomNo + 1} from... room ${currentRoom + 1}. Good job.`);
                return;
            }
            const potentialRooms = gameData.map.rooms[currentRoom];
            for(const direction in potentialRooms) {
                if(potentialRooms[direction] === action.roomNo) {
                    actingUser.room = action.roomNo;
                    gameData.discordHelper.SayP(`${actingUser.nick} walked ${direction} from room ${currentRoom + 1} to room ${action.roomNo + 1}!`);
                    return;
                }
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to walk to room ${action.roomNo + 1}, but they can't reach it from room ${currentRoom + 1}!`);
        }
    },
    Drop: function(gameData, currentRoom, actingUser, action) {
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to put something down, but they aren't holding anything!`);
            return false;
        }
        if(action.place === "plate") {
            Maintainers.Plate(gameData, currentRoom, actingUser, { type: "plate", place: "", placeNum: -1 });
            return;
        }

        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        const heldDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        const onOrIn = (["table", "floor"].indexOf(action.place) < 0 ? "in" : "down on");
        if(relevantPlaces.length === 0) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but there is no ${specificPlace} that they can reach!`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            const addStatus = Room.TryAddObjectToPlace(chosenPlace, actingUser.holding);
            switch(addStatus) {
                case "ok":
                    actingUser.holding = null;
                    gameData.discordHelper.SayP(`${actingUser.nick} put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}!`);
                    break;
                case "onfire":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}, but it's on fire! Use a fire extinguisher to put it out first!`);
                    break;
                case "full":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}, but there was no more room!`);
                    break;
                case "invalid":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${specificPlace} ${action.placeNum}, but you can't put ${heldDisplayName} on ${aPlace}!!`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryAddObjectToPlace(relevantPlaces[i], actingUser.holding);
                if(attempt === "ok") {
                    gameData.discordHelper.SayP(`${actingUser.nick} put ${heldDisplayName} ${onOrIn} ${specificPlace} ${i + 1}!`);
                    actingUser.holding = null;
                    return;
                }
                if(attempt === "invalid") {
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but you can't put ${heldDisplayName} on ${aPlace}!!`);
                    return;
                }
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to put ${heldDisplayName} ${onOrIn} ${aPlace}, but there were none available!`);
        }
    },
    Grab: function(gameData, currentRoom, actingUser, action) { // TODO: maybe care about attributes
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action), objNoArticle = objectDisplayName.replace(/^an? /, "");
        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(relevantPlaces.length === 0) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but there is no ${action.place} that they can reach!`);
            return;
        }
        if(!GameHelper.EmptyHandsCheck(gameData.discordHelper, actingUser, "grab", objectDisplayName)) { return false; }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            if(chosenPlace.onFire) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but it's on fire! Use a fire extinguisher to put it out first!`);
                return;
            }
            if(chosenPlace.switchedOn) {
                const type = specificPlace === "pot" ? "stove" : specificPlace;
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but the ${type} is on! Turn it off first!`);
                return;
            }
            const item = Room.TryTakeObjectFromPlace(chosenPlace, action.object, action.objAttrs);
            if(item !== null) {
                if(chosenPlace.type === "dispenser") { actingUser.activeActions.push("dispense"); }
                gameData.discordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${specificPlace} ${action.placeNum}!`);
                actingUser.holding = item;
            } else {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${specificPlace} ${action.placeNum}, but there was no ${action.object} there to grab!`);
            }
        } else {
            let itemsOn = false, hasFires = false;
            for(let i = 0; i < relevantPlaces.length; i++) {
                if(relevantPlaces[i].onFire) { hasFires = true; continue; }
                if(relevantPlaces[i].switchedOn) { itemsOn = true; continue; }
                const item = Room.TryTakeObjectFromPlace(relevantPlaces[i], action.object, action.objAttrs);
                if(item !== null) {
                    if(relevantPlaces[i].type === "dispenser") { actingUser.activeActions.push("dispense"); }
                    gameData.discordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${specificPlace} ${i + 1}!`);
                    actingUser.holding = item;
                    return;
                }
            }
            if(hasFires) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but there was no ${objNoArticle} there to grab! And some of the ${specificPlace}s are on fire!`);
            } else if(itemsOn) {
                const type = specificPlace === "pot" ? "stove" : specificPlace;
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but the only ${objNoArticle}s are in ${type}s that are turned on! Turn them off first!`);
            } else {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName} from ${aPlace}, but there was no ${objNoArticle} there to grab!`);
            }
        }
    },
    Throw: function(gameData, currentRoom, actingUser, target) {
        if(target.indexOf("<@") === 0) { // @-tagged users are in the format of <@userID> (technically <@!userID> but we strip exclamation points out of messages)
            target = gameData.playerDetails[target.replace("<@", "").replace(">", "")].nick.toLowerCase();
        }
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to throw something to ${target}, but they aren't holding anything!`);
            return false;
        }
        const objectDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        if(actingUser.nick.toLowerCase() === target) {
            gameData.discordHelper.SayP(`${actingUser.nick} juggles ${objectDisplayName} areund in their hands. Fun!`);
            return false;
        }
        for(const playerId in gameData.playerDetails) {
            const player = gameData.playerDetails[playerId];
            if(player.nick.toLowerCase() !== target) { continue; }
            if(player.room === currentRoom || Room.AreRoomsConnected(gameData.map, currentRoom, player.room)) {
                if(player.holding === null) {
                    gameData.discordHelper.SayP(`${actingUser.nick} threw ${objectDisplayName} to ${target}!`);
                    player.holding = actingUser.holding;
                    actingUser.holding = null;
                    actingUser.activeActions.push("throw");
                } else {
                    if(actingUser.holding.type === "extinguisher") {
                        gameData.discordHelper.SayM(`${actingUser.nick} tried to throw ${objectDisplayName} to ${target}, but their hands are full, so it hit them on the head, knocking them unconscious for 30 seconds, then fell onto the floor of Room ${player.room + 1}!`);
                        player.stuckTimer = 30;
                        player.ailment = "concussion";
                        const floor = Room.GetObjectsOfTypeInRoom(gameData.map, player.room, "floor")[0];
                        if(floor === undefined) { return; }
                        floor.contents.push(actingUser.holding);
                        actingUser.holding = null;
                        actingUser.activeActions.push("assault");
                    } else {
                        gameData.discordHelper.SayM(`${actingUser.nick} tried to throw ${objectDisplayName} to ${target}, but their hands are full, so it hit them on the head, then fell onto the floor of Room ${player.room + 1}!`);
                        const floor = Room.GetObjectsOfTypeInRoom(gameData.map, player.room, "floor")[0];
                        if(floor === undefined) { return; }
                        floor.contents.push(actingUser.holding);
                        actingUser.holding = null;
                        actingUser.activeActions.push("throw_bad");
                    }
                }
                return;
            } else {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to throw ${objectDisplayName} to ${target}, but they're too far away, so it fell onto the floor of Room ${currentRoom + 1}!`);
                const floor = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "floor")[0];
                if(floor === undefined) { return; }
                floor.contents.push(actingUser.holding);
                actingUser.holding = null;
                actingUser.activeActions.push("throw_bad");
                return;
            }
        }
        gameData.discordHelper.SayM(`${actingUser.nick} tried to throw something to ${target}, but as far as I know, that isn't a person here!`);
    }
};