const IDtoNicknameMappings = {};
module.exports = {
    GetNickname: function(bot, serverID, userID) {
        if(IDtoNicknameMappings[userID] !== undefined) { return IDtoNicknameMappings[userID]; }
        let nick = bot.servers[serverID].members[userID].nick;
        if(nick === null) {
            nick = bot.users[userID].username;
        }
        IDtoNicknameMappings[userID] = nick;
        return nick;
    },
    GetListStringFromArray: function(arr) {
        if(arr.length === 1) { return arr[0]; }
        if(arr.length === 2) { return `${arr[0]} and ${arr[1]}`; }
        const lastElement = arr.splice(-1, 1)[0];
        return `${arr.join(", ")}, and ${lastElement}`;
    }
};