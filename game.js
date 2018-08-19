const Observers = require("./actionsObserve.js"), Cookers = require("./actionsCooking.js");
const Maintainers = require("./actionsMaintenance.js"), Others = require("./actionsOther.js");
const Food = require("./foodHelpers.js"), Strings = require("./strings.js"), Room = require("./roomHelpers.js");
module.exports = {
    ShowHelp: function(gameData) {
        gameData.discordHelper.Say(Strings.HELP1);
        gameData.discordHelper.Say(Strings.HELP2);
        gameData.discordHelper.Say(Strings.HELP3);
        return true;
    },
    MainLoop: function(gameData) {
        gameData.secondsPlayed += 1;
        if(gameData.cancelled) { return; }
        if((gameData.secondsPlayed - gameData.lastActionTimeSecond) > 60) {
            gameData.cancelled = true;
            console.log(`Timing out and cancelling the game on channel ${gameData.channelID}.`);
            gameData.discordHelper.SayM(`Due to inactivity, the round has been cancelled. To start a new match, someone best be typin' INIT!`);
            setTimeout(gameData.KillGame, 1000);
            return;
        }
        for(let i = 0; i < gameData.map.items.length; i++) {
            const place = gameData.map.items[i];
            if(place.type === "trashcan") { place.contents = []; }
            else if(place.switchedOn && !place.onFire) {
                place.cookingTime += 1;
                if(place.cookingTime >= place.burnTime) {
                    place.onFire = true;
                    gameData.discordHelper.SayM(`Oh yoink! ${Food.FormatPlaceName(place.type, true)} ${Room.GetPlaceNumber(gameData.map.items, place.rooms[0], place.type, i)} caught fire! Turn it off, then use a fire extinguisher to put out the fire!!`);
                }
            }
        }
        if(gameData.secondsPlayed % 30 === 0) {
            const orders = gameData.map.potentialOrders;
            const order = orders[Math.floor(Math.random() * orders.length)];
            gameData.orders.push(order);
            gameData.discordHelper.SayP(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
        }
    },
    HandleAction: function(gameData, userID, action) {
        gameData.lastActionTimeSecond = gameData.secondsPlayed;
        try {
            const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
            switch(action.type) {
                case "plate": return Maintainers.Plate(gameData, userIDaction);
                case "serve": return Maintainers.Serve(gameData, userID, action);
                case "use": return Maintainers.Use(gameData, currentRoom, actingUser, action);
                case "chop": return Cookers.Chop(gameData, userID, action);
                case "fry": return Cookers.Fry(gameData, userID, action);
                case "turn": return Cookers.Turn(gameData, userID, action);
                case "mix": return Cookers.Mix(gameData, currentRoom, actingUser, action);
                case "find": return Observers.Find(gameData, currentRoom, actingUser, action);
                case "look": return Observers.Look(gameData, currentRoom, actingUser, action);
                case "what": return Observers.What(gameData, actingUser, action.object);
                case "who": return Observers.Who(gameData, currentRoom, actingUser, userID, action.placeNum);
                case "holding": return Observers.Holding(gameData, actingUser);
                case "grab": return Others.Grab(gameData, userID, action);
                case "drop": return Others.Drop(gameData, userID, action);
                case "move": return Others.Move(gameData, userID, action);
            }
        } catch(e) {
            gameData.discordHelper.Log(e.stack);
            gameData.discordHelper.SayM(`Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.`);
        }
    },
    
};