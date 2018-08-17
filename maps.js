const maps = [
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