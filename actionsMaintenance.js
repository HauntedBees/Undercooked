const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js"), GameHelper = require("./gameHelpers.js");
module.exports = {
    Serve: function(gameData, currentRoom, actingUser) {
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to serve some food, but they aren't holding anything!`);
            return false;
        }
        const objectDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding, true);
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "counter");
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, "serve", "counter")) { return; }
        
        const orders = gameData.orders;
        for(let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if(Food.DoesFoodMatchOrder(actingUser.holding, order)) {
                gameData.discordHelper.SayP(`${actingUser.nick} served ${objectDisplayName} and earned $${order.score}!`);
                actingUser.activeActions.push("serve");
                gameData.score += order.score;
                gameData.ordersCleared += 1;
                actingUser.holding = null;
                orders.splice(i, 1);
                return;
            } else if(!Food.HasAttribute(actingUser.holding, "plated")) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to serve ${objectDisplayName}, but it needs to be plated first!`);
            }
        }
        gameData.discordHelper.SayM(`${actingUser.nick} tried to serve ${objectDisplayName}, but nobody ordered that!`);
    },
    Plate: function(gameData, currentRoom, actingUser, action) {
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to plate something, but they aren't holding anything!`);
            return false;
        }
        const objectDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);//Food.GetFoodDisplayNameFromAction(action);
        const specificPlace = Food.FormatPlaceName(action.place, true), aPlace = Food.AorAN(specificPlace);
        
        const heldDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        if(actingUser.holding.type === "plate") { return gameData.discordHelper.SayM(`${actingUser.nick} tried to plate a plate! Why would you do that? What is your goal here?!`); }
        if(actingUser.holding.class === "cooking") { return gameData.discordHelper.SayM(`${actingUser.nick} tried to plate a ${objectDisplayName}! Why would you do that? What is your goal here?!`); }
        if(Food.HasAttribute(actingUser.holding, "plated")) { return gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName}, but it doesn't need ANOTHER plate!`); }

        let relevantPlaces = null, placeType = "";
        if(action.place === "") { // chose just any plate
            relevantPlaces = Room.GetObjectsInRoom(gameData.map, currentRoom);
            placeType = "";
        } else { // chose a plate in a specific type of place
            relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
            placeType = action.place;
        }
        
        if(relevantPlaces.length === 0) {
            if(placeType === "") { return gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on a ${aPlace}, but there is nothing that they can reach!`); }
            else { return gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on a ${aPlace}, but there is no ${specificPlace} that they can reach!`); }
        }
        if(action.placeNum > 0) { // chose a plate on a specific place (can never occur when placeType === "")
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
                return;
            }
            const plateStatus = Room.TryPlateObjectOnPlace(chosenPlace, actingUser.holding);
            switch(plateStatus) {
                case "ok":
                    actingUser.holding = null;
                    gameData.discordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${specificPlace} ${action.placeNum}!`);
                    actingUser.activeActions.push("plate");
                    break;
                case "none":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but there was no plate there!`);
                    break;
                case "onfire":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but it's on fire! Use a fire extinguisher to put it out first!`);
                    break;
                case "invalid":
                    gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName} on ${specificPlace} ${action.placeNum}, but you can't plate ${heldDisplayName} on ${aPlace}!!`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryPlateObjectOnPlace(relevantPlaces[i], actingUser.holding);
                if(attempt === "ok") {
                    if(placeType === "") {
                        gameData.discordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${Food.FormatPlaceName(relevantPlaces[i].type, true)} ${Room.GetPlaceNumber(relevantPlaces, currentRoom, relevantPlaces[i].type, i)}!`);
                    } else {
                        gameData.discordHelper.SayP(`${actingUser.nick} plated ${heldDisplayName} on ${specificPlace} ${i + 1}!`);
                    }
                    actingUser.activeActions.push("plate");
                    actingUser.holding = null;
                    return;
                }
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to plate ${heldDisplayName}, but couldn't find any available plates!`);
        }    
    },
    Use: function(gameData, currentRoom, actingUser, action) {
        if(actingUser.holding === null) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to use something, but they aren't holding anything!`);
            return false;
        }
        if(action.place === "stove") { action.place = "pot"; }
        const heldDisplayName = Food.GetFoodDisplayNameFromObj(actingUser.holding);
        const heldTheirDisplayName = heldDisplayName.replace(/^an? /, "their ");
        const relevantPlaces = (action.place === "") ? Room.GetObjectsInRoom(gameData.map, currentRoom) : Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(actingUser.holding.type === "extinguisher") {
            if(action.placeNum > 0) {
                const chosenPlace = relevantPlaces[action.placeNum - 1];
                if(!chosenPlace.onFire) {
                    gameData.discordHelper.SayM(`${actingUser.nick} wanted to use ${heldTheirDisplayName} on ${Food.FormatPlaceName(chosenPlace.type, true)} ${action.placeNum}, but it isn't on fire!`);
                    return;
                }
                chosenPlace.onFire = false;
                gameData.discordHelper.SayP(`${actingUser.nick} used ${heldTheirDisplayName} on ${Food.FormatPlaceName(chosenPlace.type, true)} ${action.placeNum}, putting out the fire! Hooray!`);
                actingUser.activeActions.push("extinguish");
            } else {
                for(let i = 0; i < relevantPlaces.length; i++) {
                    const chosenPlace = relevantPlaces[i];
                    if(!chosenPlace.onFire) { continue; }
                    chosenPlace.onFire = false;
                    gameData.discordHelper.SayP(`${actingUser.nick} used ${heldTheirDisplayName} on ${Food.FormatPlaceName(chosenPlace.type)}, putting out the fire! Hooray!`);
                    actingUser.activeActions.push("extinguish");
                    return;
                }
                if(action.place === "") {
                    gameData.discordHelper.SayM(`${actingUser.nick} wanted to use ${heldTheirDisplayName}, but nothing's on fire!`);
                } else {
                    gameData.discordHelper.SayM(`${actingUser.nick} wanted to use ${heldTheirDisplayName} on ${Food.FormatPlaceName(action.place)}, but none of them are on fire!`);
                }
            }
        } else {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to use ${heldDisplayName}, but you can't use ${heldDisplayName}!`);
            return;
        }
        
    },
    Wash: function(gameData, currentRoom, actingUser) {
        if(!GameHelper.HoldingCheck(gameData.discordHelper, actingUser, "wash", { object: "plate" }, "a plate")) { return; }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "sink");
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, "wash a plate", "sink")) { return; }
        actingUser.holding.attributes = [];
        gameData.discordHelper.SayP(`${actingUser.nick} washed a plate. Good for them!`);
        actingUser.activeActions.push("wash");
    }
}