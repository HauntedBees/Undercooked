const t = "```", d = "```diff";
module.exports = {
    TITLE: `${t}========================================================
   __  __        __                      __          __
  / / / /__  ___/ /__ ___________  ___  / /_____ ___/ /
 / /_/ / _ \\/ _  / -_) __/ __/ _ \\/ _ \\/  '_/ -_) _  / 
 \\____/_//_/\\_,_/\\__/_/  \\__/\\___/\\___/_/\\_\\\\__/\\_,_/ 
 ======================================================== 
  America's Favorite Text-Based Co-Op Cooking Adventure!${t}`,
    PLAYERS_2: `${d}
+ Two players!`,
    PLAYERS_3: `${d}
+ Three players!`,
    PLAYERS_4: `${d}
+ Four players!`,
    PLAYERS_MANY: `${d}
+ Tons of players!`,
    PLAYERS_END: ` If you want to join this round, type *JOIN*. If you join and wish to leave the round before it starts, type *LEAVE.*
+ Once there are enough players, the host can type *START* to begin or *CANCEL* to cancel the round! ${t}`,
    ERROR: `${d}
- Yeah, that ain't a valid command here.${t}`,
    CANCELROUND: `${d}
- Round Cancelled! To start a new match, someone best be typin' INIT!${t}`,
    HELP1: `${t}md
# Undercooked Instruction Manual
---------------------------------

What is Undercooked?
----------------------
Undercooked is a text-based co-op cooking game, where you must work together with other players to cook delicious meals at your very own restaurant!

How do I start the game?
--------------------------
Say <INIT> to become the host. After that, follow the prompts to select the number of players, then start the game after enough players have joined. The number of players you specify is a maximum, so you can still start a 4-player game after only 2 people have joined!

How do I play?
---------------
Well, as a reminder, you can say <!HELP> at any time to see this message again! Once the game is started, only people actually playing the game can do this.

The following commands are available to you:
< grab > - pick up an item 
* synonyms: take, get, acquire, procure, obtain
* format: grab item from place (number)
* examples: "grab tomato from dispenser", "take tomato from table 2"

< drop > - put down an item
* synonyms: put, place, plop, set, deposit, position
* format: put item on place (number)
* examples: "put tomato on cutting board 1", "drop tomato on table"
* notes: you can just write "drop tomato" to put it on the floor - anyone else in the room can pick it up then! items on the floor may be trampled, though. (TODO: actually implement that)
${t}`,
    HELP2: `${t}md
< chop > - cut an item that's on a cutting board
* synonyms: cut, slice, dice, mince, stab, knife, julienne, chiffonade
* format: chop item (number)
* examples: "chop tomato", "cut potato 2"
* notes: the number here maps to the cutting board number, so "cut potato 2" is like saying "cut the potato on cutting board 2"

< plate > - put an item on a plate so it's ready to serve!
* format: plate item (on place (number))
* examples: "plate tomato", "plate tomato on table", "plate tomato on table 2"
* notes: "drop tomato on plate" also works - if you don't specify a place, it will look for any available plates in your room

< serve > - serves an item to the hungry customers!
* synonyms: deliver, provide, supply
* examples: "serve tomato"
* notes: you never need to specify additional details about an item - if you have a "plated chopped tomato", just refer to it by "tomato!" you'll be informed if a food has a new name (i.e. when "tomato" becomes "soup")!
${t}`
}