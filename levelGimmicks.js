const Food = require("./foodHelpers.js"), Room = require("./roomHelpers.js");
function ShuffleArray(arr) {
    for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor((i + 1) * Math.random());
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
const gimmicks = {
    "animals": function(args) {
        const animalTypes = [
            { name: "monkey", verbing: "hopping", verbed: "hopped" },
            { name: "snake", verbing: "slithering", verbed: "slithered" },
            { name: "toucan", verbing: "flying", verbed: "flew" },
            { name: "group of ants", internalName: "ants", verbing: "marching", verbed: "marched" },
            { name: "bear", verbing: "walking", verbed: "walked" }
        ];
        const animalsAtOnce = args.maxAnimalsAtOnce;
        const appearChance = args.appearChance;
        const moveChance = args.moveChance;
        const animals = [];
        this.interval = args.interval;
        this.chance = 1;
        this.isAnimalGimmick = true;
        this.GetAnimalsString = function(room) {
            const animalsInRoom = animals.filter(e => e.room === room).map(e => e.name);
            if(animalsInRoom.length === 0) { return ""; }
            return `\n+ The following animals are in this room: ${animalsInRoom.join(", ")}.`;
        };
        this.RepelAnimalInRoom = function(room, animalName) {
            for(let i = 0; i < animals.length; i++) {
                const animal = animals[i];
                if(animal.room !== room) { continue; }
                if(animal.name === animalName || animal.internalName === animalName) {
                    animals.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        this.Happen = function(gameData) {
            const messages = [];
            if(animals.length < animalsAtOnce && Math.random() < appearChance) {
                const animal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
                animal.distance = Math.ceil(3 * Math.random());
                animal.justAppeared = true;
                animal.room = Math.floor(Math.random() * gameData.map.rooms.length);
                messages.push(`= Uh oh! A ${animal.name} just ${animal.verbed} into Room ${animal.room + 1}! Throw something at them to shoo them away before they steal any food!`);
                animals.push(animal);
            }
            for(let i = animals.length - 1; i >= 0; i--) {
                const animal = animals[i];
                if(animal.justAppeared) {
                    animal.justAppeared = false;
                    continue;
                }
                if(Math.random() > moveChance) { continue; }
                animal.distance--;
                if(animal.distance > 1) {
                    messages.push(`= That ${animal.name} is ${animal.verbing} ever closer in Room ${animal.room + 1}! Hurry up and throw something at them!`);
                } else if(animal.distance === 1) {
                    messages.push(`= That ${animal.name} is so close to food in Room ${animal.room + 1}! Throw something at them! Anything! Even clothes!`);
                } else if(animal.distance <= 0) {
                    const places = Room.GetObjectsInRoom(gameData.map, animal.room);
                    ShuffleArray(places);
                    let foundSomething = false;
                    for(let i = 0; i < places.length; i++) {
                        const currentPlace = places[i];
                        if(currentPlace.type === "dispenser") { continue; }
                        if(currentPlace.switchedOn) { continue; }
                        if(currentPlace.contents === undefined) { continue; }
                        if(currentPlace.contents.length === 0) { continue; }
                        if(currentPlace.contents[0].type === "extinguisher") { continue; }
                        foundSomething = true;
                        const found = currentPlace.contents.splice(0, 1)[0];
                        messages.push(`= The ${animal.name} stole ${Food.GetFoodDisplayNameFromObj(found)} from ${Food.FormatPlaceName(currentPlace.type)} Room ${animal.room + 1} and ${animal.verbed} off with it! Shucks!`);
                        break;
                    }
                    if(!foundSomething) {
                        messages.push(`= The ${animal.name} couldn't find anything to steal in Room ${animal.room + 1} and sadly ${animal.verbed} away. Phew!`);
                    }
                    animals.splice(i, 1);
                }
            }
            if(messages.length > 0) { gameData.discordHelper.SayF(messages.join("\n")); }
            return "";
        };
    },
    "teleport": function(args) {
        this.interval = args.interval;
        this.chance = args.chance;
        this.Happen = function(gameData) {
            const pIdxA = Math.floor(Math.random() * gameData.players.length);
            let pIdxB = gameData.players.length === 2 ? (pIdxA === 1 ? 0 : 1) : pIdxA, counter = 5;
            while(counter-- > 0 && pIdxB === pIdxA) {
                pIdxB = Math.floor(Math.random() * gameData.players.length);
            }
            if(pIdxB === pIdxA) { return ""; }
            const playerA = gameData.playerDetails[gameData.players[pIdxA]];
            const playerB = gameData.playerDetails[gameData.players[pIdxB]];
            if(playerB.room === playerA.room) { return ""; }
            const temp = playerB.room;
            playerB.room = playerA.room;
            playerA.room = temp;
            return `An alien teleporter went off! ${playerA.nick} and ${playerB.nick} switched places! Now ${playerA.nick} is in Room ${playerA.room + 1} and ${playerB.nick} is in Room ${playerB.room + 1}!`;
        };
    },
    "earthquake": function(args) {
        const rooms = args.rooms;
        const SwapRoom = function(map, roomAidx, roomBidx) {
            const roomA = map.rooms[roomAidx];
            for(const dir in roomA) {
                if(roomA[dir] === roomBidx) {
                    roomA[dir] = -roomBidx; // this is faulty. solution: just never make an earthquake that connects to room 0
                    return true;
                }
            }
            return false;
        }
        let active = false;
        this.interval = args.interval;
        this.chance = args.chance;
        this.Happen = function(gameData) {
            const map = gameData.map;
            if(active) {
                SwapRoom(map, rooms[0], -rooms[1]);
                SwapRoom(map, rooms[1], -rooms[0]);
                active = false;
                return `An earthquake has connected Room ${rooms[0] + 1} and Room ${rooms[1] + 1}! Players can move between them now!`;
            } else {
                SwapRoom(map, rooms[0], rooms[1]);
                SwapRoom(map, rooms[1], rooms[0]);
                active = true;
                return `An earthquake has separated Room ${rooms[0] + 1} and Room ${rooms[1] + 1}! Players can no longer move between them until they rejoin!`;
            }
        };
    }
};
module.exports = {
    GetGimmick: function(type, args) {
        if(type === undefined) { return null; }
        if(gimmicks[type] === undefined) { return null; }
        return new gimmicks[type](args);
    }
};