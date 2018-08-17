const Room = require("./roomHelpers.js"), DiscordHelper = require("./discordHelper.js"), Strings = require("./strings.js");
const t = "```", d = "```diff", dn = `${d}
`;
const self = module.exports = {
    ShowHelp: function() {
        DiscordHelper.Say(Strings.HELP1);
        DiscordHelper.Say(Strings.HELP2);
        return true;
    },
    MainLoop: function(gameData) {
        gameData.secondsPlayed += 1;
        if(gameData.secondsPlayed % 30 === 0) {
            const orders = gameData.map.potentialOrders;
            const order = orders[Math.floor(Math.random() * orders.length)];
            gameData.orders.push(order);
            DiscordHelper.Say(`${dn}+ Order up! Somebody wants a${Room.AorANFormattedIngredientName(order.item)}, an order worth $${order.score}!${t}`);
        }
    },
    HandleAction: function(gameData, userID, action) {
        try {
            switch(action.type) {
                case "grab": return self.Grab(gameData, userID, action);
                case "drop": return self.Drop(gameData, userID, action);
                case "chop": return self.Chop(gameData, userID, action);
                case "plate": return self.Plate(gameData, userID, action);
                case "serve": return self.Serve(gameData, userID, action);
            }
        } catch(e) {
            DiscordHelper.LogError(`Something broke with action ${JSON.stringify(action)} by user ${userID}.`);
            DiscordHelper.LogError(`Exception: ${JSON.stringify(e)}`);
            DiscordHelper.Say(`${dn}- Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.${t}`);
        }
    },
    Serve: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = `a${Room.ServedRecipeName(action.object)}`;
        if(actingUser.holding === "") {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to serve ${objectDisplayName}, but they aren't holding anything!${t}`);
            return;
        }
        if(actingUser.holding.indexOf(action.object) !== 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to serve ${objectDisplayName}, but they aren't holding one!${t}`);
            return;
        }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "output");
        if(relevantPlaces.length === 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to serve ${objectDisplayName}, but they have nowhere to serve it in their room!${t}`);
            return;
        }
        const orders = gameData.orders;
        for(let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const actualOrder = `${order.item}_plated`;
            if(actualOrder === actingUser.holding) {
                DiscordHelper.Say(`${dn}+ ${actingUser.nick} served ${objectDisplayName} and earned $${order.score}!${t}`);
                gameData.score += order.score;
                actingUser.holding = "";
                orders.splice(i, 1);
                return;
            }
        }
        DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to serve ${objectDisplayName}, but nobody ordered that!${t}`);
    },
    Chop: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = `a${Room.AorANFormattedIngredientName(action.object)}`;
        if(actingUser.holding !== "") {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName}, but their hands are full!${t}`);
            return;
        }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "cuttingboard");
        if(relevantPlaces.length === 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName}, but there are no cutting boards that they can reach!${t}`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName} on cutting board ${action.placeNum}, but there are only ${relevantPlaces.length} of those!${t}`);
                return;
            }
            if(chosenPlace.contents.length === 0) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName} on cutting board ${action.placeNum}, but that cutting board has nothing on it!${t}`);
                return;
            }
            const itemInfo = chosenPlace.contents[0];
            if(itemInfo.item !== action.object) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName} on cutting board ${action.placeNum}, but all that's on there is a${Room.AorAN(Room.FormatIngredientName(itemInfo.item))}!${t}`);
                return;
            }
            itemInfo.item += "_sliced";
            DiscordHelper.Say(`${dn}+ ${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${action.placeNum}, and made a${Room.AorAN(Room.FormatIngredientName(itemInfo.item))}!${t}`);
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                if(chosenPlace.contents.length === 0) { continue; }
                const itemInfo = chosenPlace.contents[0];
                if(itemInfo.item !== action.object) { continue; }
                itemInfo.item += "_sliced";
                DiscordHelper.Say(`${dn}+ ${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${i + 1}, and made a${Room.AorAN(Room.FormatIngredientName(itemInfo.item))}!${t}`);
                return;
            }
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to chop ${objectDisplayName}, but none of the cutting boards had ${objectDisplayName} on them!${t}`);
        }
    },
    Plate: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = `a${Room.AorANFormattedIngredientName(action.object)}`;
        const generalPlaceDisplayName = Room.FormatPlaceName(action.place), placeDisplayName = `a${Room.AorAN(generalPlaceDisplayName)}`;
        if(actingUser.holding.indexOf(action.object) !== 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${objectDisplayName}, but they aren't holding one!${t}`);
            return;
        }
        const heldDisplayName = `a${Room.AorANFormattedIngredientName(actingUser.holding)}`;
        if(actingUser.holding.indexOf("_plated") >= 0) { // it's already on a plate!
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${objectDisplayName}, but it doesn't need ANOTHER plate!${t}`);
            return;
        }
        let relevantPlaces = null, placeType = "";
        if(action.place === "") { // chose just any plate
            relevantPlaces = Room.GetObjectsInRoom(gameData.map, currentRoom);
            placeType = "";
        } else { // chose a plate in a specific type of place
            relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
            placeType = action.place;
        }
        if(relevantPlaces.length === 0) {
            if(placeType === "") {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName} on a ${placeDisplayName}, but there is nothing that they can reach!${t}`);
            } else {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName} on a ${placeDisplayName}, but there is no ${action.place} that they can reach!${t}`);
            }
            return;
        }
        if(action.placeNum > 0) { // chose a plate on a specific place (can never occur when placeType === "")
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName} on ${generalPlaceDisplayName} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!${t}`);
                return;
            }
            const plateStatus = Room.TryPlateObjectOnPlace(chosenPlace, actingUser.holding);
            switch(plateStatus) {
                case "ok":
                    actingUser.holding = "";
                    DiscordHelper.Say(`${dn}+ ${actingUser.nick} plated ${heldDisplayName} on ${generalPlaceDisplayName} ${action.placeNum}!${t}`);
                    break;
                case "none":
                    DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName} on ${generalPlaceDisplayName} ${action.placeNum}, but there was no plate there!${t}`);
                    break;
                case "invalid":
                    DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName} on ${generalPlaceDisplayName} ${action.placeNum}, but you can't plate ${heldDisplayName} on ${placeDisplayName}!!${t}`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryPlateObjectOnPlace(relevantPlaces[i], actingUser.holding);
                if(attempt === "ok") {
                    if(placeType === "") {
                        DiscordHelper.Say(`${dn}+ ${actingUser.nick} plated ${heldDisplayName} on a${Room.AorANFormattedPlaceName(relevantPlaces[i].type)}!${t}`); // TODO: add number?
                    } else {
                        DiscordHelper.Say(`${dn}+ ${actingUser.nick} plated ${heldDisplayName} on ${generalPlaceDisplayName} ${i + 1}!${t}`);
                    }
                    actingUser.holding = "";
                    return;
                }
            }
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to plate ${heldDisplayName}, but couldn't find any plates!${t}`);
        }    
    },
    Drop: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = `a${Room.AorANFormattedIngredientName(action.object)}`;
        const generalPlaceDisplayName = Room.FormatPlaceName(action.place), placeDisplayName = `a${Room.AorAN(generalPlaceDisplayName)}`;
        if(actingUser.holding.indexOf(action.object) !== 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to drop ${objectDisplayName}, but they aren't holding one!${t}`);
            return;
        }
        if(action.place === "plate") {
            self.Plate(gameData, userID, {
                type: "plate",
                object: action.object,
                place: "", placeNum: -1
            });
            return;
        }
        const heldDisplayName = `a${Room.AorANFormattedIngredientName(actingUser.holding)}`;
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(relevantPlaces.length === 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to drop ${heldDisplayName} on ${placeDisplayName}, but there is no ${action.place} that they can reach!${t}`);
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to put ${heldDisplayName} on ${generalPlaceDisplayName} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!${t}`);
                return;
            }
            const addStatus = Room.TryAddObjectToPlace(chosenPlace, actingUser.holding);
            switch(addStatus) {
                case "ok":
                    actingUser.holding = "";
                    DiscordHelper.Say(`${dn}+ ${actingUser.nick} put ${heldDisplayName} down on ${generalPlaceDisplayName} ${action.placeNum}!${t}`);
                    break;
                case "full":
                    DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to put ${heldDisplayName} down on ${generalPlaceDisplayName} ${action.placeNum}, but there was no more room!${t}`);
                    break;
                case "invalid":
                    DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to put ${heldDisplayName} down on ${generalPlaceDisplayName} ${action.placeNum}, but you can't put ${heldDisplayName} on ${placeDisplayName}!!${t}`);
                    break;
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const attempt = Room.TryAddObjectToPlace(relevantPlaces[i], action.object);
                if(attempt === "ok") {
                    DiscordHelper.Say(`${dn}+ ${actingUser.nick} put ${heldDisplayName} down on ${generalPlaceDisplayName} ${i + 1}!${t}`);
                    actingUser.holding = "";
                    return;
                }
                if(attempt === "invalid") {
                    DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to put ${heldDisplayName} down on ${placeDisplayName}, but you can't put ${heldDisplayName} on ${placeDisplayName}!!${t}`);
                    return;
                }
            }
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to put ${heldDisplayName} down on ${placeDisplayName}, but there was no more room!${t}`);
        }
    },
    Grab: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = `a${Room.AorANFormattedIngredientName(action.object)}`;
        const generalPlaceDisplayName = Room.FormatPlaceName(action.place), placeDisplayName = `a${Room.AorAN(generalPlaceDisplayName)}`;
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(relevantPlaces.length === 0) {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to grab ${objectDisplayName} from ${placeDisplayName}, but there is no ${action.place} that they can reach!${t}`);
            return;
        }
        if(actingUser.holding !== "") {
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to grab ${objectDisplayName}, but their hands are already full with a${Room.AorAN(actingUser.holding)}!${t}`)
            return;
        }
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(chosenPlace === undefined) {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to grab ${objectDisplayName} from ${generalPlaceDisplayName} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!${t}`);
                return;
            }
            const item = Room.TryTakeObjectFromPlace(chosenPlace, action.object);
            if(item !== "") {
                DiscordHelper.Say(`${dn}+ ${actingUser.nick} picked up a${Room.AorANFormattedIngredientName(item)} from ${generalPlaceDisplayName} ${action.placeNum}!${t}`);
                actingUser.holding = item;
            } else {
                DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to grab ${objectDisplayName} from ${generalPlaceDisplayName} ${action.placeNum}, but there was no ${action.object} there to grab!${t}`);
            }
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const item = Room.TryTakeObjectFromPlace(relevantPlaces[i], action.object);
                if(item !== "") {
                    DiscordHelper.Say(`${dn}+ ${actingUser.nick} picked up a${Room.AorANFormattedIngredientName(item)} from ${generalPlaceDisplayName} ${i + 1}!${t}`);
                    actingUser.holding = item;
                    return;
                }
            }
            DiscordHelper.Say(`${dn}- ${actingUser.nick} tried to grab ${objectDisplayName} from ${placeDisplayName}, but there was no ${action.object} there to grab!${t}`);
        }
    }
};