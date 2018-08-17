const self = module.exports = {
    GetObjectsInRoom: (map, roomNo) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0),
    GetObjectsOfTypeInRoom: (map, roomNo, type) => map.items.filter(item => item.rooms.indexOf(roomNo) >= 0 && item.type === type), 
    TryTakeObjectFromPlace: function(place, obj) {
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            const itemInfo = contents[i];
            if(itemInfo.item.indexOf(obj) !== 0) { continue; }
            if(itemInfo.amount <= 0) { continue; }
            itemInfo.amount -= 1;
            return itemInfo.item;
        }
        return "";
    },
    TryPlateObjectOnPlace: function(place, obj) {
        if(place.type === "dispenser") { return "invalid"; }
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            const itemInfo = contents[i];
            if(itemInfo.item !== "plate" || itemInfo.amount <= 0) { continue; }
            itemInfo.amount -= 1;
            if(itemInfo.amount === 0) {
                contents.splice(i, 1);
            }
            contents.push({ item: `${obj}_plated`, amount: 1 });
            return "ok";
        }
        return "none";
    },
    TryAddObjectToPlace: function(place, obj) {
        if(place.type === "dispenser") { return "invalid"; }

        let numItems = 0;
        const contents = place.contents;
        for(let i = 0; i < contents.length; i++) {
            numItems += contents[i].amount;
        }
        if(numItems >= place.size) { return "full"; }

        for(let i = 0; i < contents.length; i++) {
            const itemInfo = contents[i];
            if(itemInfo.item.indexOf(obj) !== 0) { continue; }
            itemInfo.amount += 1;
            return "ok";
        }
        contents.push({ item: obj, amount: 1 });
        return "ok";
    },
    ServedRecipeName: s => self.AorAN(self.FormatIngredientName(s.replace("_plated", ""))),
    AorANFormattedIngredientName: s => self.AorAN(self.FormatIngredientName(s)),
    AorANFormattedPlaceName: s => self.AorAN(self.FormatPlaceName(s)),
    AorAN: function(s) {
        if(["a", "e", "i", "o", "u"].indexOf(s[0]) >= 0) { return `n ${s}`; }
        return ` ${s}`;
    },
    FormatPlaceName: function(s) {
        if(s === "cuttingboard") { return "cutting board"; }
        return s;
    },
    FormatIngredientName: function(s) {
        if(s.indexOf("_") < 0) { return s; }
        const split = s.split("_");
        let food = split[0];
        for(let i = 1; i < split.length; i++) {
            switch(split[i]) {
                case "sliced": food = `chopped ${food}`; break;
                case "plated": food = `plated ${food}`; break;
            }
        }
        return food;
    }
};