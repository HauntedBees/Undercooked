const gimmicks = {
    "earthquake": function(args) {
        const rooms = args.rooms;
        const SwapRoom = function(map, roomAidx, roomBidx) {
            const roomA = map.rooms[roomAidx];
            for(const dir in roomA) {
                if(roomA[dir] === roomBidx) {
                    roomA[dir] = -roomBidx; // this is faulty. solution: just never make an earthquake that connects to room 0
                    console.log(`${roomAidx} ${dir} is now ${roomBidx}`);
                    return true;
                }
            }
            return false;
        }
        let active = false;
        this.interval = args.interval;
        this.chance = args.chance;
        this.Happen = function(map) {
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