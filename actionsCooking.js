const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js"), GameHelper = require("./gameHelpers.js");
module.exports = {
    Fry: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        if(!GameHelper.EmptyHandsCheck(gameData.discordHelper, actingUser, "fry", objectDisplayName)) { return; }
       
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "pan");
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, "fry", "frying pan")) { return; }
        
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(!GameHelper.ChosenPlaceCheck(gameData.discordHelper, actingUser, chosenPlace, action, objectDisplayName, relevantPlaces.length, "fry", "frying pan")) { return; }
            
            const itemInfo = chosenPlace.contents[0];
            if(itemInfo.type !== action.object) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to fry ${objectDisplayName} on frying pan ${action.placeNum}, but all that's on there is ${Food.GetFoodDisplayNameFromObj(itemInfo)}!`);
                return;
            }
            if(!GameHelper.DuplicateAttributeCheck(gameData.discordHelper, itemInfo, "fried", "fry")) { return false; }
            chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "fried");
            gameData.discordHelper.SayP(`${actingUser.nick} fried ${objectDisplayName} on frying pan ${action.placeNum}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                if(chosenPlace.contents.length === 0) { continue; }
                const itemInfo = chosenPlace.contents[0];
                if(itemInfo.type !== action.object) { continue; }
                if(!GameHelper.DuplicateAttributeCheck(gameData.discordHelper, itemInfo, "fried")) { continue; }
                chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "fried");
                gameData.discordHelper.SayP(`${actingUser.nick} fried ${objectDisplayName} on frying pan ${i + 1}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
                return;
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to fry ${objectDisplayName}, but none of the frying pans had ${objectDisplayName} that needed frying on them!`);
        }
    },
    Chop: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const objectDisplayName = Food.GetFoodDisplayNameFromAction(action);
        if(!GameHelper.EmptyHandsCheck(gameData.discordHelper, actingUser, "chop", objectDisplayName)) { return; }
        
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "cuttingboard");
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, "chop", "cutting board")) { return; }
       
        if(action.placeNum > 0) {
            const chosenPlace = relevantPlaces[action.placeNum - 1];
            if(!GameHelper.ChosenPlaceCheck(gameData.discordHelper, actingUser, chosenPlace, action, objectDisplayName, relevantPlaces.length, "chop", "cutting board")) { return; }
            
            const itemInfo = chosenPlace.contents[0];
            if(itemInfo.type !== action.object) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to chop ${objectDisplayName} on cutting board ${action.placeNum}, but all that's on there is ${Food.GetFoodDisplayNameFromObj(itemInfo)}!`);
                return;
            }
            if(!GameHelper.DuplicateAttributeCheck(gameData.discordHelper, itemInfo, "sliced", "chop")) { return false; }
            chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "sliced");
            gameData.discordHelper.SayP(`${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${action.placeNum}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
        } else {
            for(let i = 0; i < relevantPlaces.length; i++) {
                const chosenPlace = relevantPlaces[i];
                if(chosenPlace.contents.length === 0) { continue; }
                const itemInfo = chosenPlace.contents[0];
                if(itemInfo.type !== action.object) { continue; }
                if(!GameHelper.DuplicateAttributeCheck(gameData.discordHelper, itemInfo, "sliced")) { continue; }
                chosenPlace.contents[0] = Food.AddAttribute(itemInfo, "sliced");
                gameData.discordHelper.SayP(`${actingUser.nick} chopped up ${objectDisplayName} on cutting board ${i + 1}, and made ${Food.GetFoodDisplayNameFromObj(chosenPlace.contents[0])}!`);
                return;
            }
            gameData.discordHelper.SayM(`${actingUser.nick} tried to chop ${objectDisplayName}, but none of the cutting boards had ${objectDisplayName} that needed chopping on them!`);
        }
    },
    Turn: function(gameData, userID, action) {
        const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, action.place);
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, `turn ${action.switchType}`, action.displayPlace)) { return; }
        if(action.placeNum < 0 && relevantPlaces.length > 1) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to turn ${action.switchType} ${Food.AorAN(action.displayPlace)}, but there are ${relevantPlaces.length} of those, and they didn't specify which one!`);
            return;
        }
        const placeNum = action.placeNum < 0 ? 0 : (action.placeNum - 1);
        const chosenPlace = relevantPlaces[placeNum];
        if(chosenPlace === undefined) {
            gameData.discordHelper.SayM(`${actingUser.nick} tried to turn ${action.switchType} ${action.displayPlace} ${action.placeNum}, but there are only ${relevantPlaces.length} of those!`);
            return false;
        }
        if(chosenPlace.switchedOn && action.switchType === "on") { return gameData.discordHelper.SayM(`${actingUser.nick} tried to turn on ${action.displayPlace} ${placeNum + 1}, but it's already on!`); }
        if(!chosenPlace.switchedOn && action.switchType === "off") { return gameData.discordHelper.SayM(`${actingUser.nick} tried to turn off ${action.displayPlace} ${placeNum + 1}, but it's already off!`); }
        if(chosenPlace.contents.length === 0 && !chosenPlace.switchedOn) { return gameData.discordHelper.SayM(`${actingUser.nick} tried to turn on ${action.displayPlace} ${placeNum + 1}, but it's empty! Put some food in it before turning it on!`); }

        if(action.switchType === "on") {
            chosenPlace.switchedOn = true;
            chosenPlace.modifier = 1;
            chosenPlace.cookingTime = 0;
            chosenPlace.cookRangeDetails = Food.GetCookTime(chosenPlace, gameData.gameSpeed);
            chosenPlace.burnTime = chosenPlace.cookRangeDetails.time + chosenPlace.cookRangeDetails.range * 4;
            const newFood = Food.TransformFood(chosenPlace);
            gameData.discordHelper.SayP(`${actingUser.nick} turned ${action.displayPlace} ${placeNum + 1} on, and is now boiling ${Food.GetFoodDisplayNameFromObj(newFood)}!
+ It will be ready in ${chosenPlace.cookRangeDetails.time - chosenPlace.cookRangeDetails.range}-${chosenPlace.cookRangeDetails.time + chosenPlace.cookRangeDetails.range} seconds!`);
        } else {
            chosenPlace.switchedOn = false;
            chosenPlace.modifier = Food.GetCookingModifier(chosenPlace);
            const newFood = Food.TransformFood(chosenPlace);
            chosenPlace.contents = [ newFood ];
            gameData.discordHelper.SayP(`${actingUser.nick} turned ${action.displayPlace} ${placeNum + 1} off and made ${Food.GetFoodDisplayNameFromObj(newFood)}!`);
        }
    },
    Mix: function(gameData, currentRoom, actingUser, action) {
        if(!GameHelper.EmptyHandsCheck(gameData.discordHelper, actingUser, "mix", "up a bowl")) { return; }
        const relevantPlaces = Room.GetObjectsOfTypeInRoom(gameData.map, currentRoom, "bowl");
        if(!GameHelper.NoPlacesCheck(gameData.discordHelper, actingUser, relevantPlaces, "mix the contents of", "mixing bowl")) { return; }
        const chosenPlace = relevantPlaces[action.placeNum - 1];
        if(!GameHelper.ChosenPlaceCheck(gameData.discordHelper, actingUser, chosenPlace, action, "some stuff", relevantPlaces.length, "mix", "mixing bowl")) { return; }
        const newFood = Food.TransformFood(chosenPlace);
        chosenPlace.contents = [ newFood ];
        gameData.discordHelper.SayP(`${actingUser.nick} mixed the contents of mixing bowl ${action.placeNum} and made ${Food.GetFoodDisplayNameFromObj(newFood)}!`);
    }
};