const Observers = require("./actionsObserve.js"), Cookers = require("./actionsCooking.js");
const Maintainers = require("./actionsMaintenance.js"), Others = require("./actionsOther.js");
const Food = require("./foodHelpers.js"), Strings = require("./strings.js"), Room = require("./roomHelpers.js");
module.exports = {
    ShowHelp: function(gameData, message) {
        const trimmed = message.replace(/^!HELP\s?/, "");
        if(trimmed === "") {
            gameData.discordHelper.Say(Strings.HELP);
        } else {
            const cmdHelp = Strings.INDIVIDUALINSTRUCTIONS[trimmed];
            if(cmdHelp === undefined) {
                gameData.discordHelper.SayM(`I don't know how to ${trimmed}. Available verbs are: grab, put, move, trash, use, throw, chop, fry, turn, mix, plate, serve, wash, look, who, find, what, holding.`);
            } else {
                gameData.discordHelper.SayP(cmdHelp);
            }
        }
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
        for(const playerId in gameData.playerDetails) {
            const player = gameData.playerDetails[playerId];
            if(player.stuckTimer > 0) { player.stuckTimer -= 1; }
        }
        for(let i = 0; i < gameData.map.items.length; i++) {
            const place = gameData.map.items[i];
            if(place.type === "trashcan") { place.contents = []; }
            else if(place.type === "belt") {
                if(!place.start) { continue; }
                if(place.contents.length === 0) { continue; }
                const otherConveyor = Room.FindReceiverConveyorBelt(gameData.map, place.to, place.rooms[0]);
                if(otherConveyor === undefined || otherConveyor === null) { console.log("neighbor not found!"); continue; }
                if(otherConveyor.contents.length >= otherConveyor.size) { console.log("neighbor is full!"); continue; }
                const itemToTransport = place.contents.shift();
                otherConveyor.contents.push(itemToTransport);
            } else if(place.switchedOn && !place.onFire) {
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
            if(actingUser.stuckTimer > 0) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to move, but they're still unconscious for another ${actingUser.stuckTimer} second${actingUser.stuckTimer === 1 ? "" : "s"}.`);
                return;
            }
            switch(action.type) {
                case "plate": return Maintainers.Plate(gameData, currentRoom, actingUser, action);
                case "serve": return Maintainers.Serve(gameData, currentRoom, actingUser);
                case "use": return Maintainers.Use(gameData, currentRoom, actingUser, action);
                case "wash": return Maintainers.Wash(gameData, currentRoom, actingUser);
                case "chop": return Cookers.Chop(gameData, currentRoom, actingUser, action);
                case "fry": return Cookers.Fry(gameData, currentRoom, actingUser, action);
                case "turn": return Cookers.Turn(gameData, currentRoom, actingUser, action);
                case "mix": return Cookers.Mix(gameData, currentRoom, actingUser, action);
                case "find": return Observers.Find(gameData, currentRoom, actingUser, action);
                case "look": return Observers.Look(gameData, currentRoom, actingUser, action);
                case "what": return Observers.What(gameData, actingUser, action.object);
                case "who": return Observers.Who(gameData, currentRoom, actingUser, userID, action.placeNum);
                case "holding": return Observers.Holding(gameData, actingUser);
                case "grab": return Others.Grab(gameData, currentRoom, actingUser, action);
                case "drop": return Others.Drop(gameData, currentRoom, actingUser, action);
                case "move": return Others.Move(gameData, currentRoom, actingUser, action);
                case "throw": return Others.Throw(gameData, currentRoom, actingUser, action.to);
            }
        } catch(e) {
            gameData.discordHelper.Log(e.stack);
            gameData.discordHelper.SayM(`Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.`);
        }
    },
    
};