const recipeDisplayNames = {
    "frenchfries": { displayName: "french fries", recipe: "slice a potato on a cutting board, then fry it in a pan" },
    "tomatosoup": { displayName: "tomato soup", recipe: "add two or more tomatos to a pot, then cook until ready" },
    "spicytomatosoup": { displayName: "spicy tomato soup", recipe: "add two or more tomatos and one or more peppers to a pot, then cook until ready" },
    "weirdsoup": { displayName: "weird soup", recipe: "add any ingredients to a pot and cook until ready" },
    "badsoup": { displayName: "bad soup", recipe: "add any ingredients to a pot and either under- or over-cook them" },
    "pileoffood": { displayName: "pile of food", recipe: "add any ingredients to a mixing bowl and mix 'em up. I don't know why you'd do this" },
    "salad": { displayName: "salad", recipe: "add one or more lettuce to a mixing bowl, plus any other ingredients, and mix 'em up" },
    "tomatosalad": { displayName: "tomato salad", recipe: "add one or more lettuce and one or more chopped tomatoes to a mixing bowl, plus any other ingredients, and mix 'em up" },
    "potionfire": { displayName: "potion of resist fire", recipe: "mix two cheese in a mixing bowl" },
    "pastadough": { displayName: "pasta dough", recipe: "chop dough on a cutting board" },
    "angelhair": { displayName: "angelhair", recipe: "cook pasta dough in a pot" },
    "fettucini": { displayName: "fettucini alfredo", recipe: "cook pasta dough and one or two cheese in a pot" },
    "spaghetti": { displayName: "spaghetti and meatballs", recipe: "cook pasta dough, tomato, and meat in a pot" },
    "macaroni": { displayName: "macaroni and cheese", recipe: "cook pasta dough and three cheese in a pot" },
    "burntmess": { displayName: "burnt mess", recipe: "severely overcook anything in an oven" },
    "weirdbake": { displayName: "weird baked dish", recipe: "add any ingredients to an oven and cook until ready" },
    "extinguisher": { displayName: "fire extinguisher", recipe: "combine nitrogen and pressure can" },
    "aaaa": { displayName: "aaaa", recipe: "" },
    "aaaa": { displayName: "aaaa", recipe: "" },
    "aaaa": { displayName: "aaaa", recipe: "" }
};
const self = module.exports = {
    GetBaseFood: function(name) {
        return {
            type: name, modifier: 1,
            attributes: []
        };
    },
    HasAttribute: function(food, attr) {
        for(let i = 0; i < food.attributes.length; i++) {
            if(food.attributes[i] === attr) { return true; }
        }
        return false;
    },
    DoesFoodMatchOrder: function(food, order) {
        if(food.type !== order.type) { return false; }
        let isPlated = false, numMatches = 0;
        for(let i = 0; i < food.attributes.length; i++) {
            const attr = food.attributes[i];
            if(attr === "plated") { isPlated = true; continue; }
            if(order.attributes.indexOf(attr) < 0) { return false; } // food has an attribute the order does not
            numMatches += 1;
        }
        if(numMatches != order.attributes.length || !isPlated) { return false; }
        return true;
    },

    FlattenFoodNames: function(s) {
        for(const noSpaces in recipeDisplayNames) {
            const spaces = recipeDisplayNames[noSpaces].displayName;
            s = s.replace(spaces, noSpaces);
        }
        return s;
    },

    AorAN: function(s) { 
        if("aeiou".indexOf(s[0]) >= 0) { return `an ${s}`; }
        return `a ${s}`;
    },
    FormatPlaceName: function(placeName, noAorAn) {
        if(placeName === "cuttingboard") { placeName = "cutting board"; }
        else if(placeName === "pan") { placeName = "frying pan"; }
        else if(placeName === "bowl") { placeName = "mixing bowl"; }
        if(noAorAn) { return placeName; }

        if("aeiou".indexOf(placeName[0]) >= 0) { return `an ${placeName}`; }
        return `a ${placeName}`;
    },

    GetRecipeNameAndHowMake: function(userName, name) {
        const dish = recipeDisplayNames[name];
        if(dish === undefined) { // just an ingredient
            const ingName = self.GetFoodDisplayNameFromObj({ type: name, attributes: [] }).replace("an ", "").replace("a ", "");
            return `${userName} consulted their cookbook. ${ingName}: literally just an ingredient. check a dispenser for it.`;
        } else { // actually a dish
            return `${userName} consulted their cookbook. ${dish.displayName}: ${dish.recipe}.`;
        }
    },
    GetFoodDisplayNameFromAction: (action, ignorePlated) => self.GetFoodDisplayNameFromObj({ type: action.object, attributes: (action.objAttrs || []) }, ignorePlated || false),
    GetFoodDisplayNameFromObj: function(food, ignorePlated) {
        let name = food.type;
        if(recipeDisplayNames[name] !== undefined) { name = recipeDisplayNames[name].displayName; }
        food.attributes.sort();
        for(let i = 0; i < food.attributes.length; i++) {
            switch(food.attributes[i]) {
                case "sliced": name = `chopped ${name}`; break;
                case "fried": name = `fried ${name}`; break;
                case "baked": name = `baked ${name}`; break;
                case "dirty": name = `dirty ${name}`; break;
            }
        }
        if(!ignorePlated && food.attributes.indexOf("plated") >= 0) {
            name = `plated ${name}`;
        }
        if("aeiou".indexOf(name[0]) >= 0) {
            return `an ${name}`;
        } else {
            return `a ${name}`;
        }
    },

    GetCookTime: function(place, gameSpeed) {
        let details = { time: 10, range: 2 };
        if(place.type === "pot") {
            const itemCount = place.contents.length;
            details.time = itemCount * itemCount + itemCount + 10; // 12, 16, 22, 30
            details.range = Math.round(itemCount * 1.5);           //  2,  3,  5,  6
        }
        details.time = Math.round(details.time * (1 + gameSpeed) / 2);
        details.range = Math.round(details.range * gameSpeed);
        return details;
    },
    GetCookingModifier: function(place) {
        const cookedTime = place.cookingTime;
        const rd = place.cookRangeDetails;
        let potentialModifier = 1.25, rangeIncrease = 1;
        for(let i = 0; i < 4; i++) {
            const min = Math.ceil(rd.time - rd.range * rangeIncrease), max = Math.floor(rd.time + rd.range * rangeIncrease); 
            if(min <= cookedTime && cookedTime <= max) { return potentialModifier; }
            rangeIncrease += 0.5;
            potentialModifier -= 0.25;
        }
        return 0.25;
    },

    AddAttribute: function(food, attr) { // sliced, plated, fried, baked
        if(food.attributes.indexOf(attr) >= 0) { return food; }
        food.attributes.push(attr);
        return self.TransformFood(food);
    },
    TransformFood: function(food) {
        if(food.type === "pot") { return self.BoiledFoods(food); }
        if(food.type === "bowl") { return self.MixedFoods(food); }
        if(food.type === "oven") { return self.BakedFoods(food); }
        if(food.type === "dough") {
            if(food.attributes.length === 1 && food.HasAttribute(food, "sliced")) {
                return { type: "pastadough", modifier: food.modifier, attributes: [] };
            }
        }
        if(food.type === "potato") {
            if(food.attributes.length === 2 && self.HasAttribute(food, "fried") && self.HasAttribute(food, "sliced")) {
                return { type: "frenchfries", class: "sides", modifier: food.modifier, attributes: [] };
            }
        }
        return food;
    },
    BakedFoods: function(oven) {
        const ingredience = oven.contents;
        if(oven.modifier <= 0.25 && oven.cookingTime > oven.cookRangeDetails.max) {
            return { type: "burntmess", class: "garbage", modifier: 0.5 * newModifier, attributes: [] };
        }
        const newModifier = oven.modifier * self.AvgModifier(ingredience);
        const sorted = self.GetSortedFoodStruct(ingredience);
        if(sorted["potato"] === 1 & sorted["total"] === 1) {
            return { type: "potato", modifier: newModifier, attributes: ["baked"] };
        }
        return { type: "weirdbake", class: "baked", modifier: newModifier, attributes: [] };
    },
    MixedFoods: function(bowl) {
        const ingredience = bowl.contents;
        const newModifier = self.AvgModifier(ingredience);
        const sorted = self.GetSortedFoodStruct(ingredience);
        const badSalad = { type: "pileoffood", class: "garbage", modifier: 0.5 * newModifier, attributes: [] };
        if(sorted["cheese"] === 2 && sorted["total"] === 2) {
            return { type: "potionfire", class: "other", modifier: newModifier, attributes: [] };
        }
        if(sorted["lettuce"] >= 1) {
            if(sorted["tomato"] === sorted["tomato_sliced"] && sorted["tomato_sliced"] >= 1) {
                return { type: "tomatosalad", class: "salad", modifier: newModifier, attributes: [] };
            } else if(sorted["tomato"] >= 1) {
                return badSalad;
            }
            return { type: "salad", class: "salad", modifier: newModifier, attributes: [] };
        }
        return badSalad;
    },
    BoiledFoods: function(pot) {
        const ingredience = pot.contents;
        const newModifier = pot.modifier * self.AvgModifier(ingredience);
        if(newModifier < 0.25) {
            return { type: "badsoup", class: "garbage", modifier: 0.5 * newModifier, attributes: [] };
        }
        const sorted = self.GetSortedFoodStruct(ingredience);
        if(sorted["pastadough"] >= 1) {
            if(sorted["tomato"] >= 1 && sorted["meat"] >= 1) {
                return { type: "spaghetti", class: "pasta", modifier: newModifier, attributes: [] };
            }
            if(sorted["cheese"] >= 1) {
                if(sorted["cheese"] === 3) {
                    return { type: "macaroni", class: "pasta", modifier: newModifier, attributes: [] };
                } else {
                    return { type: "fettucini", class: "pasta", modifier: newModifier, attributes: [] };
                }
            }
            return { type: "angelhair", class: "pasta", modifier: newModifier, attributes: [] };
        }
        if(sorted["tomato"] >= 2) {
            if(sorted["pepper"] >= 1) {
                return { type: "spicytomatosoup", class: "soup", modifier: newModifier, attributes: [] };
            }
            return { type: "tomatosoup", class: "soup", modifier: newModifier, attributes: [] };
        }
        return { type: "weirdsoup", class: "soup", modifier: 0.5 * newModifier, attributes: [] };
    },
    GetSortedFoodStruct: function(ingredience) {
        const sorted = { total: 0 };
        for(let i = 0; i < ingredience.length; i++) {
            const ing = ingredience[i];
            const baseIngredient = ing.type;
            if(sorted[baseIngredient] === undefined) { sorted[baseIngredient] = 0; }
            sorted[baseIngredient] += 1;
            sorted["total"] += 1;
            ing.attributes.sort();
            let fullIng = baseIngredient;
            for(let j = 0; j < ing.attributes.length; j++) {
                const attr = ing.attributes[j];
                fullIng += `_${attr}`;
                const attrIng = `${baseIngredient}_${attr}`;
                if(sorted[attrIng] === undefined) { sorted[attrIng] = 0; }
                sorted[attrIng] += 1;
            }
            if(ing.attributes.length >= 2) {
                if(sorted[fullIng] === undefined) { sorted[fullIng] = 0; }
                sorted[fullIng] += 1;
            }
        }
        return sorted;
    },
    AvgModifier: ingredience => ingredience.reduce((sum, curFood) => sum + curFood.modifier + 0.1, 0) / ingredience.length
};