const Gimmicks = require("./levelGimmicks.js");
function GetTimeFromSpeed(time, speed) {
    switch(speed) {
        case 0.75: time *= 0.8; break;
        case 2: time *= 1.5; break;
        case 4: time *= 2.5; break;
    }
    return Math.round(time);
}
const maps = [
    {
        name: "Hey Let's Tutorial!", isTutorial: true, 
        difficulty: "Trivial", minPlayers: 2, time: 3599,
        newOrderChance: 0, maxOrders: 5, plateChance: 1, // new orders are checked every 10 seconds, plates every 8
        img: `
xxCBxCBxxxDLxDTxx   DL = Lettuce Dispenser
x       T       x   DT = Tomato Dispenser
x   1   T   2   O   CB = Cutting Board
x       T       x    T = Table
x       T       x    O = Delivery Counter
xxxxxxxxxxxxxDPxx   DP = Plate Dispenser`,
        rooms: [
            { neighboring: 1 },
            { neighboring: 0 }
        ],
        items: [
            { type: "counter", rooms: [1], size: 99, contents: [] },
            { type: "dispenser", rooms: [1], dispensed: "lettuce", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "tomato", amount: 999 },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 4, contents: [] },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 999 },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [] }
        ],
        potentialOrders: []
    },
    {
        name: "De Testbench!",
        difficulty: "Easy", minPlayers: 1, time: 3599,
        img: `
xxOVxPSxxxxxxxOUxxxx    OU = Counter for Food Delivery and Used Plate Pickup
FP                DT    TT = Table                  TC = Trash Can
CB   1   TT   2   DD    DS = Potato Dispenser       DO = Onion Dispenser
CB FE    TT       DS    DT = Tomato Dispenser       DM = Mushroom Dispenser
xxxx   xxxxSNxCBTCxx    DD = Plate Dispenser        DP = Pepper Dispenser
DP       DM   ^         DL = Lettuce Dispenser      DC = Cheese Dispenser
DL       MB   ^         FP = Frying Pan             Dd = Dough Dispenser
DO   3   DC   ^         PS = Pot on Stove           DM = Meat Dispenser
DM       Dd   ^         MB = Mixing Bowl            OV = Oven
xx       CB>>>>         CB = Cutting Board          FE = Fire Extinguisher
xxxxxxxxxxx             SN = Sink                   CB = Conveyor Belt
`,
        rooms: [
            { right: 1, down: 2 },
            { left: 0 },
            { up: 0 }
        ],
        items: [
            { type: "counter", rooms: [1], size: 3, contents: [ { type: "plate", modifier: 1, attributes: ["dirty"] } ] },
            { type: "sink", rooms: [1] },
            { type: "belt", rooms: [2], start: true, to: 1, size: 4, contents: [] },
            { type: "belt", rooms: [1], start: false, from: 2, size: 4, contents: [] },
            { type: "trashcan", rooms: [1], size: 999, contents: [] },
            { type: "table", rooms: [0, 1], size: 4, contents: [] },
            { type: "dispenser", rooms: [1], dispensed: "potato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "tomato", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "lettuce", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "mushroom", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "pepper", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "meat", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 999 },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "bowl", rooms: [2], size: 4, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "pot", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [{ type: "extinguisher", modifier: 1, attributes: [] }] },
            { type: "floor", rooms: [1], size: 999, contents: [] },
            { type: "floor", rooms: [2], size: 999, contents: [] }
        ],
        gimmick: "earthquake", gimmickArgs: { rooms: [0, 1], interval: 5, chance: 1 },
        potentialOrders: [
            { type: "tomato", attributes: ["sliced"], score: 5 },
            { type: "frenchfries", attributes: [], score: 10 }
        ]
    },
    {
        name: "Hello Hi! Let's Some Tomatoes!", minPlayers: 2, time: 3599, difficulty: "Easy", 
        img: `
xxxxxxxxxxxxxxxxxxx    DT = Tomato Dispenser
xx       T       DT    DP = Plate Dispenser
CB   1   T   2   DP    OU = Counter for Food Delivery and Used Plate Pickup
CB               OU    CB = Cutting Board
xxxxxxxxxxxxxxxxxxx     T = Table
`,
        rooms: [
            { right: 1 },
            { left: 0 }
        ],
        items: [
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 2, contents: [] },
            { type: "dispenser", rooms: [1], contents: [{ item: "tomato", amount: 999 }] },
            { type: "dispenser", rooms: [1], contents: [{ item: "plate", amount: 999 }] },
            { type: "counter", rooms: [1], size: 3, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [] }
        ],
        potentialOrders: [
            { item: "tomato_sliced", score: 5 }
        ]
    }
];
const self = module.exports = {
    IsValidMap: idx => idx < maps.length, 
    GetMapName: idx => maps[idx].name,
    GetMapImg: idx => maps[idx].img,
    GetMap: function(gameData) {
        let mapIdx = gameData.selectedMapIdx;
        if(gameData.selectedMapIdx < 0) {
            let numAttempts = 8;
            while(numAttempts > 0 && mapIdx < 0) {
                const potentialIdx = Math.floor(Math.random() * maps.length);
                if(gameData.players.length >= maps[potentialIdx].minPlayers) {
                    mapIdx = potentialIdx;
                }
                numAttempts--;
            }
            if(mapIdx < 0) { // picking randomly didn't work, just grab the first one that fits
                for(let i = 0; i < maps.length; i++) {
                    if(gameData.players.length < maps[i].minPlayers) { continue; }
                    mapIdx = i;
                    break;
                }
            }
        }
        const staticMap = maps[mapIdx];
        if(gameData.players.length < staticMap.minPlayers) {
            gameData.discordHelper.SayM(`The level you selected needs at least ${staticMap.minPlayers} to play! You only have ${gameData.players.length}! Please wait for more players or pick another level.`);
            return null;
        }
        const newMap = JSON.parse(JSON.stringify(staticMap));
        newMap.items.sort((a, b) => a.type.localeCompare(b.type));
        newMap.time = GetTimeFromSpeed(newMap.time, gameData.gameSpeed);
        newMap.gimmick = Gimmicks.GetGimmick(newMap.gimmick, newMap.gimmickArgs);
        return newMap;
    },
    FormatTime: function(time, speed) {
        const realTime = GetTimeFromSpeed(time, speed);
        const minutes = Math.floor(realTime / 60), seconds = realTime % 60;
        return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
    GetMapStr: function(i, gameSpeed) {
        const map = maps[i];
        return `#${i + 1}: ${map.name} ${PadSpaces(map.name, 32)} + Difficulty: ${PadSpaces(map.difficulty, 7)}${map.difficulty}. Minimum Players: ${PadSpaces(map.minPlayers.toString(), 2)}${map.minPlayers}. Time: ${self.FormatTime(map.time, gameSpeed)}`;
    },
    GetMaps: function(gameSpeed) {
        let results = [];
        for(let i = 0; i < maps.length; i++) {
            results.push(`+ ${self.GetMapStr(i, gameSpeed)}`);
        }
        return results.join("\n");
    }
};
const PadSpaces = (str, desiredLen) => " ".repeat(desiredLen - str.length);