const self = module.exports = {
    ServedRecipeName: s => self.AorAN(self.FormatIngredientName(s.replace("_plated", ""))),
    AorANFormattedIngredientName: s => self.AorAN(self.FormatIngredientName(s)),
    AorANFormattedPlaceName: s => self.AorAN(self.FormatPlaceName(s)),
    AorAN: function(s) {
        if(["a", "e", "i", "o", "u"].indexOf(s[0]) >= 0) { return `n ${s}`; }
        return ` ${s}`;
    },
    FormatPlaceName: function(s) {
        if(s === "cuttingboard") { return "cutting board"; }
        if(s === "pan") { return "frying pan"; }
        return s;
    },
    FormatIngredientName: function(s) {
        if(s.indexOf("_") < 0) { return s; }
        const split = s.split("_");
        let food = split[0];
        for(let i = 1; i < split.length; i++) {
            switch(split[i]) {
                case "sliced": food = `chopped ${food}`; break;
                case "plated": food = `plated ${food}`; break;
                case "fried": food = `fried ${food}`; break;
            }
        }
        return food;
    },
    TransformFood: function(s) {
        if(s === "potato_sliced_fried") { return "french fries"; }
        return s;
    }
};