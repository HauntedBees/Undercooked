const recipeDisplayNames = {
    "frenchfries": "french fries",
    "tomatosoup": "tomato soup",
    "spicytomatosoup": "spicy tomato soup",
    "badsoup": "bad soup"
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

    AorAN: function(s) { 
        if("aeiou".indexOf(s[0]) >= 0) { return `an ${s}`; }
        return `a ${s}`;
    },
    FormatPlaceName: function(placeName, noAorAn) {
        //if(recipeDisplayNames[placeName] !== undefined) { placeName = recipeDisplayNames[placeName]; } // TODO: not needed?? why was this here
        if(placeName === "cuttingboard") { placeName = "cutting board"; }
        else if(placeName === "pan") { placeName = "frying pan"; }
        if(noAorAn) { return placeName; }

        if("aeiou".indexOf(placeName[0]) >= 0) { return `an ${placeName}`; }
        return `a ${placeName}`;
    },

    GetFoodDisplayNameFromAction: (action, ignorePlated) => self.GetFoodDisplayNameFromObj({ type: action.object, attributes: (action.objAttrs || []) }, ignorePlated || false),
    GetFoodDisplayNameFromObj: function(food, ignorePlated) {
        let name = food.type;
        for(let i = 0; i < food.attributes.length; i++) {
            switch(food.attributes[i]) {
                case "sliced": name = `chopped ${name}`; break;
                case "plated": if(!ignorePlated) { name = `plated ${name}` }; break;
                case "fried": name = `fried ${name}`; break;
            }
        }
        if("aeiou".indexOf(name[0]) >= 0) {
            return `an ${name}`;
        } else {
            return `a ${name}`;
        }
    },

    AddAttribute: function(food, attr) {
        if(food.attributes.indexOf(attr) >= 0) { return food; }
        food.attributes.push(attr);
        return self.TransformFood(food);
    },
    TransformFood: function(food) {
        if(food.type === "pot") { return self.BoiledFoods(food); }

        if(food.type === "potato" && food.attributes.length === 2) {
            if(self.HasAttribute(food, "fried") && self.HasAttribute(food, "sliced")) {
                return { type: "frenchfries", class: "sides", modifier: food.modifier, attributes: [] };
            }
        }
        return food;
    },
    BoiledFoods: function(pot) {
        const ingredience = pot.contents;
        const newModifier = pot.modifier * self.AvgModifier(ingredience);
        const sorted = {};
        for(let i = 0; i < ingredience.length; i++) {
            const ing = ingredience[i];
            const baseIngredient = ing.type; // TODO: account for attributes
            if(sorted[baseIngredient] === undefined) { sorted[baseIngredient] = 0; }
            sorted[baseIngredient] += 1;
        }
        if(sorted["tomato"] >= 2) {
            if(sorted["pepper"] >= 1) {
                return { type: "spicytomatosoup", class: "soup", modifier: newModifier, attributes: [] };
            }
            return { type: "tomatosoup", class: "soup", modifier: newModifier, attributes: [] };
        }
        return { type: "badsoup", class: "soup", modifier: 0.5 * newModifier, attributes: [] };
    },
    AvgModifier: ingredience => ingredience.reduce((sum, curFood) => sum + curFood.modifier, 0) / food.length
};