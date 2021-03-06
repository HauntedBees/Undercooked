const Gimmicks = require("./levelGimmicks.js");
function GetTimeFromSpeed(time, speed) {
    switch(speed) {
        case 0.75: time *= 0.8; break;
        case 2: time *= 1.5; break;
        case 4: time *= 2.5; break;
    }
    return Math.round(time);
}
function GetFireExtinguisher() { return { type: "extinguisher", modifier: 1, attributes: [] }; }
const maps = [
    { name: "Hey Let's Tutorial!", isTutorial: true, 
        difficulty: "Trivial", minPlayers: 2, time: 3599,
        newOrderChance: 0, maxOrders: 5, plateChance: 1, // new orders are checked every 10 seconds, plates every 8
        img: `
--CB-CB---DL-DT--   DL = Lettuce Dispenser
|       T       |   DT = Tomato Dispenser
|   1   T   2   O   CB = Cutting Board
|       T       |    T = Table
|       T       |    O = Delivery Counter
-------------DP--   DP = Plate Dispenser`,
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
    { name: "That's Just My Op-onion!", 
        difficulty: "Easy", minPlayers: 1, time: 360,
        newOrderChance: 0.7, maxOrders: 2, plateChance: 1,
        img: `
---DOxDC---xPSxOV---    DO = Onion Dispenser    DC = Cheese Dispenser
|         1        |    PS = Pot and Stove      OV = Oven
|TTTTTTTTTTTTTT   SS    SS = Kitchen Sink       TC = Trash Can
OO        2        |    OO = Counter            CB = Cutting Board
-----CBxCB--DD--TC--    TT = Table              DD = Dish Dispenser (10)
`,
        rooms: [
            { down: 1 },
            { up: 0 }
        ],
        items: [
            { type: "counter", rooms: [1], size: 99, contents: [] },
            { type: "sink", rooms: [0, 1] },
            { type: "trashcan", rooms: [1], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "cheese", amount: 999 },
            { type: "pot", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [1], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [1], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 5, contents: [] },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 10 },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [GetFireExtinguisher()] }
        ],
        potentialOrders: [
            { type: "roastedonion", attributes: [], score: 10 },
            { type: "frenchonionsoup", attributes: [], score: 20 }
        ]
    },
    { name: "I Believe I Can Fry!", 
        difficulty: "Easy", minPlayers: 1, time: 420,
        newOrderChance: 0.7, maxOrders: 3, plateChance: 0.8,
        img: `
--DP--OOO--DC--     DP = Potato Dispenser   DC = Cheese Dispenser
FP           CB     DD = Dough Dispenser    Dd = Dish Dispenser (5)
FP     1     CB     CB = Cutting Board      FP = Frying Pan
FP           CB     TT = Table              OO = Counter
---SSxTTT--TC--     SS = Sink               TC = Trash Can
`,
        rooms: [{}],
        items: [
            { type: "counter", rooms: [0], size: 99, contents: [] },
            { type: "sink", rooms: [0] },
            { type: "trashcan", rooms: [0], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "potato", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 5 },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0], size: 3, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [GetFireExtinguisher()] }
        ],
        potentialOrders: [
            { type: "frenchfries", attributes: [], score: 10 },
            { type: "mozzarellastick", attributes: [], score: 15 },
            { type: "frenchtoast", attributes: [], score: 20 }
        ]
    },
    { name: "Don't Miss-ily Little Sicily!", 
        difficulty: "Easy", minPlayers: 2, time: 480,
        newOrderChance: 0.5, maxOrders: 3, plateChance: 0.75,
        img: `
--DDxDC--------OV-----  DD = Dough Dispenser    DC = Cheese Dispenser
CB        TT        SS  DT = Tomato Dispenser   DM = Meat Dispenser
CB   1    TT    2   OO  CB = Cutting Board      PS = Pot on Stove
|         TT        TC  OV = Oven               OO = Counter
--DT---xTC---PSxDdDM--  SS = Sink               TC = Trash Can
                        Dd = Dish Dispenser (10)
`,
        rooms: [
            { neighboring: 1 },
            { neighboring: 0 }
        ],
        items: [
            { type: "counter", rooms: [1], size: 99, contents: [] },
            { type: "sink", rooms: [1] },
            { type: "trashcan", rooms: [0, 1], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "tomato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "meat", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 10 },
            { type: "pot", rooms: [1], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [1], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 3, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [GetFireExtinguisher()] }
        ],
        potentialOrders: [
            { type: "fettucini", attributes: [], score: 8 },
            { type: "spaghetti", attributes: [], score: 15 },
            { type: "angelhair", attributes: [], score: 5 },
            { type: "macaroni", attributes: [], score: 10 },
            { type: "lasagna", attributes: [], score: 30 }
        ]
    },
    { name: "Tiff at Breakfastany's!", 
        difficulty: "Medium", minPlayers: 3, time: 600,
        newOrderChance: 0.5, maxOrders: 4, plateChance: 0.75,
        img: `
--FPxOV---------------xPSxCB--  FP = Frying Pan         OV = Oven
DD            TC            DM  PS = Pot and Stove      CB = Cutting Board
|      1              2      |  DD = Dough Dispenser    DM = Mushroom Dispenser
DC            MB            DP  DC = Cheese Dispenser   DP = Pepper Dispenser
|TTTTTTTTTTTTT--TTTTTTTTTTTTT|  MB = Mixing Bowl        TT = Table
|              3             |  TC = Trash Can          SS = Sink
------TCxSSxDdxOO------------x  Dd = Dish Dispenser (4) OO = Output
`,
        rooms: [
            { right: 1, neighboring2: 2 },
            { left: 0, neighboring2: 2 },
            { neighboring: 1, neighboring2: 0 }
        ],
        items: [
            { type: "counter", rooms: [2], size: 99, contents: [] },
            { type: "sink", rooms: [2] },
            { type: "trashcan", rooms: [0, 1], size: 999, contents: [] },
            { type: "trashcan", rooms: [2], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "mushroom", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "pepper", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "plate", amount: 4 },
            { type: "bowl", rooms: [0, 1], size: 4, contents: [] },
            { type: "pot", rooms: [1], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [1], size: 1, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0, 2], size: 6, contents: [] },
            { type: "table", rooms: [1, 2], size: 6, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [GetFireExtinguisher()] },
            { type: "floor", rooms: [2], size: 999, contents: [] }
        ],
        potentialOrders: [
            { type: "pancakes", attributes: [], score: 5 },
            { type: "bagel", attributes: [], score: 8 },
            { type: "frenchtoast", attributes: [], score: 3 },
            { type: "halloumi", attributes: [], score: 10 },
            { type: "potpie", attributes: [], score: 20 },
            { type: "mushroomsoup", attributes: [], score: 15 },
            { type: "pepperjack", attributes: [], score: 10 }
        ]
    },
    { name: "Earthquaker Oats!", 
        difficulty: "Medium", minPlayers: 3, time: 600,
        newOrderChance: 0.5, maxOrders: 5, plateChance: 0.75,
        img: `
--DMxMB---------OV--    DM = Mushroom Dispenser MB = Mixing Bowl
DL       1         |    DL = Lettuce Dispenser  OV = Oven          
|-DT--TT--------TT-|    DT = Tomato Dispenser   TT = Table
Dd      / /       OO    Dd = Dish Dispenser (3) OO = Counter
DP   2  / /   3   SS    DP = Potato Dispenser   SS = Sink
DD      / /       PS    DD = Dough Dispenser    PS = Pot and Stove
DO      / /       TC    DO = Onion Dispenser    TC = Trash Can
|       / /        |    CB = Cutting Board      CV = Conveyor Belt
--CB--CV>>>>>>>>CV--    // = Active Fault - Earthquake Hazard
`,
        rooms: [
            { neighboring: 1, neighboring2: 2 },
            { right: 2, neighboring: 0 },
            { left: 1, neighboring: 0 }
        ],
        items: [
            { type: "counter", rooms: [2], size: 99, contents: [] },
            { type: "sink", rooms: [2] },
            { type: "trashcan", rooms: [2], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "mushroom", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "lettuce", amount: 999 },
            { type: "dispenser", rooms: [0, 1], dispensed: "tomato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "pepper", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "plate", amount: 3 },
            { type: "bowl", rooms: [0], size: 4, contents: [] },
            { type: "pot", rooms: [2], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [1], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 6, contents: [] },
            { type: "table", rooms: [0, 2], size: 6, contents: [] },
            { type: "belt", rooms: [1], start: true, to: 2, size: 6, contents: [] },
            { type: "belt", rooms: [2], start: false, from: 1, size: 6, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [] },
            { type: "floor", rooms: [2], size: 999, contents: [GetFireExtinguisher()] }
        ],
        gimmick: "earthquake", gimmickArgs: { rooms: [1, 2], interval: 30, chance: 0.6 },
        potentialOrders: [
            { type: "tomatosoup", attributes: [], score: 10 },
            { type: "spicytomatosoup", attributes: [], score: 15 },
            { type: "bread", attributes: [], score: 6 },
            { type: "wrap", attributes: [], score: 30 },
            { type: "salad", attributes: [], score: 5 },
            { type: "tomatosalad", attributes: [], score: 8 }
        ]
    },
    { name: "Telepotation Device!", 
        difficulty: "Medium", minPlayers: 2, time: 600,
        newOrderChance: 0.5, maxOrders: 5, plateChance: 0.75,
        img: `
--DP---xCB--PS--------  DP = Potato Dispenser   CB = Cutting Board
SS        TT        DO  SS = Sink               PS = Pot on Stove
OO   1    MB    2   Dp  OO = Counter            DO = Onion Dispenser
TC        TT        DD  TC = Trash Can          MB = Mixing Bowl
--Dd---xFP--OV--------  Dp = Pepper Dispenser   DD = Dough Dispenser
                        FP = Frying Pan         OV = Oven
                        Dd = Dish Dispenser (4) TT = Table
`,
        rooms: [
            { neighboring: 1 },
            { neighboring: 0 }
        ],
        items: [
            { type: "counter", rooms: [0], size: 99, contents: [] },
            { type: "sink", rooms: [0] },
            { type: "trashcan", rooms: [0], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "potato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "pepper", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "plate", amount: 3 },
            { type: "bowl", rooms: [0, 1], size: 4, contents: [] },
            { type: "pot", rooms: [1], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [1], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "pan", rooms: [0], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 6, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [GetFireExtinguisher()] }
        ],
        gimmick: "teleport", gimmickArgs: { interval: 35, chance: 0.5 },
        potentialOrders: [
            { type: "potatosalad", attributes: [], score: 10 },
            { type: "gnocchi", attributes: [], score: 30 },
            { type: "steakfries", attributes: [], score: 5 },
            { type: "frenchfries", attributes: [], score: 3 },
            { type: "potato", attributes: ["baked"], score: 6 }
        ]
    },
    { name: "Jungle Burger: Where A Monkey Can Steal Your Burger But You Still Have To Pay Us!™", 
        difficulty: "Hard", minPlayers: 2, time: 600,
        newOrderChance: 0.4, maxOrders: 6, plateChance: 0.75,
        img: `
--DO--------DM--    DO = Onion Dispenser    DM = Meat Dispenser
TC     TT      |    TC = Trash Can          TT = Table
DC  1  TT  2  DL    DC = Cheese Dispenser   DL = Lettuce Dispenser
SS     TT     OO    SS = Sink               OO = Counter
|   CB---xFP   |    CB = Cutting Board      FP = Frying Pan
DD     TT     DT    DD = Dough Dispenser    DT = Tomato Dispenser
OV  3  TT  4  PS    OV = Oven               PS = Pot on Stove
TC     TT     Dd    Dd = Dish Dispenser (30)
---------------x
`,
        rooms: [
            { down: 2, neighboring: 1 },
            { down: 3, neighboring: 0 },
            { up: 0, neighboring: 3 },
            { up: 1, neighboring: 2 }
        ],
        items: [
            { type: "counter", rooms: [1], size: 99, contents: [] },
            { type: "sink", rooms: [1] },
            { type: "trashcan", rooms: [0, 2], size: 999, contents: [] },
            { type: "dispenser", rooms: [0], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "meat", amount: 999 },
            { type: "dispenser", rooms: [0], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "lettuce", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [3], dispensed: "tomato", amount: 999 },
            { type: "dispenser", rooms: [3], dispensed: "plate", amount: 30 },
            { type: "bowl", rooms: [0, 1], size: 4, contents: [] },
            { type: "pot", rooms: [3], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [2], switchedOn: false, size: 4, contents: [] },
            { type: "cuttingboard", rooms: [0, 2], size: 1, contents: [] },
            { type: "pan", rooms: [1, 3], size: 1, contents: [] },
            { type: "table", rooms: [0, 1], size: 6, contents: [] },
            { type: "table", rooms: [2, 3], size: 6, contents: [] },
            { type: "floor", rooms: [0, 2], size: 999, contents: [] },
            { type: "floor", rooms: [1, 3], size: 999, contents: [GetFireExtinguisher()] }
        ],
        gimmick: "animals", gimmickArgs: { interval: 5, moveChance: 0.25, appearChance: 0.1, maxAnimalsAtOnce: 2 },
        potentialOrders: [
            { type: "onionrings", attributes: [], score: 6 },
            { type: "pizza", attributes: [], score: 15 },
            { type: "meatloaf", attributes: [], score: 3 },
            { type: "caesarsalad", attributes: [], score: 10 },
            { type: "cheeseburger", attributes: [], score: 25 }
        ]
    },
    { name: "Everything and the Kitchen Sink!", 
        difficulty: "Hard", minPlayers: 4, time: 900,
        newOrderChance: 0.35, maxOrders: 8, plateChance: 0.75,
        img: `
------PS--------DP--DT--DL--    PS = Pot and Stove      DP = Potato Dispenser
|            |             |    DT = Tomato Dispenser   DL = Lettuce Dispenser
CB     1            2     FP    CB = Cutting Board      FP = Frying Pan
|            |             |                            TC = Trash Can
--TC--TTTT------xTTTT---PS------xSSxTC---               TT = Table
DO           DD            |            |               SS = Sink
DM     3     TT     4            5     OO               DO = Onion Dispenser
DC           Dm            |            |               DD = Dough Dispenser
|-----   ------Dp--OV---Dd--CV-----------               DM = Mushroom Dispenser
MB            |             ^                           OO = Counter
CB     6      |             ^   DC = Cheese Dispenser   Dm = Meat Dispenser
FP           CV>>>>>>>>>>>>>>   OV = Oven               Dp = Plate Dispenser (15)  
---------------                 MB = Mixing Bowl        CV = Conveyor Belt
`,
        rooms: [
            { right: 1, neighboring: 2 },
            { left: 0, neighboring: 3 },
            { down: 5, neighboring: 0 },
            { right: 4, neighboring: 2, neighboring2: 1 },
            { left: 3 },
            { up: 2 }
        ],
        items: [
            { type: "counter", rooms: [4], size: 3, contents: [] },
            { type: "sink", rooms: [4] },
            { type: "belt", rooms: [5], start: true, to: 4, size: 4, contents: [] },
            { type: "belt", rooms: [4], start: false, from: 5, size: 4, contents: [] },
            { type: "dispenser", rooms: [1], dispensed: "potato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "tomato", amount: 999 },
            { type: "dispenser", rooms: [1], dispensed: "lettuce", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "onion", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "mushroom", amount: 999 },
            { type: "dispenser", rooms: [2], dispensed: "cheese", amount: 999 },
            { type: "dispenser", rooms: [2, 3], dispensed: "dough", amount: 999 },
            { type: "dispenser", rooms: [2, 3], dispensed: "meat", amount: 999 },
            { type: "dispenser", rooms: [3], dispensed: "pepper", amount: 999 },
            { type: "dispenser", rooms: [3], dispensed: "plate", amount: 15 },
            { type: "trashcan", rooms: [0, 2, 4], size: 999, contents: [] },
            { type: "cuttingboard", rooms: [0], size: 1, contents: [] },
            { type: "cuttingboard", rooms: [5], size: 1, contents: [] },
            { type: "bowl", rooms: [5], size: 4, contents: [] },
            { type: "pan", rooms: [1], size: 1, contents: [] },
            { type: "pot", rooms: [0], switchedOn: false, size: 4, contents: [] },
            { type: "pot", rooms: [1, 3], switchedOn: false, size: 4, contents: [] },
            { type: "oven", rooms: [3], switchedOn: false, size: 4, contents: [] },
            { type: "table", rooms: [0, 2], size: 4, contents: [] },
            { type: "table", rooms: [2, 3], size: 4, contents: [] },
            { type: "table", rooms: [1, 3], size: 4, contents: [] },
            { type: "floor", rooms: [0], size: 999, contents: [] },
            { type: "floor", rooms: [1], size: 999, contents: [{ type: "extinguisher", modifier: 1, attributes: [] }] },
            { type: "floor", rooms: [2], size: 999, contents: [] },
            { type: "floor", rooms: [3], size: 999, contents: [] },
            { type: "floor", rooms: [4], size: 999, contents: [] },
            { type: "floor", rooms: [5], size: 999, contents: [] }
        ],
        potentialOrders: [
            { type: "potionfire", attributes: [], score: 100 },
            { type: "searedmushroom", attributes: [], score: 20 },
            { type: "parmesantomato", attributes: [], score: 15 },
            { type: "stuffedpepper", attributes: [], score: 16 },
            { type: "dumpling", attributes: [], score: 15 },
            { type: "taco", attributes: [], score: 20 },
            { type: "onionrings", attributes: [], score: 5 },
            { type: "pizza", attributes: [], score: 20 },
            { type: "meatloaf", attributes: [], score: 2 },
            { type: "caesarsalad", attributes: [], score: 8 },
            { type: "cheeseburger", attributes: [], score: 30 },
            { type: "pancakes", attributes: [], score: 12 },
            { type: "bagel", attributes: [], score: 8 },
            { type: "frenchtoast", attributes: [], score: 6 },
            { type: "halloumi", attributes: [], score: 4 },
            { type: "potpie", attributes: [], score: 16 },
            { type: "mushroomsoup", attributes: [], score: 12 },
            { type: "pepperjack", attributes: [], score: 3 },
            { type: "angelhair", attributes: [], score: 15 },
            { type: "fettucini", attributes: [], score: 16 },
            { type: "spaghetti", attributes: [], score: 17 },
            { type: "macaroni", attributes: [], score: 18 },
            { type: "lasagna", attributes: [], score: 25 },
            { type: "roastedonion", attributes: [], score: 3 },
            { type: "frenchonionsoup", attributes: [], score: 11 },
            { type: "mozzarellastick", attributes: [], score: 10 },
            { type: "tomatosoup", attributes: [], score: 10 },
            { type: "spicytomatosoup", attributes: [], score: 15 },
            { type: "bread", attributes: [], score: 6 },
            { type: "wrap", attributes: [], score: 30 },
            { type: "salad", attributes: [], score: 6 },
            { type: "tomatosalad", attributes: [], score: 8 },
            { type: "potatosalad", attributes: [], score: 7 },
            { type: "gnocchi", attributes: [], score: 40 },
            { type: "steakfries", attributes: [], score: 7 },
            { type: "frenchfries", attributes: [], score: 8 },
            { type: "potato", attributes: ["baked"], score: 6 }
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
        return `#${i + 1}: ${map.name}\n+++ Difficulty: ${PadSpaces(map.difficulty, 7)}${map.difficulty}. Minimum Players: ${PadSpaces(map.minPlayers.toString(), 2)}${map.minPlayers}. Time: ${self.FormatTime(map.time, gameSpeed)}`;
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