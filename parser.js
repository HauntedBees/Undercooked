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
    "dish": "plate"
};
const grabVerbs = ["grab", "take", "get", "acquire", "procure", "obtain"];
const dropVerbs = ["drop", "put", "place", "plop", "set", "deposit", "position"];
const chopVerbs = ["cut", "chop", "slice", "dice", "mince", "stab", "knife", "julienne", "chiffonade"];
const serveVerbs = ["serve", "deliver", "provide", "supply"];
const moveVerbs = ["walk", "move", "go"];
const fryVerbs = ["fry", "sautee", "sauté", "sear", "brown", "sizzle"];
const self = module.exports = {
    Parse: function(s) {
        if(s === "") { return null; }
        s = s.trim().replace(/[.,!:;'"]/g, "").replace(/\s+/g, " ").toLowerCase();
        for(const word in synonyms) { s = s.replace(word, synonyms[word]); }

        const splitWord = s.split(" ");
        const firstWord = splitWord[0], remainingWords = s.substring(s.indexOf(" ") + 1);
        
        if(remainingWords === "") { return null; } // EH: order these in likelihood of usage, since obviously the speed of comparing a few dozen strings is a big fucking bottleneck 
        if(grabVerbs.indexOf(firstWord) >= 0) { return self.Grab(remainingWords); }
        if(dropVerbs.indexOf(firstWord) >= 0) { return self.Drop(remainingWords); }
        if(chopVerbs.indexOf(firstWord) >= 0) { return self.Chop(remainingWords); }
        if(serveVerbs.indexOf(firstWord) >= 0) { return self.Serve(remainingWords); }
        if(moveVerbs.indexOf(firstWord) >= 0) { return self.Move(remainingWords); }
        if(fryVerbs.indexOf(firstWord) >= 0) { return self.Fry(remainingWords); }
        if(firstWord === "plate") { return self.Plate(remainingWords); }

        return null;
    },
    Fry: function(s) { // ${obj} ({$optional_number})
        const splitStr = s.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "fry",
                object: splitStr[0],
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
            object: splitStr[0],
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
        const splitStr = s.split(" ");
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
        const splitStr = s.split(" ");
        if(splitStr.length === 1) {
            return {
                type: "chop",
                object: splitStr[0],
                place: "cuttingboard", placeNum: -1
            }
        }
        if(splitStr.length !== 2) { return; }
        let placeNum = -1;
        const potentialPlaceNum = parseInt(splitStr[1]);
        if(!isNaN(potentialPlaceNum)) {
            placeNum = potentialPlaceNum;
            if(placeNum <= 0) { return null; } // "chop tomato -1" isn't valid
        }
        return {
            type: "chop",
            object: splitStr[0],
            place: "cuttingboard", placeNum: placeNum
        }
    },
    Drop: function(s) { // ${obj} (on ${place} {$optional_number}) -- if inner area is omitted, assume floor 
        const splitStr = s.split(" ");
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
                if(placeNum <= 0) { return null; } // "put tomato on table -1" isn't valid
            }
        }
        return {
            type: "drop",
            object: objectName, 
            place: placeName, placeNum: placeNum
        }
    },
    Grab: function(s) { // ${obj} ${optional_number} from ${place} ${optional_number} -- EH: toss optional number probably
        const splitStr = s.split(" ");
        if(splitStr.length < 3) { return null; }
        const objectName = splitStr[0];
        const objNumOrFrom = parseInt(splitStr[1]);
        let objNum = -1;
        if(!isNaN(objNumOrFrom)) {
            objNum = objNumOrFrom;
            if(objNum <= 0) { return null; } // "grab tomato -1" isn't valid
        }
        const placeIndex = (objNum > 0 ? 3 : 2);
        if(splitStr[placeIndex] === undefined) { return null; }
        const placeName = splitStr[placeIndex];
        let placeNum = -1;
        if(splitStr[placeIndex + 1] !== undefined) {
            const potentialPlaceNum = parseInt(splitStr[placeIndex + 1]);
            if(!isNaN(potentialPlaceNum)) {
                placeNum = potentialPlaceNum;
                if(placeNum <= 0) { return null; } // "grab tomato from table -1" isn't valid
            }
        }
        return {
            type: "grab",
            object: objectName, objNum: objNum,
            place: placeName, placeNum: placeNum
        }
    }
};