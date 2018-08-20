const t = "```", d = "```diff";
module.exports = {
    TITLE: `${t}========================================================
   __  __        __                      __          __
  / / / /__  ___/ /__ ___________  ___  / /_____ ___/ /
 / /_/ / _ \\/ _  / -_) __/ __/ _ \\/ _ \\/  '_/ -_) _  / 
 \\____/_//_/\\_,_/\\__/_/  \\__/\\___/\\___/_/\\_\\\\__/\\_,_/ 
======================================================== 
 America's Favorite Text-Based Co-Op Cooking Adventure!${t}`,
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

< drop > - put down whatever you're currently holding item
* synonyms: put, place, plop, set, deposit, position
* format: put on place (number)
* examples: "put on cutting board 1", "drop on table"
* notes: you can just write "drop" to put it on the floor - anyone else in the room can pick it up then! items on the floor may be trampled, though.
${t}`,
    HELP2: `${t}md
< chop > - cut an item that's on a cutting board
* synonyms: cut, slice, dice, mince, stab, knife, julienne, chiffonade
* format: chop item (number)
* examples: "chop tomato", "cut potato 2"
* notes: the number here maps to the cutting board number, so "cut potato 2" is like saying "cut the potato on cutting board 2"

< plate > - put whatever item you're holding on a plate so it's ready to serve!
* format: plate (on place (number))
* examples: "plate", "plate on table", "plate on table 2"
* notes: "drop on plate" also works - if you don't specify a place, it will look for any available plates in your room

< serve > - serves whatever you're holding to the hungry customers!
* synonyms: deliver, provide, supply
* examples: "serve"
* notes: make sure you plated the food first! you can't serve food that isn't on a plate!

< move > - move to another room!
* synonyms: walk, go
* format: "move direction" or "move to room #"
* examples: "move to room 2", "walk north", "go left"

< fry > - fry an item that's on a frying pan
* synonyms: sautee, sauté, sear, brown, sizzle
* format: fry item (number)
* examples: "fry potato", "fry egg 2"
* notes: the number here maps to the frying pan number, so "fry potato 2" is like saying "fry the potato on pan 2"

< turn > - turn an oven or stove on
* synonyms: switch, flip
* format: "turn on/off item (number)" or turn item (number) on/off"
* examples: "turn on stove", "switch oven 2 off"
* notes 1: number is only optional if there is only one of that item in the room.
* notes 2: stoves are linked to pots. if you put items in "pot 2" then to cook the food in that pot, you'd type "turn stove 2 on."
* notes 3: ovens and stoves do not need to be preheated or cleaned. pots do not need to be filled with water.
${t}`,
    HELP3: `${t}md
< look > - look at cooking equipment to see what's going on
* synonyms: look, inspect, view, see, check
* format: "look around (room number)", "look (at) places" or "look (at) place number"
* examples: "look around", "look around room 2", "inspect cutting board 1", "look at tables"
* notes 1: this is only for cooking equipment and furniture, so things like "look at plates" or "look at tomato 2" won't work!
* notes 2: "look around" will tell you about every piece of furniture in the room

< who > - look at who is in a room
* format: "who (is) here" or "who (is in) room number"
* examples: "who is in room 2", "who here"
* notes: "who is here" will tell you who is in the same room as you!

< what > - look up a recipe
* format: what is item
* examples: "what is tomato soup" or "what is potato"
* notes: will tell you how to make a recipe, or tell you if something is just a base item you can find from a dispenser.

< mix > - mix foods in a mixing bowl
* synonyms: stir
* format: mix (bowl) (number)
* examples: "mix bowl 2", "stir 1"
* notes: number is not necessary if only one mixing bowl is in the room.

< trash > - quickly toss whatever you're holding
* format: trash item
* examples: "trash burnt mess"
* notes: shorthand for "put item in trash can 1."

< holding > - check what you're currently holding
* format: holding

< use > - use whatever item you're hodling
* format: use (on place)
* examples: "use on stove"
* notes: you must be holding the item to use it. if no place is specified, a random relevant place will be chosen (i.e. any place that is on fire, if using a fire extinguisher).

< wash > - if you are holding a dirty plate, you can wash it in a sink
* synonyms: clean, scrub
* format: wash (plate)
* examples: "wash plate", "scrub"
${t}`,
    HELP4: `${t}md
< throw > - throw whatever item you're currently holding to another player
* synonyms: toss, chuck, lob, fling
* format: throw to player
* examples: "throw to ellen", "chuck at craig"
* notes 1: if the player isn't in the same room, or a neighboring room, the item will land on the floor of your room.
* notes 2: if the player's hands are full, the item will land on the floor of their room.
* notes 3: please refer to the user by their server nickname, or username if they do not have one. tagging the user with @handle will also work.
${t}`
}