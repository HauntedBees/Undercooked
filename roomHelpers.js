const Food = require("./foodHelpers.js");
module.exports = {
    GetObjectsInRoom: (map, roomNo) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0),
    GetObjectsOfTypeInRoom: (map, roomNo, type) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0 && item.type === type), 
    GetPlaceNumber: function(roomContents, placeType, placeIdx) {
        let lastItemType = "", typeIter = 1;
        for(let i = 0; i < roomContents.length; i++) {
            const chosenPlace = roomContents[i];
            if(chosenPlace.type !== lastItemType) {
                lastItemType = chosenPlace.type;
                typeIter = 1;
            }
            if(chosenPlace.type === placeType && placeIdx === i) {
                return typeIter;
            }
            typeIter += 1;
        }
        return 1;
    },
    TryTakeObjectFromPlace: function(place, obj) {
        if(place.type === "dispenser") {
            if(place.dispensed !== obj) { return null; }
            if(place.amount <= 0) { return null; }
            place.amount -= 1;
            return Food.GetBaseFood(place.dispensed);
        }
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            const placeItem = contents[i];
            if(placeItem.type !== obj) { continue; }
            contents.splice(i, 1);
            return placeItem;
        }
        return null;
    },
    TryPlateObjectOnPlace: function(place, obj) {
        if(place.contents === undefined) { return "invalid"; }
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            const itemInfo = contents[i];
            if(itemInfo.type !== "plate") { continue; }
            contents.splice(i, 1);
            obj.attributes.push("plated");
            contents.push(obj);
            return "ok";
        }
        return "none";
    },
    TryAddObjectToPlace: function(place, obj) {
        if(place.type === "dispenser" || place.type === "output") { return "invalid"; }
        if(obj.type === "plate" && ["cuttingboard", "pan", "pot"].indexOf(place.type)) { return "invalid"; }
        if(place.contents.length >= place.size) { return "full"; }
        place.contents.push(obj);
        return "ok";
    },
    GetInspectionString: function(place, num, singular) {
        const formattedName = Food.FormatPlaceName(place.type, true);
        const opening = (singular ? "it" : (place.type === "floor" ? "the floor" : `${formattedName} ${num}`));
        if(place.type === "trashcan") { return `${opening} is full of trash.`; }
        if(place.type === "dispenser") { return `${opening} has ${place.amount} ${place.dispensed}${place.amount === 1 ? "" : "s"} left in it.`; }
        if(place.contents === undefined) { return `${opening} definitely exists.`; }

        const onOrIn = (["table", "floor"].indexOf(place.type) < 0 ? "in" : "on");
        let resultStr = "";
        if(place.contents.length === 0) {
            if(place.type === "table") {
                resultStr = `${opening} has nothing on it.`;
            } else if(place.type === "floor") {
                resultStr = `${opening} is spotless.`;
            } else {
                resultStr = `${opening} is empty.`;
            }
        } else if(place.contents.length === 1) {
            resultStr = `${opening} has ${Food.GetFoodDisplayNameFromObj(place.contents[0])} ${onOrIn} it.`;
        } else if(place.contents.length === 2) {
            resultStr = `${opening} has ${Food.GetFoodDisplayNameFromObj(place.contents[0])} and ${Food.GetFoodDisplayNameFromObj(place.contents[1])} ${onOrIn} it.`;
        } else {
            resultStr = `${opening} has the following items ${onOrIn} it: `;
            for(let i = 0; i < place.contents.length; i++) {
                const foodName = Food.GetFoodDisplayNameFromObj(place.contents[i]);
                if(i === (place.contents.length - 1)) {
                    resultStr += `and ${foodName}.`;
                } else {
                    resultStr += `${foodName}, `;
                }
            }
        }
        if(place.switchedOn !== undefined) {
            if(place.switchedOn) {
                resultStr += " it is on and cooking; ";
                const curTime = place.cookingTime;
                const min = place.cookRangeDetails.time - place.cookRangeDetails.range;
                const max = place.cookRangeDetails.time + place.cookRangeDetails.range;
                if(curTime < min) {
                    resultStr += `the food will be ready in ${min - curTime}-${max - curTime} seconds.`;
                } else if(curTime > max) {
                    resultStr += `the food is, heh, overcooked! It's been ready for ${curTime - max} seconds.`;
                } else {
                    resultStr += `the food is ready! Turn the ${place} off in at least ${max - curTime} seconds for optimal cookery!`;
                }
            } else {
                resultStr += " it is turned off.";
            }
        }
        return resultStr;
    }
};