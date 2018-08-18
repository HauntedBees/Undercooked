const maps = [
    {
        name: "De Testbench!",
        img: `
XXXXXXXXXXXXXXOUXXXX    OU = Food Delivery Area
FP                DT    TB = Table
CB   1   TB   2   DP    DS = Potato Dispenser      
CB       TB       DS    DT = Tomato Dispenser
XXXX   XXXXXXXXXXXXX    DP = Plate Dispenser
XX       XX             CB = Cutting Board
XX   3   XX             FP = Frying Pan
XX       XX
XXXXXXXXXXX
`,
        rooms: [
            { right: 1, down: 2 },
            { left: 0 },
            { up: 0 }
        ],
        items: [
            { type: "output", rooms: [1] },
            { type: "table", rooms: [0, 1], size: 2, contents: [] },
            { type: "dispenser", rooms: [1], contents: [{ item: "potato", amount: 999 }] },
            { type: "dispenser", rooms: [1], contents: [{ item: "tomato", amount: 999 }] },
            { type: "dispenser", rooms: [1], contents: [{ item: "plate", amount: 2 }] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [] }
        ],
        potentialOrders: [
            { item: "tomato_sliced", score: 5 }
        ]
    },
    {
        name: "Hello Hi! Let's Some Tomatoes!",
        img: `
XXXXXXXXXXXXXXXXXXX    DT = Tomato Dispenser
XX       T       DT    DP = Plate Dispenser
CB   1   T   2   DP    OU = Food Delivery Area
CB               OU    CB = Cutting Board
XXXXXXXXXXXXXXXXXXX     T = Table
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
        return JSON.parse(JSON.stringify(maps[0]));
    }
};