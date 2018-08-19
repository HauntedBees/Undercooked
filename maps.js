const maps = [
    {
        name: "De Testbench!",
        img: `
XXOVXPSXXXXXXXOUXXXX    OU = Food Delivery Area
FP                DT    TT = Table
CB   1   TT   2   DD    DS = Potato Dispenser       DO = Onion Dispenser
CB       TT       DS    DT = Tomato Dispenser       DM = Mushroom Dispenser
XXXX   XXXXXXXXXXXXX    DD = Plate Dispenser        DP = Pepper Dispenser
DP       DM             DL = Lettuce Dispenser      DC = Cheese Dispenser
DL   3   MB             FP = Frying Pan             Dd = Dough Dispenser
DO       DC             PS = Pot on Stove           DM = Meat Dispenser
DM       Dd             MB = Mixing Bowl            OV = Oven
XXXXXXXXXXX             CB = Cutting Board
`,
        rooms: [
            { right: 1, down: 2 },
            { left: 0 },
            { up: 0 }
        ],
        items: [
            { type: "output", rooms: [1] },
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
            { type: "floor", rooms: [0], size: 999, contents: [] },
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