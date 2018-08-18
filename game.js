const Observers = require("./actionsObserve.js"), Cookers = require("./actionsCooking.js");
const Maintainers = require("./actionsMaintenance.js"), Others = require("./actionsOther.js");
const Food = require("./foodHelpers.js"), Strings = require("./strings.js");
const DiscordHelper = require("./discordHelper.js");
module.exports = {
    ShowHelp: function() {
        DiscordHelper.Say(Strings.HELP1);
        DiscordHelper.Say(Strings.HELP2);
        DiscordHelper.Say(Strings.HELP3);
        return true;
    },
    MainLoop: function(gameData) {
        gameData.secondsPlayed += 1;
        for(let i = 0; i < gameData.map.items.length; i++) {
            const place = gameData.map.items[i];
            if(place.switchedOn) { place.cookingTime += 1; }
        }
        if(gameData.secondsPlayed % 30 === 0) {
            const orders = gameData.map.potentialOrders;
            const order = orders[Math.floor(Math.random() * orders.length)];
            gameData.orders.push(order);
            DiscordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
        }
    },
    HandleAction: function(gameData, userID, action) {
        try {
            const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
            switch(action.type) {
                case "plate": return Maintainers.Plate(gameData, userID, action);
                case "serve": return Maintainers.Serve(gameData, userID, action);
                case "chop": return Cookers.Chop(gameData, userID, action);
                case "fry": return Cookers.Fry(gameData, userID, action);
                case "turn": return Cookers.Turn(gameData, userID, action);
                case "look": return Observers.Look(gameData, currentRoom, actingUser, action);
                case "who": return Observers.Who(gameData, currentRoom, actingUser, userID, action.placeNum);
                case "grab": return Others.Grab(gameData, userID, action);
                case "drop": return Others.Drop(gameData, userID, action);
                case "move": return Others.Move(gameData, userID, action);
            }
        } catch(e) {
            DiscordHelper.Log(e.stack);
            DiscordHelper.SayM(`Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.`);
        }
    },
    
};