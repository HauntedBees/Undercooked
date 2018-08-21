module.exports = {
    DiscordHelper: function(b, c) {
        let SayFromCache = function() {
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
                    console.log((new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) + " " + JSON.stringify(err));
                    messageCache.shift();
                }
                awaitingResponse = false;
            });
        }
        let messageCache = [], bot = b, channelID = c, iter = setInterval(SayFromCache, 250);
        let awaitingResponse = false;
        this.Say = function(message) { messageCache.push(message); };
        this.SayP = function(message) { messageCache.push(`\`\`\`diff\n+ ${message}\`\`\``); }; // "Say" wrapped in the "diff" formatting wrapper, first line prefixed with +
        this.SayM = function(message) { messageCache.push(`\`\`\`diff\n- ${message}\`\`\``); }; // "Say" wrapped in the "diff" formatting wrapper, first line prefixed with -
        this.Log = function(message) { console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] ${message}`); };
        this.CleanUp = function() { clearInterval(iter); messageCache = []; }
    }
};