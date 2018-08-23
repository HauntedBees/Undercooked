const Observers = require("./actionsObserve.js"), Cookers = require("./actionsCooking.js");
const Maintainers = require("./actionsMaintenance.js"), Others = require("./actionsOther.js");
const Food = require("./foodHelpers.js"), Strings = require("./strings.js"), Room = require("./roomHelpers.js");
const Tutorial = require("./tutorial.js"), Admin = require("./actionsHost.js");
const self = module.exports = {
    ShowHelp: function(gameData, message) {
        const trimmed = message.replace(/^!HELP\s?/, "");
        if(trimmed === "") {
            gameData.discordHelper.Say(Strings.HELP);
        } else {
            const cmdHelp = Strings.INDIVIDUALINSTRUCTIONS[trimmed];
            if(cmdHelp === undefined) {
                gameData.discordHelper.SayM(`I don't know how to ${trimmed}. Available verbs are: grab, put, move, trash, use, throw, chop, fry, turn, mix, plate, serve, wash, look, who, find, what, holding, level, orders.`);
            } else {
                gameData.discordHelper.SayP(cmdHelp);
            }
        }
        return true;
    },
    MainLoop: function(gameData) {
        gameData.secondsPlayed += 1;
        if(gameData.cancelled) { return; }
        if(gameData.complete) {
            gameData.restartTimer -= 1;
            if(gameData.restartTimer < 0) {
                gameData.cancelled = true;
                gameData.complete = false;
                console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] New round not started on channel ${gameData.channelID}.`);
                gameData.discordHelper.SayM(`Game over! Good game, everybody! To start a new match, someone best be typin' INIT!`);
                setTimeout(gameData.KillGame, 1000);
            }
            return;
        }
        if((gameData.secondsPlayed - gameData.lastActionTimeSecond) > 120) {
            gameData.cancelled = true;
            console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Timing out and cancelling the game on channel ${gameData.channelID}.`);
            gameData.discordHelper.SayM(`Due to inactivity, the round has been cancelled. To start a new match, someone best be typin' INIT!`);
            setTimeout(gameData.KillGame, 1000);
            return;
        }
        const timeRemaining = gameData.endingTime - gameData.secondsPlayed;
        if(timeRemaining < 0) {
            gameData.discordHelper.SayP("Time's up!");
            gameData.complete = true;
            self.LevelComplete(gameData);
            return;
        } else if(timeRemaining % 60 === 0) {
            const minutesRemaining = timeRemaining / 60;
            if([2, 5, 10].indexOf(minutesRemaining) >= 0) {
                gameData.discordHelper.SayP(`${minutesRemaining} minutes remaining!`);
            } else if(minutesRemaining === 1) {
                gameData.discordHelper.SayP(`One minute remaining!`);
            }
        } else if(timeRemaining === 30) {
            gameData.discordHelper.SayP(`30 seconds remaining!`);
        } else if(timeRemaining === 10) {
            gameData.discordHelper.SayP(`10 seconds remaining!`);
        }
        if(gameData.isTutorial) {
            gameData.tutorialState = Tutorial.Toot(gameData, gameData.tutorialState);
            if(gameData.tutorialState < 0) { // tutorial complete!
                self.LevelComplete(gameData);
                return;
            }
        }
        if(gameData.killedEveryone) {
            self.LevelComplete(gameData);
            return;
        }
        for(const playerId in gameData.playerDetails) {
            const player = gameData.playerDetails[playerId];
            if(player.stuckTimer > 0) { player.stuckTimer -= 1; }
        }
        for(let i = 0; i < gameData.map.items.length; i++) {
            const place = gameData.map.items[i];
            if(place.onFire) {
                if(Math.random() > 0.05) { continue; } // 5% chance of fire spreading
                const objectsInRoom = Room.GetObjectsInRoom(gameData.map, place.rooms[0]);
                const randomObjInRoom = objectsInRoom[Math.floor(Math.random() * objectsInRoom.length)];
                if(randomObjInRoom.type === "floor" || randomObjInRoom.onFire) { continue; } // they got lucky this time
                randomObjInRoom.onFire = true;
                gameData.discordHelper.SayM(`Oh yoink! The fire from ${Food.FormatPlaceName(place.type, true)} ${Room.GetPlaceNumber(gameData.map.items, place.rooms[0], place.type, i)} spread to ${Food.FormatPlaceName(randomObjInRoom.type)}! Use a fire extinguisher to put out the fire!!`);
            } else if(place.type === "trashcan") { place.contents = []; }
            else if(place.type === "belt") {
                if(!place.start) { continue; }
                if(place.contents.length === 0) { continue; }
                const otherConveyor = Room.FindReceiverConveyorBelt(gameData.map, place.to, place.rooms[0]);
                if(otherConveyor === undefined || otherConveyor === null) { console.log("neighbor not found!"); continue; }
                if(otherConveyor.contents.length >= otherConveyor.size) { console.log("neighbor is full!"); continue; }
                const itemToTransport = place.contents.shift();
                otherConveyor.contents.push(itemToTransport);
            } else if(place.switchedOn) {
                place.cookingTime += 1;
                if(place.cookingTime >= place.burnTime) {
                    place.onFire = true;
                    gameData.discordHelper.SayM(`Oh yoink! ${Food.FormatPlaceName(place.type, true)} ${Room.GetPlaceNumber(gameData.map.items, place.rooms[0], place.type, i)} caught fire! Turn it off, then use a fire extinguisher to put out the fire!!`);
                }
            }
        }
        if(gameData.secondsPlayed % 10 === 0 || gameData.secondsPlayed === 2) {
            if(gameData.orders.length < gameData.map.maxOrders && (gameData.secondsPlayed === 2 || Math.random() <= gameData.map.newOrderChance)) {
                const orders = gameData.map.potentialOrders;
                if(orders.length > 0) {
                    const order = orders[Math.floor(Math.random() * orders.length)];
                    gameData.orders.push(order);
                    gameData.discordHelper.SayF(`Order up! Somebody wants ${Food.GetFoodDisplayNameFromObj(order)}, an order worth $${order.score}!`);
                }
            }
        }
        if(gameData.secondsPlayed % 8 === 0) {
            if(gameData.platesOnField > 0 && Math.random() < gameData.map.plateChance) {
                const plateArea = Room.FindCounter(gameData.map);
                if(plateArea !== undefined) {
                    gameData.platesOnField -= 1;
                    plateArea.contents.push({ type: "plate", modifier: 1, attributes: ["dirty"] });
                    gameData.discordHelper.SayP(`A new dirty dish has been added to the counter! Wash it if you're low on dishes!`);
                }
            }
        }
        if(gameData.map.gimmick !== null) {
            if(gameData.secondsPlayed % gameData.map.gimmick.interval === 0 && Math.random() <= gameData.map.gimmick.chance) {
                const resStr = gameData.map.gimmick.Happen(gameData);
                if(resStr !== "") { gameData.discordHelper.SayP(resStr); }
            }
        }
    },
    LevelComplete: function(gameData) {
        gameData.complete = true;
        gameData.restartTimer = 60;
        const rewards = [];
        let mostActivePlayer = "", mostActiveCount = 0;
        for(const pID in gameData.playerDetails) {
            const player = gameData.playerDetails[pID];
            if(player.activeActions.length > mostActiveCount) {
                mostActiveCount = player.activeActions.length;
                mostActivePlayer = player.nick;
            }
            const rankedActions = {};
            player.activeActions.forEach(e => rankedActions[e] = (rankedActions[e] !== undefined ? rankedActions[e] + 1 : 1));
            let highestAction = "", highestActionCount = 0;
            for(const action in rankedActions) {
                const thisActionCount = rankedActions[action];
                if(thisActionCount > highestActionCount) {
                    highestAction = action;
                    highestActionCount = thisActionCount;
                }
            }
            let rewardName = "";
            switch(highestAction) {
                case "fry": rewardName = "Fryer Friar"; break;
                case "chop": rewardName = "Chopper"; break;
                case "oven": rewardName = "Master Baker"; break;
                case "stove": rewardName = "Pot Head"; break;
                case "serve": rewardName = "Serving Champ"; break;
                case "walk": rewardName = "Leg Day Champ"; break;
                case "extinguish": rewardName = "Firestopper"; break;
                case "wash": rewardName = "Dishwasher Guru"; break;
                case "dispense": rewardName = "Food Grabber"; break;
                case "throw": rewardName = "Tosser"; break;
                case "throw_bad": rewardName = "Butterfingers"; break;
                case "assault": rewardName = "Cyberbully"; break;
                case "defend": rewardName = "Animal Expert"; break;
                case "strip": rewardName = "Master-Class Stripper"; break;
            }
            if(player.activeActions.indexOf("death") >= 0) {
                rewards.push(`Literally Killed Everyone:  ${player.nick}`);
            }
            if(highestAction !== "assault" && player.activeActions.indexOf("assault") >= 0) {
                rewards.push(`Violent Tendencies:  ${player.nick}`);
            }
            if(highestAction !== "strip" && player.activeActions.indexOf("strip") >= 0) {
                rewards.push(`Stripper:  ${player.nick}`);
            }
            if(!player.shirt && !player.pants && player.shoes === 0) {
                if(player.hat) { rewards.push(`Mad Hatter:  ${player.nick}`); }
                else { rewards.push(`Underwarrior:  ${player.nick}`); }
            }
            if(rewardName !== "") { rewards.push(`${rewardName}:  ${player.nick}`); }
        }
        rewards.unshift(`Most Active: ${mostActivePlayer}`);
        console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] Game completed on channel ${gameData.channelID}.`);
        if(gameData.score > 9999999) { gameData.score = 9999999; }
        if(gameData.ordersCleared > 99999) { gameData.ordersCleared = 99999; }
        gameData.discordHelper.Say(`\`\`\`asciidoc
=== Level Complete ===
======================
Orders Served:   ${" ".repeat(5 - gameData.ordersCleared.toString().length)}${gameData.ordersCleared}
Money Made:   ${" ".repeat(7 - gameData.score.toString().length)}$${gameData.score}       
${rewards.join("\n")}
\`\`\``);
        gameData.discordHelper.SayP(`${gameData.hostUserName}, say "AGAIN" in the next 60 seconds to set up another round with the same team, or "CANCEL" to disband the team!`);
    },
    HandleAction: function(gameData, userID, action, message) {
        if(gameData.cancelled || gameData.complete || gameData.killedEveryone) { return; }
        gameData.lastActionTimeSecond = gameData.secondsPlayed;
        try {
            const currentRoom = gameData.playerDetails[userID].room, actingUser = gameData.playerDetails[userID];
            if(actingUser.stuckTimer > 0) {
                gameData.discordHelper.SayM(`${actingUser.nick} tried to move, but they're still unconscious for another ${actingUser.stuckTimer} second${actingUser.stuckTimer === 1 ? "" : "s"}.`);
                return;
            }
            if(Room.TrySlipOnFloor(gameData, actingUser, action.type)) { return; }
            if(action.host) {
                if(userID !== gameData.hostUserID) { return; }
                switch(action.type) {
                    case "kick": return Admin.KickUser(gameData, actingUser, userID, action.who);
                    case "endgame": return Admin.EndGame(gameData, actingUser);
                }
                return;
            }
            if(action.place !== undefined) { action.place = self.GetExpandedPlaceName(action.place); }
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
                case "orders": return Observers.Orders(gameData);
                case "level": return Observers.Level(gameData);
                case "holding": return Observers.Holding(gameData, actingUser);
                case "grab": return Others.Grab(gameData, currentRoom, actingUser, action);
                case "drop": return Others.Drop(gameData, currentRoom, actingUser, action);
                case "move": return Others.Move(gameData, currentRoom, actingUser, action);
                case "throw": return Others.Throw(gameData, currentRoom, actingUser, action);
            }
        } catch(e) {
            gameData.discordHelper.Log(`Message: ${message}\nAction: ${JSON.stringify(action)}\nException: ${e.stack}`);
            gameData.discordHelper.SayM(`Something broke but we're all good. I recovered. I'm a big boy. We got this. We're good.`);
        }
    },
    GetExpandedPlaceName: function(place) {
        switch(place) {
            case "b": return "belt";
            case "c": return "cuttingboard";
            case "d": return "dispenser";
            case "f": return "pan";
            case "m": return "bowl";
            case "o": return "oven";
            case "p": return "pot";
            case "s": return "stove";
            case "t": return "table";
            default: return place;
        }
    }
};