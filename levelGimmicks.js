const gimmicks = {
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
        }
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
        }
    }
};
module.exports = {
    GetGimmick: function(type, args) {
        if(type === undefined) { return null; }
        if(gimmicks[type] === undefined) { return null; }
        return new gimmicks[type](args);
    }
};