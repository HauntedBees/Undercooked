const logger = require("winston");
let messageCache = [], bot = null, channelID = "", iter = 0;
let awaitingResponse = false;
function SayFromCache() {
    if(messageCache.length === 0 || awaitingResponse) { return; }
    awaitingResponse = true;
    bot.sendMessage({ to: channelID, message: messageCache[0] }, function(err, response) {
        if(err === null) {
            messageCache.shift();
        } else if(err.statusMessage === "TOO MANY REQUESTS") {
            clearInterval(iter);
            setTimeout(() => {
                iter = setInterval(SayFromCache, 250);
            }, 1000);
        } else {
            logger.error(JSON.stringify(err));
            messageCache.shift();
        }
        awaitingResponse = false;
    });
}
module.exports = {
    Init: function(gameData) {
        bot = gameData.bot;
        channelID = gameData.channelID;
        iter = setInterval(SayFromCache, 250);
    },
    Clean: function() {
        messageCache = [];
        bot = null;
        channelID = "";
        clearInterval(iter);
        iter = 0;
    },
    Say: function(message) { messageCache.push(message); },
    Log: function(message) { logger.info(message); },
    LogError: function(message) { logger.error(message) }
    SayP: function(message) { messageCache.push(`\`\`\`diff
+ ${message}\`\`\``); }, // "Say" wrapped in the "diff" formatting wrapper, first line prefixed with +
    SayM: function(message) { messageCache.push(`\`\`\`diff
- ${message}\`\`\``); }, // "Say" wrapped in the "diff" formatting wrapper, first line prefixed with -
};