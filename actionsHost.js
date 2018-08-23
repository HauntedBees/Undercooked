module.exports = {
    KickUser: function(gameData, actingUser, hostID, target) {
        let targID = "", isIDcheck = false;
        if(target.indexOf("<@!") === 0) { // @-tagged users are in the format of <@!userID>
            targID = target.replace("<@!", "").replace(">", "");
            isIDcheck = true;
            if(gameData.playerDetails !== null && gameData.playerDetails[targID] !== undefined) { target = gameData.playerDetails[targID].nick; }
        }
        const targetLowercase = target.toLowerCase();
        if(actingUser.nick.toLowerCase() === targetLowercase || targID === hostID){
            gameData.discordHelper.SayM(`${actingUser.nick} tried to kick themselves from the game. Interesting choice, but you can't do that.`);
            return false;
        }
        if(isIDcheck) {
            const idx = gameData.players.indexOf(targID);
            if(idx >= 0) {
                gameData.kickedUserIDs.push(targID);
                if(gameData.playerDetails !== null) { delete gameData.playerDetails[targID]; }
                gameData.players.splice(idx, 1);
                console.log(`${actingUser.nick} kicked ${targID}.`);
                gameData.discordHelper.Say(`${actingUser.nick} has kicked <@!${targID}> from the game. They will no longer be able to join matches hosted by ${actingUser.nick}.`);
                return true;
            }
        } else {
            for(const playerId in gameData.playerDetails) {
                const player = gameData.playerDetails[playerId];
                if(player.nick.toLowerCase() !== targetLowercase) { continue; }
                gameData.kickedUserIDs.push(playerId);
                delete gameData.playerDetails[playerId];
                const idx = gameData.players.indexOf(playerId);
                if(idx >= 0) { gameData.players.splice(idx, 1); }
                console.log(`${actingUser.nick} kicked ${player.nick} (${playerId}).`);
                gameData.discordHelper.Say(`${actingUser.nick} has kicked ${player.nick} from the game. They will no longer be able to join matches hosted by ${actingUser.nick}.`);
                return true;
            }
        }
        gameData.discordHelper.SayM(`${actingUser.nick} tried to kick ${target} from the game, but I can't find that user to kick! Type their nickname or @-tag them!`);
    },
    EndGame: function(gameData, actingUser) {
        gameData.discordHelper.SayColor(actingUser.color, `${actingUser.nick} ended the game early.`);
        console.log(`${actingUser.nick} ended the game.`);
        gameData.killedEveryone = true;
    }
}