const Food = require("./foodHelpers.js");
module.exports = {
    HoldingCheck: function(discordHelper, actingUser, verb, action, objectDisplayName) {
        if(actingUser.holding === null) {
            discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but they aren't holding anything!`);
            return false;
        }
        if(actingUser.holding.type !== action.object) {
            discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but they aren't holding one!`);
            return false;
        }
        return true;
    },
    EmptyHandsCheck: function(discordHelper, actingUser, verb, objectDisplayName) {
        if(actingUser.holding === null) { return true; }
        discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName}, but their hands are already full with ${Food.GetFoodDisplayNameFromObj(actingUser.holding)}!`)
        return false;
    },
    NoPlacesCheck: function(discordHelper, actingUser, relevantPlaces, verb, place) {
        if(relevantPlaces.length > 0) { return true; }
        discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.AorAN(place)}, but there are no ${place}s in their room!`);
        return false;
    },
    ChosenPlaceCheck: function(discordHelper, actingUser, chosenPlace, action, objectDisplayName, placeCount, verb, noun) {
        if(chosenPlace === undefined) {
            discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName} on ${noun} ${action.placeNum}, but there are only ${placeCount} of those!`);
            return false;
        }
        if(chosenPlace.contents.length === 0) {
            discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${objectDisplayName} on ${noun} ${action.placeNum}, but it has nothing on it!`);
            return false;
        }
        return true;
    },
    DuplicateAttributeCheck: function(discordHelper, food, newAttr, verb) {
        if(Food.HasAttribute(food, newAttr)) {
            if(verb !== undefined) { discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.GetFoodDisplayNameFromObj(food)}, but it's already ${newAttr}!`); }
            return false;
        } else if(Food.HasAttribute(food, "plated")) {
            if(verb !== undefined) { discordHelper.SayM(`${actingUser.nick} tried to ${verb} ${Food.GetFoodDisplayNameFromObj(food)}, but it's already been plated!`); }
            return false;
        }
        return true;
    }
};