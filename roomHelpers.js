const Food = require("./foodHelpers.js");
const self = module.exports = {
    GetObjectsInRoom: (map, roomNo) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0),
    GetObjectsOfTypeInRoom:(map, roomNo, type) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0 && item.type === type), 
    FindReceiverConveyorBelt:(map, to, from) => map.items.filter(item => item.type === "belt" && item.rooms.indexOf(to) >= 0 && item.from === from)[0], 
    FindCounter:(map) => map.items.filter(item => item.type === "counter")[0], 
    AreRoomsConnected: function(map, r1, r2) {
        const room1 = map.rooms[r1];
        for(const direction in room1) {
            if(room1[direction] === r2) { return true; }
        }
        return false;
    },
    GetPlaceNumber: function(roomContents, room, placeType, placeIdx) {
        let lastItemType = "", typeIter = 1;
        for(let i = 0; i < roomContents.length; i++) {
            const chosenPlace = roomContents[i];
            if(chosenPlace.rooms.indexOf(room) < 0) { continue; }
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
    TrySlipOnFloor: function(gameData, actingUser, actionType) {
        if(["find", "look", "what", "who", "holding"].indexOf(actionType) >= 0) { return false; } // passive actions can't slip you up!
        const floors = self.GetObjectsOfTypeInRoom(gameData.map, actingUser.room, "floor");
        if(floors.length === 0) { return false; }
        const floorContents = floors[0].contents;
        if(floorContents.length === 0) { return false; }
        for(let i = 0; i < floorContents.length; i++) {
            const item = floorContents[i];
            if(item.type === "extinguisher") { continue; } // those are allowed to be on the floor
            if(Math.random() < 0.25) {
                actingUser.stuckTimer = 10;
                const verb = (item.type === "plate" ? "shattering" : "ruining");
                gameData.discordHelper.SayM(`${actingUser.nick} was about to do something really important, but they slipped on ${Food.GetFoodDisplayNameFromObj(item)}, ${verb} it, and fell on their ass, stunning them for 10 seconds!`);
                floorContents.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    TryTakeObjectFromPlace: function(place, obj, objAttrs) {
        if(place.type === "dispenser") {
            if(place.dispensed !== obj) { return null; }
            if(place.amount <= 0) { return null; }
            place.amount -= 1;
            return Food.GetBaseFood(place.dispensed);
        }
        const contents = place.contents;
        if(contents === undefined) { return null; }
        let potentialFoodBasedOnClass = null;
        for(let i = 0; i < contents.length; i++) {
            const placeItem = contents[i];
            if(placeItem.class === obj) { potentialFoodBasedOnClass = placeItem; }
            if(placeItem.type !== obj) { continue; }
            if(!self.HasRightAttributes(placeItem, objAttrs)) { continue; }
            contents.splice(i, 1);
            return placeItem;
        }
        return potentialFoodBasedOnClass;
    },
    HasRightAttributes: function(placeItem, objAttrs) {
        for(let j = 0; j < objAttrs.length; j++) {
            const attr = objAttrs[j];
            if(attr === "standard") {
                if(placeItem.attributes.length > 0) {
                    return false;
                }
            } else if(placeItem.attributes.indexOf(attr) < 0) {
                return false;
            }
        }
        return true;
    },
    TryPlateObjectOnPlace: function(place, obj) {
        if(place.contents === undefined) { return "invalid"; }
        if(place.onFire) { return "onfire"; }
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            const itemInfo = contents[i];
            if(itemInfo.type !== "plate") { continue; }
            if(Food.HasAttribute(itemInfo, "dirty")) { continue; }
            contents.splice(i, 1);
            obj.attributes.push("plated");
            contents.push(obj);
            return "ok";
        }
        return "none";
    },
    TryAddObjectToPlace: function(place, obj) {
        if(place.type === "dispenser" || place.type === "counter") { return "invalid"; }
        if(place.onFire) { return "onfire"; }
        if(obj.type === "plate" && ["cuttingboard", "pan", "pot"].indexOf(place.type) >= 0) { return "invalid"; }
        if(place.contents.length >= place.size) { return "full"; }
        place.contents.push(obj);
        return "ok";
    },
    GetInspectionString: function(place, num, singular) {
        const formattedName = Food.FormatPlaceName(place.type, true);
        const opening = (singular ? "it" : (place.type === "floor" ? "the floor" : `${formattedName} ${num}`));
        let resultStr = "";
        if(place.type === "trashcan") {
            resultStr = `${opening} is full of trash.`;
        } else if(place.type === "dispenser") {
            resultStr = `${opening} has ${place.amount > 500 ? "a lot of" : place.amount} ${place.dispensed}${place.amount === 1 ? "" : "s"} left in it.`;
        } else if(place.contents === undefined) {
            resultStr = `${opening} definitely exists.`;
        } else {
            const onOrIn = (["table", "floor"].indexOf(place.type) < 0 ? "in" : "on");
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
            if(place.type === "belt") {
                if(place.to !== undefined) {
                    resultStr += ` it sends items to the receiving end in Room ${place.to + 1}.`;
                } else {
                    resultStr += ` it receives items from the sending end in Room ${place.from + 1}.`;
                }
            } else if(place.switchedOn !== undefined) {
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
                        resultStr += `the food is ready! Turn the ${formattedName} off in at least ${max - curTime} seconds for optimal cookery!`;
                    }
                } else {
                    resultStr += " it is turned off.";
                }
            }
        }
        if(place.onFire) { resultStr += " it is on fire." }
        return resultStr;
    }
};