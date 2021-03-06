# Undercooked
## wut
Undercooked is a text-based co-op cooking game made for the [August 2018 Demake Jam](https://itch.io/jam/demake-jam). You can play it [on the official Discord server](https://discord.gg/zXfrTJR), [invite the official bot to your own server](https://discordapp.com/oauth2/authorize?client_id=478730013286465547&scope=bot&permissions=0) or build and deploy your own Discord bot.
## license
Undercooked is licensed under the [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html) because yes. It has dependencies on a few node.js modules ([discord.io](https://www.npmjs.com/package/discord.io) and [its](https://www.npmjs.com/package/cjopus) [three](https://www.npmjs.com/package/tweetnacl) [dependencies](https://www.npmjs.com/package/ws)) that are all either MIT licensed or public domain.
## why
Demake Jam. I already said that.
## building and running
1. Creating the Discord Bot:
    1. Log into [Discord](https://discordapp.com/) or create an account if you don't have one yet.
    2. Go to the [Discord Application Page](https://discordapp.com/developers/applications/me).
    3. Click the "New App" button.
    4. Give your bot a name (like "Dave's Undercooked Bot") and a description and all that, then click "Create App."
    5. Click the "Create a Bot User" button.
    6. Fill out the bot creation form (leave "Require OAuth2 Grant Code" *unchecked*).
    7. After finishing that, click to reveal your **Token** and save that as well as your **Client ID** for the next steps.
2. Setting up the Bot code on your server:
    1. `git clone https://github.com/HauntedBees/Undercooked.git` (or you can just download it from github)
    2. `cd Undercooked`
    3. `npm install` (the only dependency is [discord.io](https://www.npmjs.com/package/discord.io), and I guess whatever that depends on)
    4. Create an `auth.json` file with the format `{ "token": "XXXX" }`, replacing the X's with your **Token** from Step 1.
    5. Create a `run.sh` script with `node bot.js > out.txt` in it.
        1. Make sure the user running the script has write permission to whatever folder you're writing logs to!
    6. `chmod +x run.sh`
    7. Execute `./run.sh` to start running the bot!
        1. You may need to also run `npm install woor/discord.io#gateway_v6` if the bot doesn't run.
3. Inviting the Bot to your server.
    1. Grab the URL `https://discordapp.com/oauth2/authorize?client_id=XXXXXXX&scope=bot&permissions=0`.
    2. Replace all those X's in the middle with your **Client ID** from Step 1.
    3. Go to that URL, and invite the bot to your server!
    4. Your bot will need permissions to read, write, and delete messages in any channels you want to play Undercooked in, so give them the appropriate roles for that.
4. Playing Undercooked.
    1. Once the bot is running and in your server, type **INIT** to initialize a new game.
    2. Further instructions are provided in-game from this point on. You can type **!HELP** for more information.
## want to make changes?
Go for it! No new changes will be accepted until September 2018 since the Demake Game Jam is being judged up until that point. But after that, if you want to make a change, go nuts! Make those pull requests! Add new features or levels! Fix existing stuff! Go nuts! Any changes that get accepted into the master branch will be deployed to the primary Undercooked bot and server. Please make all changes GNU AGPLv3 compatible, or - even better - GNU AGPLv3 licensed.