const maps = [
    {
        name: "De Testbench!",
        img: `
xxOVxPSxxxxINxOUxxxx    OU = Food Delivery Area     IN = Used Plate Pickup
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
            { type: "output", rooms: [1] },
            { type: "sink", rooms: [1] },
            { type: "belt", rooms: [2], start: true, to: 1, size: 4, contents: [] },
            { type: "belt", rooms: [1], start: false, from: 2, size: 4, contents: [] },
            { type: "trashcan", rooms: [1], size: 999, contents: [] },
            { type: "table", rooms: [0, 1], size: 4, contents: [] },
            { type: "counter", rooms: [1], size: 3, contents: [ { type: "plate", modifier: 1, attributes: ["dirty"] } ] },
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
        potentialOrders: [
            { type: "tomato", attributes: ["sliced"], score: 5 },
            { type: "frenchfries", attributes: [], score: 10 }
        ]
    },
    {
        name: "Hello Hi! Let's Some Tomatoes!",
        img: `
xxxxxxxxxxxxxxxxxxx    DT = Tomato Dispenser
xx       T       DT    DP = Plate Dispenser
CB   1   T   2   DP    OU = Food Delivery Area
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
            { type: "output", rooms: [1] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [] }
        ],
        potentialOrders: [
            { item: "tomato_sliced", score: 5 }
        ]
    }
];
module.exports = {
    GetMap: function() {
        const newMap = JSON.parse(JSON.stringify(maps[0]));
        newMap.items.sort((a, b) => a.type.localeCompare(b.type));
        return newMap;
    }
};