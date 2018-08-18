const Food = require("./foodHelpers.js"), DiscordHelper = require("./discordHelper.js");
module.exports = {
    HoldingCheck: function(actingUser, verb, action, objectDisplayName) {
        if(actingUser.holding === null) {
            DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but they aren't holding anything!`);
            return false;
        }
        if(actingUser.holding.type !== action.object) {
            DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but they aren't holding one!`);
            return false;
        }
        return true;
    },
    EmptyHandsCheck: function(actingUser, verb, objectDisplayName) {
        if(actingUser.holding === null) { return true; }
        DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but their hands are already full with ${Food.GetFoodDisplayNameFromObj(actingUser.holding)}!`)
        return false;
    },
    NoPlacesCheck: function(actingUser, relevantPlaces, verb, place) {
        if(relevantPlaces.length > 0) { return true; }
        DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.AorAN(place)}, but there are no ${place}s in their room!`);
        return false;
    },
    ChosenPlaceCheck: function(actingUser, chosenPlace, action, objectDisplayName, placeCount, verb, noun) {
        if(chosenPlace === undefined) {
            DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName} on ${noun} ${action.placeNum}, but there are only ${placeCount} of those!`);
            return false;
        }
        if(chosenPlace.contents.length === 0) {
            DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName} on ${noun} ${action.placeNum}, but it has nothing on it!`);
            return false;
        }
        return true;
    },
    DuplicateAttributeCheck: function(food, newAttr, verb) {
        if(Food.HasAttribute(food, newAttr)) {
            if(verb !== undefined) { DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.GetFoodDisplayNameFromObj(food)}, but it's already ${newAttr}!`); }
            return false;
        } else if(Food.HasAttribute(food, "plated")) {
            if(verb !== undefined) { DiscordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.GetFoodDisplayNameFromObj(food)}, but it's already been plated!`); }
            return false;
        }
        return true;
    }
};