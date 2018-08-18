const Food = require("./foodHelpers.js");
module.exports = {
    GetObjectsInRoom: (map, roomNo) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0),
    GetObjectsOfTypeInRoom: (map, roomNo, type) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0 && item.type === type), 
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
        if(place.type === "dispenser") { return "invalid"; }
        if(place.contents.length >= place.size) { return "full"; }
        place.contents.push(obj);
        return "ok";
    }
};