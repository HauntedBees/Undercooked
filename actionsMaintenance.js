const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js");
const DiscordHelper = require("./discordHelper.js"), GameHelper = require("./gameHelpers.js");
module.exports = {
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
    }
}