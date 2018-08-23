const t = "```";
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
        this.SayColor = function(i, message) {
            switch(i) {
                case 0: this.Say(`${t}md\n# ${message}${t}`); break;    // blue
                case 1: this.Say(`${t}cs\n# ${message}${t}`); break;    // orange
                case 2: this.Say(`${t}fix\n= ${message}${t}`); break;   // cyan
                case 3: this.Say(`${t}xl\n+ ${message}${t}`); break;    // grey
                default: this.Say(message); break;
            }
        },
        this.Say = function(message) { messageCache.push(message); };
        this.SayF = function(message) { messageCache.push(`${t}fix\n${message}${t}`); }; // yellow
        this.SayP = function(message) { messageCache.push(`${t}diff\n+ ${message}${t}`); }; // green
        this.SayM = function(message) { messageCache.push(`${t}diff\n- ${message}${t}`); }; // red
        this.Log = function(message) { console.log(`[${(new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}] ${message}`); };
        this.CleanUp = function() { clearInterval(iter); messageCache = []; }
    }
};