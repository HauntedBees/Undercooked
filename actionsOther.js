const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js"), Maintainers = require("./actionsMaintenance.js"), GameHelper = require("./gameHelpers.js");
function ClothingToss(actingUser, clothing) {
    switch(clothing) {
        case "sock":
            if(actingUser.socks <= 0) { return false; }
            actingUser.socks--;
            return true;
        case "shirt":
            if(!actingUser.shirt) { return false; }
            actingUser.shirt = false;
            return true;
        case "shoe":
            if(actingUser.shoes <= 0) { return false; }
            actingUser.shoes--;
            return true;
        case "pants":
            if(!actingUser.pants) { return false; }
            actingUser.pants = false;
            return true;
        case "hat":
            if(!actingUser.hat) { return false; }
            actingUser.hat = false;
            return true;
        case "underwear":
            if(!actingUser.underwear) { return false; }
            actingUser.underwear = false;
            return true;
    }
    return false;
}
const self = module.exports = {
    Move: function(gameData, currentRoom, actingUser, action) {
        if(action.direction !== undefined) { // trying to move in a specific direction
            const nextRoom = gameData.map.rooms[currentRoom][action.direction];
            if(nextRoom === undefined || nextRoom < 0) {
                gameData.discordHelper.SayM(`${actingUser.nick} walked ${action.direction}, and successfully walked into a wall!`);
                return;
            }
            actingUser.room = nextRoom;
            gameData.discordHelper.SayP(`${actingUser.nick} walked ${action.direction} from Room ${currentRoom + 1} to Room ${nextRoom + 1}!`);
            actingUser.activeActions.push("walk");
        } else { // trying to move to a specific room
            if(currentRoom === action.roomNo) {
                gameData.discordHelper.SayM(`${actingUser.nick} successfully walked to Room ${action.roomNo + 1} from... Room ${currentRoom + 1}. Good job.`);
                return;
            }
            const potentialRooms = gameData.map.rooms[currentRoom];
            for(const direction in potentialRooms) {
                if(potentialRooms[direction] === action.roomNo) {
                    actingUser.room = action.roomNo;
                    gameData.discordHelper.SayP(`${actingUser.nick} walked ${direction} from Room ${currentRoom + 1} to Room ${action.roomNo + 1}!`);
                    actingUser.activeActions.push("walk");
                    return;
                }
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to walk to Room ${action.roomNo + 1}, but they can't reach it from Room ${currentRoom + 1}!`);
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
    Grab: function(gameData, currentRoom, actingUser, action) {
        if(action.place === "") { return self.TryGrabAnywhere(gameData, currentRoom, actingUser, action); }
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
    TryGrabAnywhere: function(gameData, currentRoom, actingUser, action) {
        const relevantPlaces = Room.GetObjectsInRoom(gameData.map, currentRoom);
        if(action.objAttrs.length === 0) { // prioritize grabbing a standard one over settling for any, if no attributes are specified (not counting dispensers)
            for(let i = 0; i < relevantPlaces.length; i++) {
                const currentPlace = relevantPlaces[i];
                if(currentPlace.onFire) { continue; }
                if(currentPlace.switchedOn) { continue; }
                if(currentPlace.type === "dispenser") { continue; }
                const item = Room.TryTakeObjectFromPlace(currentPlace, action.object, action.objAttrs);
                if(item !== null) {
                    gameData.discordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${Food.FormatPlaceName(currentPlace.type, true)} ${Room.GetPlaceNumber(relevantPlaces, currentRoom, currentPlace.type, i)}!`);
                    actingUser.holding = item;
                    return;
                }
            }
        }
        for(let i = 0; i < relevantPlaces.length; i++) { // then try anywhere (not counting dispensers)
            const currentPlace = relevantPlaces[i];
            if(currentPlace.onFire) { continue; }
            if(currentPlace.switchedOn) { continue; }
            if(currentPlace.type === "dispenser") { continue; }
            const item = Room.TryTakeObjectFromPlace(currentPlace, action.object, action.objAttrs);
            if(item !== null) {
                gameData.discordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${Food.FormatPlaceName(currentPlace.type, true)} ${Room.GetPlaceNumber(relevantPlaces, currentRoom, currentPlace.type, i)}!`);
                actingUser.holding = item;
                return;
            }
        }
        const dispensers = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "dispenser");
        for(let i = 0; i < dispensers.length; i++) { // okay NOW check dispensers
            const currentPlace = dispensers[i];
            if(currentPlace.onFire) { continue; }
            const item = Room.TryTakeObjectFromPlace(currentPlace, action.object, action.objAttrs);
            if(item !== null) {
                actingUser.activeActions.push("dispense");
                gameData.discordHelper.SayP(`${actingUser.nick} picked up ${Food.GetFoodDisplayNameFromObj(item)} from ${Food.FormatPlaceName(currentPlace.type, true)} ${Room.GetPlaceNumber(relevantPlaces, currentRoom, currentPlace.type, i)}!`);
                actingUser.holding = item;
                return;
            }
        }
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action), objNoArticle = objectDisplayName.replace(/^an? /, "");
        gameData.discordHelper.SayM(`${actingUser.nick} tried to grab ${objectDisplayName}, but there was no ${objNoArticle} in Room ${currentRoom + 1} to grab!`);
    },
    Throw: function(gameData, currentRoom, actingUser, action) {
        let target = action.to;
        if(target.indexOf("<@") === 0) { // @-tagged users are in the format of <@userID> (technically <@!userID> but we strip exclamation points out of messages)
            target = gameData.playerDetails[target.replace("<@", "").replace(">", "")].nick.toLowerCase();
        }
        const targetLowercase = target.toLowerCase();
        if(["monkey", "snake", "toucan", "ants", "bear"].indexOf(target) >= 0) { return self.ThrowAtAnimal(gameData, currentRoom, actingUser, action); }
        if(action.special !== "") { return self.ThrowClothing(gameData, actingUser, target, action.special); }
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to throw something to ${target}, but they aren't holding anything!`);
            return false;
        }
        const objectDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        if(actingUser.nick.toLowerCase() === targetLowercase) {
            gameData.discordHelper.SayP(`${actingUser.nick} juggles ${objectDisplayName} areund in their hands. Fun!`);
            return false;
        }
        for(const playerId in gameData.playerDetails) {
            const player = gameData.playerDetails[playerId];
            if(player.nick.toLowerCase() !== targetLowercase) { continue; }
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
    },
    ThrowClothing: function(gameData, actingUser, target, clothes) {
        if(!ClothingToss(actingUser, clothes)) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to throw their ${clothes} at ${target}, but they aren't wearing any!`);
            return false;
        }
        const targetLowercase = target.toLowerCase();
        if(actingUser.nick.toLowerCase() === targetLowercase) {
            gameData.discordHelper.SayP(`${actingUser.nick} just ripped their ${clothes} off and slammed them onto the floor. Unhygenic!`);
            actingUser.activeActions.push("strip");
            return false;
        }
        gameData.discordHelper.SayP(`${actingUser.nick} just ripped their ${clothes} off and threw them at ${target}. Now's not the time for that!`);
        actingUser.activeActions.push("strip");
        return true;
    },
    ThrowAtAnimal: function(gameData, currentRoom, actingUser, action) {
        if(gameData.map.gimmick === null || !gameData.map.gimmick.isAnimalGimmick) { return false; }
        const animal = action.to;
        const animalDisplayName = (animal === "ants" ? "group of ants" : animal);
        if(action.special !== "") {
            const clothes = action.special;
            if(!ClothingToss(actingUser, clothes)) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to throw their ${clothes}, but they aren't wearing any!`);
                return false;
            }
            actingUser.activeActions.push("strip");
            const success = gameData.map.gimmick.RepelAnimalInRoom(currentRoom, animal);
            if(success) {
                gameData.discordHelper.SayP(`${actingUser.nick} threw their ${clothes} at a ${animalDisplayName}, scaring them away!`);
                actingUser.activeActions.push("defender");
            } else {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to throw their ${clothes} at a ${animalDisplayName}, but there's' no ${animalDisplayName} in Room ${currentRoom + 1}, so their stripping was in vain!`);
            }
        } else if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to throw something, but they aren't holding anything!`);
            return false;
        } else {
            const success = gameData.map.gimmick.RepelAnimalInRoom(currentRoom, animal);
            if(success) {
                if(actingUser.holding.type === "extinguisher") { actingUser.activeActions.push("assault"); }
                const thingName = Food.GetFoodDisplayNameFromObj(actingUser.holding), noArticle = thingName.replace(/^an? /, "");
                gameData.discordHelper.SayP(`${actingUser.nick} threw ${thingName} at a ${animalDisplayName}, scaring them away! The ${noArticle} is now on the floor of Room ${currentRoom + 1}!`);
                actingUser.activeActions.push("defender");
            } else {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to throw ${Food.GetFoodDisplayNameFromObj(actingUser.holding)} at a ${animalDisplayName}, but there's no ${animalDisplayName} in Room ${currentRoom + 1}, so it landed on the floor!`);
            }
            const floor = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "floor")[0];
            if(floor === undefined) { return; }
            floor.contents.push(actingUser.holding);
            actingUser.holding = null;
        }
    }
};