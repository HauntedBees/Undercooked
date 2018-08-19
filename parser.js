const Food = require("./foodHelpers.js");
const synonyms = {
    "pick up": "grab",
    "frying pan": "pan",
    "cooking pan": "pan",
    "skillet": "pan",
    "frypan": "pan",
    "cutting board": "cuttingboard",
    "chopping board": "cuttingboard",
    "butcher block": "cuttingboard",
    "butcher board": "cuttingboard",
    "chopping block": "cuttingboard",
    "chopper": "cuttingboard",
    "dish": "plate",
    "dishes": "plate",
    "search for": "search",
    "hunt for": "hunt"
};
const grabVerbs = ["grab", "take", "get", "acquire", "procure", "obtain"];
const dropVerbs = ["drop", "put", "place", "plop", "set", "deposit", "position"];
const chopVerbs = ["cut", "chop", "slice", "dice", "mince", "stab", "knife", "julienne", "chiffonade"];
const serveVerbs = ["serve", "deliver", "provide", "supply"];
const moveVerbs = ["walk", "move", "go"];
const fryVerbs = ["fry", "sautee", "sauté", "sear", "brown", "sizzle"];
const turnVerbs = ["turn", "switch", "flip"];
const lookVerbs = ["look", "inspect", "view", "see"];
const findVerbs = ["find", "search", "locate", "hunt", "seek"];
const self = module.exports = {
    Parse: function(s) {
        if(s === "") { return null; }
        s = s.trim().replace(/[.,!:;'"]/g, "").replace(/\s+/g, " ").toLowerCase();
        for(const word in synonyms) { s = s.replace(word, synonyms[word]); }
        s = Food.FlattenFoodNames(s);

        const splitWord = s.split(" ");
        const firstWord = splitWord[0], remainingWords = s.substring(s.indexOf(" ") + 1);
        
        if(remainingWords === "") { return null; } // EH: order these in likelihood of usage, since obviously the speed of comparing a few dozen strings is a big fucking bottleneck 
        if(grabVerbs.indexOf(firstWord) >= 0) { return self.Grab(remainingWords); }
        if(dropVerbs.indexOf(firstWord) >= 0) { return self.Drop(remainingWords); }
        if(chopVerbs.indexOf(firstWord) >= 0) { return self.Chop(remainingWords); }
        if(serveVerbs.indexOf(firstWord) >= 0) { return self.Serve(remainingWords); }
        if(moveVerbs.indexOf(firstWord) >= 0) { return self.Move(remainingWords); }
        if(fryVerbs.indexOf(firstWord) >= 0) { return self.Fry(remainingWords); }
        if(turnVerbs.indexOf(firstWord) >= 0) { return self.Turn(remainingWords); }
        if(lookVerbs.indexOf(firstWord) >= 0) { return self.Look(remainingWords); }
        if(findVerbs.indexOf(firstWord) >= 0) { return self.Find(remainingWords); }
        if(firstWord === "plate") { return self.Plate(remainingWords); }
        if(firstWord === "who") { return self.Who(remainingWords); }
        if(firstWord === "what") { return self.What(remainingWords); }

        return null;
    },
    What: function(s) { // (is) {$obj}
        const splitStr = s.split(" ");
        if(splitStr[0] === "is") { splitStr.shift(); }
        if(splitStr.length !== 1) { return null; }
        return { type: "what", object: splitStr[0] };
    },
    Find: function(s) { // ${obj} (in Room ${number}) OR {$obj} anywhere
        const splitStr = s.split(" ");
        const itemToFind = splitStr[0];
        if(splitStr.length === 1) { return { type: "find", object: itemToFind, placeNum: -1 }; }
        splitStr.shift();
        if(splitStr[0] === "anywhere") { return { type: "find", object: itemToFind, all: true, placeNum: -1 }; }
        if(splitStr[0] === "in") { splitStr.shift(); }
        if(splitStr[0] === "room") { splitStr.shift(); }
        const potentialNum = parseInt(splitStr[0]);
        if(isNaN(potentialNum) || potentialNum <= 0) { return null; }
        return { type: "find", object: itemToFind, placeNum: potentialNum };
    },
    Who: function(s) { // is here OR is in room $number
        const splitStr = s.split(" ");
        if(splitStr[0] === "is") { splitStr.shift(); }
        if(splitStr[0] === "in") { splitStr.shift(); }
        if(splitStr[0] === "room") { splitStr.shift(); }
        if(splitStr[0] === "here") {
            return { type: "who", placeNum: -1 };
        } else {
            const potentialNum = parseInt(splitStr[0]);
            if(isNaN(potentialNum) || potentialNum <= 0) { return null; }
            return { type: "who", placeNum: potentialNum };
        }
    },
    Look: function(s) { // around (Room ${number}) OR (at) $place(s/ {$optional_number}) -- number OR plural
        const splitStr = s.split(" ");
        if(splitStr[0] === "around") {
            if(splitStr.length === 1) { return { type: "look", around: true, placeNum: -1 }; }
            splitStr.shift();
            if(splitStr[0] === "room") { splitStr.shift(); }
            const potentialNum = parseInt(splitStr[0]);
            if(isNaN(potentialNum) || potentialNum <= 0) { return null; }
            return { type: "look", around: true, placeNum: potentialNum };
        }
        if(splitStr[0] === "at") { splitStr.shift(); }
        if(splitStr.length === 2) {
            let placeName = splitStr[0];
            const placeNum = parseInt(splitStr[1]);
            if(isNaN(placeNum) || placeNum <= 0) { return null; }
            if(placeName === "stove") { placeName = "pot"; }
            return { type: "look", place: placeName, placeNum: placeNum };
        } else if(splitStr.length === 1) {
            let placeName = splitStr[0];
            const lastChar = placeName[placeName.length - 1];
            if(lastChar === "s") { placeName = placeName.substring(0, placeName.length - 1); }
            if(placeName === "stove") { placeName = "pot"; }
            return { type: "look", place: placeName, placeNum: -1 };
        }
        return null;
    },
    Turn: function(s) { // ${obj} (${optional_number}) ${on_off} OR ${on_off} ${obj} (${optional_number})
        const splitStr = s.split(" ");

        const reverseOrder = (["on", "off"].indexOf(splitStr[0]) >= 0);
        
        const place = splitStr[reverseOrder ? 1 : 0];
        if(["oven", "stove"].indexOf(place) < 0) { return null; }
        let placeNum = -1;
        let potentialPlaceNum = parseInt(splitStr[reverseOrder ? 2 : 1]);
        if(!isNaN(potentialPlaceNum)) {
            placeNum = potentialPlaceNum;
            if(placeNum <= 0) { return null; }
        }
        const switchType = splitStr[reverseOrder ? 0 : (placeNum > 0 ? 2 : 1)];
        if(["on", "off"].indexOf(switchType) < 0) { return null; }
        return {
            type: "turn", displayPlace: place, 
            place: (place === "stove" ? "pot" : place), placeNum: placeNum,
            switchType: switchType
        }
    },
    Fry: function(s) { // ${obj} ({$optional_number})
        const info = self.FormatObjectName(s);
        if(info.invalid) { return; }
        const splitStr = info.newStr.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "fry",
                object: splitStr[0], objAttrs: info.attrs,
                place: "pan", placeNum: -1
            }
        }
        if(splitStr.length !== 2) { return; }
        let placeNum = -1;
        const potentialPlaceNum = parseInt(splitStr[1]);
        if(!isNaN(potentialPlaceNum)) {
            placeNum = potentialPlaceNum;
            if(placeNum <= 0) { return null; } // "fry tomato -1" isn't valid
        }
        return {
            type: "fry",
            object: splitStr[0], objAttrs: info.attrs,
            place: "pan", placeNum: placeNum
        }
    },
    Move: function(s) { // (to room ${number}) or (${direction})
        const splitStr = s.split(" ");
        if(splitStr.length === 1) { // direction
            const direction = splitStr[0].replace("east", "right").replace("west", "left").replace("north", "up").replace("south", "down");
            return { type: "move", direction: direction };
        } else if(splitStr.length === 3) { // to room #
            const roomNo = parseInt(splitStr[2]);
            if(isNaN(roomNo)) { return null; }
            return { type: "move", roomNo: roomNo - 1 };
        } else { return null; }
    },
    Serve: function(s) { // ${obj}
        const splitStr = s.split(" ");
        if(splitStr.length !== 1) { return null; }
        return { type: "serve", object: splitStr[0] }
    },
    Plate: function(s) { // ${obj} (on ${place} {$optional_number}) -- if inner area is omitted, any plate
        const info = self.FormatObjectName(s); // attributes don't matter since it's based on what you're holding anyway
        if(info.invalid) { return; }
        const splitStr = info.newStr.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "plate",
                object: splitStr[0],
                place: "", placeNum: -1
            }
        }
        if(splitStr.length < 3) { return null; }
        const objectName = splitStr[0];
        const placeName = splitStr[2];
        let placeNum = -1;
        if(splitStr[3] !== undefined) {
            const potentialPlaceNum = parseInt(splitStr[3]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; } // "plate tomato on table -1" isn't valid
            }
        }
        return {
            type: "plate",
            object: objectName, 
            place: placeName, placeNum: placeNum
        }
    },
    Chop: function(s) { // ${obj} ({$optional_number})
        const info = self.FormatObjectName(s);
        if(info.invalid) { return; }
        const splitStr = info.newStr.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "chop",
                object: splitStr[0], objAttrs: info.attrs,
                place: "cuttingboard", placeNum: -1
            }
        }
        if(splitStr.length !== 2) { return; }
        let placeNum = -1;
        const potentialPlaceNum = parseInt(splitStr[1]);
        if(!isNaN(potentialPlaceNum)) {
            placeNum = potentialPlaceNum;
            if(placeNum <= 0) { return null; }
        }
        return {
            type: "chop",
            object: splitStr[0], objAttrs: info.attrs,
            place: "cuttingboard", placeNum: placeNum
        }
    },
    Drop: function(s) { // ${obj} (on ${place} {$optional_number}) -- if inner area is omitted, assume floor 
        const info = self.FormatObjectName(s); // attributes don't matter since it's based on what you're holding anyway
        if(info.invalid) { return; }
        const splitStr = info.newStr.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "drop",
                object: splitStr[0],
                place: "floor", placeNum: 0
            }
        }
        if(splitStr.length < 3) { return null; }
        const objectName = splitStr[0];
        const placeName = splitStr[2];
        let placeNum = -1;
        if(splitStr[3] !== undefined) {
            const potentialPlaceNum = parseInt(splitStr[3]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; }
            }
        }
        return {
            type: "drop",
            object: objectName, 
            place: placeName, placeNum: placeNum
        }
    },
    Grab: function(s) { // ${obj} from ${place} ${optional_number}
        const info = self.FormatObjectName(s);
        if(info.invalid) { return; }
        const splitStr = info.newStr.split(" ");
        if(splitStr.length < 3) { return null; }
        const objectName = splitStr[0];
        const placeName = splitStr[2];
        let placeNum = -1;
        if(splitStr.length === 4) {
            const potentialPlaceNum = parseInt(splitStr[3]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; }
            }
        }
        return {
            type: "grab",
            object: objectName, objAttrs: info.attrs,
            place: placeName, placeNum: placeNum
        }
    },
    FormatObjectName: function(fullStr) { // first words must be the object or its adjectives
        const splitStr = fullStr.split(" ");
        const attrs = [];
        for(let i = 0; i < splitStr.length; i++) {
            switch(splitStr[i]) {
                case "sliced":
                case "chopped":
                    attrs.push("sliced");
                    break;
                case "plated":
                    attrs.push("plated");
                    break;
                case "fried":
                    attrs.push("fried");
                    break;
                default:
                    splitStr.splice(0, i);
                    return {
                        attrs: attrs, invalid: false, 
                        newStr: splitStr.join(" ")
                    };
            }
        }
        return { invalid: true };
    }
};