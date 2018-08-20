const Food = require("./foodHelpers.js");
const synonyms = {
    "pick up": "grab",
    "frying pan": "pan",
    "cooking pan": "pan",
    "skillet": "pan",
    "frypan": "pan",
    "cboard": "cuttingboard",
    "cutting board": "cuttingboard",
    "chopping board": "cuttingboard",
    "butcher block": "cuttingboard",
    "butcher board": "cuttingboard",
    "chopping block": "cuttingboard",
    "chopper": "cuttingboard",
    "dish": "plate",
    "dishes": "plate",
    "search for": "search",
    "hunt for": "hunt",
    "mixing bowl": "bowl",
    "trash can": "trashcan",
    "fire extinguisher": "extinguisher",
    "conveyor belt": "belt",
    "conveyor": "belt",
    "assembly line": "belt"
};
const grabVerbs = ["grab", "take", "get", "acquire", "procure", "obtain"];
const dropVerbs = ["drop", "put", "place", "plop", "set", "deposit", "position"];
const chopVerbs = ["cut", "chop", "slice", "dice", "mince", "stab", "knife", "julienne", "chiffonade"];
const serveVerbs = ["serve", "deliver", "provide", "supply"];
const moveVerbs = ["walk", "move", "go"];
const fryVerbs = ["fry", "sautee", "sauté", "sear", "brown", "sizzle"];
const turnVerbs = ["turn", "switch", "flip"];
const lookVerbs = ["look", "inspect", "view", "see", "check"];
const findVerbs = ["find", "search", "locate", "hunt", "seek"];
const mixVerbs = ["mix", "stir"];
const washVerbs = ["wash", "clean", "scrub"];
const throwVerbs = ["throw", "toss", "chuck", "lob", "fling"];
const self = module.exports = {
    Parse: function(s) {
        if(s === "") { return null; }
        s = s.trim().replace(/[.,!:;'"]/g, "").replace(/\s+/g, " ").toLowerCase();
        for(const word in synonyms) { s = s.replace(word, synonyms[word]); }
        s = Food.FlattenFoodNames(s);

        const splitWord = s.split(" ");
        const firstWord = splitWord[0];
        const remainingWords = splitWord.length === 1 ? "" : s.substring(s.indexOf(" ") + 1);

        // verbs that don't need anything after the verb itself
        if(firstWord === "use") { return self.Use(remainingWords); }
        if(firstWord === "plate") { return self.Plate(remainingWords); }
        if(firstWord === "trash") { return { type: "drop", place: "trashcan", placeNum: 1 }; }
        if(firstWord === "holding") { return { type: "holding" }; }
        if(dropVerbs.indexOf(firstWord) >= 0) { return self.Drop(remainingWords); }
        if(serveVerbs.indexOf(firstWord) >= 0) { return self.Serve(remainingWords); }
        if(mixVerbs.indexOf(firstWord) >= 0) { return self.Mix(remainingWords); }

        if(remainingWords === "") { return null; }
        if(grabVerbs.indexOf(firstWord) >= 0) { return self.Grab(remainingWords); }
        if(chopVerbs.indexOf(firstWord) >= 0) { return self.Chop(remainingWords); }
        if(moveVerbs.indexOf(firstWord) >= 0) { return self.Move(remainingWords); }
        if(fryVerbs.indexOf(firstWord) >= 0) { return self.Fry(remainingWords); }
        if(turnVerbs.indexOf(firstWord) >= 0) { return self.Turn(remainingWords); }
        if(lookVerbs.indexOf(firstWord) >= 0) { return self.Look(remainingWords); }
        if(findVerbs.indexOf(firstWord) >= 0) { return self.Find(remainingWords); }
        if(throwVerbs.indexOf(firstWord) >= 0) { return self.Throw(remainingWords); }
        if(washVerbs.indexOf(firstWord) >= 0) { return { type: "wash" }; }
        if(firstWord === "who") { return self.Who(remainingWords); }
        if(firstWord === "what") { return self.What(remainingWords); }

        return null;
    },
    Throw: function(s) { // to {name}
        const splitStr = s.split(" ");
        if(splitStr[0] === "to" || splitStr[0] === "at") { splitStr.shift(); }
        return { type: "throw", to: splitStr.join(" ") };
    },
    Use: function(s) { // (on ${place} ${optional_number})
        const splitStr = s.split(" ");
        if(splitStr.length === 1 && splitStr[0] === "") { return { type: "use", place: "", placeNum: -1 } }
        
        if(splitStr.length < 3) { return null; }
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
            type: "use",
            place: placeName, placeNum: placeNum
        }
    },
    Mix: function(s) { // (bowl) {$optional_number}
        const splitStr = s.split(" ");
        if(splitStr[0] === "bowl") { splitStr.shift(); }
        if(splitStr.length === 1 && splitStr[0] === "") { return { type: "mix", placeNum: 1 }; }
        if(splitStr.length !== 1) { return null; }
        const placeNum = parseInt(splitStr[0]);
        if(isNaN(placeNum) || placeNum <= 0) { return null; }
        return { type: "mix", placeNum: placeNum };
    },
    What: function(s) { // (is a/an) {$obj}
        const splitStr = s.split(" ");
        if(splitStr[0] === "is") { splitStr.shift(); }
        if(splitStr[0] === "in") { splitStr.shift(); }
        if(splitStr[0] === "a") { splitStr.shift(); }
        if(splitStr[0] === "an") { splitStr.shift(); }
        if(splitStr.length !== 1) { return null; }
        return { type: "what", object: splitStr[0] };
    },
    Find: function(s) { // ${obj} (in Room ${number}) OR {$obj} anywhere
        const splitStr = s.split(" ");
        const itemToFind = splitStr[0];
        if(splitStr.length === 1) { return { type: "find", object: itemToFind, placeNum: -1 }; }
        splitStr.shift();
        if(splitStr[0] === "anywhere") { return { type: "find", object: itemToFind, all: true, placeNum: -1 }; }
        if(splitStr[0] === "for") { splitStr.shift(); }
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
        if(splitStr[0] === "around" || splitStr[0] === "areund") {
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
    Move: function(s) { // to room ${number} or ${direction}
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
    Plate: function(s) { // (on ${place} {$optional_number}) -- if inner area is omitted, any plate
        const splitStr = s.split(" ");
        if(splitStr.length === 1 && splitStr[0] === "") { return { type: "plate", place: "", placeNum: -1 } }

        if(splitStr[0] === "on" || splitStr[0] === "in") { splitStr.shift(); }
        const placeName = splitStr[0];
        let placeNum = -1;
        if(splitStr[1] !== undefined) {
            const potentialPlaceNum = parseInt(splitStr[1]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; }
            }
        }
        return { type: "plate", place: placeName, placeNum: placeNum }
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
    Drop: function(s) { // (on ${place} {$optional_number}) -- if inner area is omitted, assume floor 
        const splitStr = s.split(" ");
        if(splitStr.length === 1 && splitStr[0] === "") { return { type: "drop", place: "floor", placeNum: 1 } }
        
        if(splitStr[0] === "on" || splitStr[0] === "in") { splitStr.shift(); }
        const placeName = splitStr[0];
        let placeNum = -1;
        if(splitStr[1] !== undefined) {
            const potentialPlaceNum = parseInt(splitStr[1]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; }
            }
        }
        return { type: "drop", place: placeName, placeNum: placeNum }
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
                case "plain":
                case "standard":
                case "regular":
                    attrs.push("standard");
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