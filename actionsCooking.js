const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js");
const DiscordHelper = require("./discordHelper.js"), GameHelper = require("./gameHelpers.js");
module.exports = {
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
    }
};