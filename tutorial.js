const Room = require("./roomHelpers.js"), Food = require("./foodHelpers.js");
const states = [
    {
        text: `Hey kids! Welcome to the Tutorial! I bet you're all ready to START COOKING, aren't you? Excellent. Excellent. Well, first thing's first, you need some food to prepare! Someone in Room 2 should type "grab tomato from dispenser" to grab a tomato!`,
        advanceCondition: function(gameData) {
            for(const pID in gameData.playerDetails) {
                const player = gameData.playerDetails[pID];
                if(player.holding === null) { continue; }
                if(player.room !== 1) { continue; }
                if(player.holding.type === "tomato") { return true; }
            }
            return false;
        }
    }, {
        text: `Excellent! A tomato! The food of the future! The fruit and/or vegetable we all know and love for its role in pizza, pasta, and bad stage productions! Now, we need to chop that tomato, but there are no cutting boards in Room 2! Type "put on table" to put the tomato on a table the players in Room 1 can reach!`,
        advanceCondition: function(gameData) {
            const tables = Room.GetObjectsOfTypeInRoom(gameData.map, 1, "table");
            for(let i = 0; i < tables.length; i++) {
                const table = tables[i];
                if(table.contents.some(item => item.type === "tomato")) { return true; }
            }
            return false;
        }
    }, {
        text: `Superb! Tables are nature's way of having things on a thing that isn't the floor! Now, someone in Room 1 should pick up that tomato by typing "grab tomato from table!" Getting the hang of these text commands yet?`,
        advanceCondition: function(gameData) {
            for(const pID in gameData.playerDetails) {
                const player = gameData.playerDetails[pID];
                if(player.holding === null) { continue; }
                if(player.room !== 0) { continue; }
                if(player.holding.type === "tomato") { return true; }
            }
            return false;
        }
    }, {
        text: `Great! Now, remember: tomatoes are great, but they're even greater after a knife has been used on them several times! Put that tomato on a cutting board by typing "put on cutting board!"`,
        advanceCondition: function(gameData) {
            const cuttingboards = Room.GetObjectsOfTypeInRoom(gameData.map, 0, "cuttingboard");
            for(let i = 0; i < cuttingboards.length; i++) {
                const cuttingboard = cuttingboards[i];
                if(cuttingboard.contents.some(item => item.type === "tomato")) { return true; }
            }
            return false;
        }
    }, {
        text: `Tubular! Now it's time to turn that tomato into several fractions of a tomato! Type "cut tomato" to punish it for its hubris!`,
        advanceCondition: function(gameData) {
            const cuttingboards = Room.GetObjectsOfTypeInRoom(gameData.map, 0, "cuttingboard");
            for(let i = 0; i < cuttingboards.length; i++) {
                const cuttingboard = cuttingboards[i];
                if(cuttingboard.contents.some(item => item.type === "tomato" && Food.HasAttribute(item, "sliced"))) {
                    const order = { type: "tomato", attributes: ["sliced"], score: 5 };
                    gameData.orders.push(order);
                    gameData.discordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
                    return true;
                }
            }
            return false;
        }
    }, {
        text: `Gruncheous! And you're just in time, too! Somebody ordered sliced tomatoes! But before you can serve it, it needs to be plated! All foods must be on a plate before you can serve them! Someone in Room 2 should grab a plate from the plate dispenser and put it on the table!`,
        advanceCondition: function(gameData) {
            const tables = Room.GetObjectsOfTypeInRoom(gameData.map, 1, "table");
            for(let i = 0; i < tables.length; i++) {
                const table = tables[i];
                if(table.contents.some(item => item.type === "plate")) { return true; }
            }
            return false;
        }
    }, {
        text: `Baseball! With that plate on the table, you can plate the sliced tomato! Someone in Room 1 should pick up the tomato from the cutting board, then plate it by typing either "put on plate" or "plate!"`,
        advanceCondition: function(gameData) {
            const tables = Room.GetObjectsOfTypeInRoom(gameData.map, 1, "table");
            for(let i = 0; i < tables.length; i++) {
                const table = tables[i];
                if(table.contents.some(item => item.type === "tomato" && Food.HasAttribute(item, "sliced") && Food.HasAttribute(item, "plated"))) { return true; }
            }
            return false;
        }
    }, {
        text: `Radical! Now it's time to serve that bad boy! Someone in Room 2 needs to pick up that tomato and type "serve" to serve it and complete the order!`,
        advanceCondition: gameData => gameData.orders.length === 0
    }, {
        text: `Exceptional! Now let's try doing the same with some lettuce! Remember the workflow: In Room 2, grab the lettuce from the dispenser and put it on the table. Then in Room 1, grab it from the table, put it on the cutting board, and chop it. Someone in Room 2 should grab a plate and put it on the table so someone in Room 1 can plate the lettuce, then you can serve it!`,
        advanceCondition: () => true
    }, {
        text: "", advanceCondition: function(gameData) {
            const order = { type: "lettuce", attributes: ["sliced"], score: 4 };
            gameData.orders.push(order);
            gameData.discordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
            return true;
        }
    }, {
        text: "", advanceCondition: function(gameData) {
            const order = { type: "tomato", attributes: ["sliced"], score: 5 };
            gameData.orders.push(order);
            gameData.discordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
            return true;
        }
    }, {
        text: "", advanceCondition: function(gameData) {
            const order = { type: "lettuce", attributes: ["sliced"], score: 4 };
            gameData.orders.push(order);
            gameData.discordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
            return true;
        }
    }, {
        text: `Jinkies! Looks like you've got a handful of orders now! Fulfill them all, and you'll be Ready To Move On! Work together and divide your duties to ensure everything gets done as quickly as possible!`,
        advanceCondition: gameData => gameData.orders.length === 0
    }, {
        text: `Spatulastic! You've got the hang of this! Congratulations on mastering the basics of cooking! Now you're ready for the little leagues!`,
        advanceCondition: () => true
    }, { text: "", advanceCondition: () => true }
];
module.exports = {
    Toot: function(gameData, tutState) {
        if(tutState >= states.length) { return -1; }
        const tutInfo = states[tutState];
        if(!gameData.tutWaiting) {
            if(tutInfo.text !== "") { gameData.discordHelper.Say(`**${tutInfo.text}**`); }
            gameData.tutWaiting = true;
        }
        if(tutInfo.advanceCondition(gameData)) {
            gameData.tutWaiting = false;
            return tutState + 1;
        } else {
            return tutState;
        }
    }
};