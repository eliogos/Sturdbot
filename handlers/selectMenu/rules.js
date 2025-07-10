const ruleDetails = require('../../assets/rulesDetails.js');

module.exports = async (interaction, customId, values) => {
    let section = customId.replace("rules_", "");
    let details = ruleDetails[section];
    let response = "";

    if (details) {
        response = values.map(val => details[val] || "No info for this rule.").join("\n\n");
    } else {
        response = "No rule selected or no info available.";
    }

    return interaction.reply({ content: `${response}\n-# This is currently an AI-generated placeholder. This will be replaced soon with details.`, ephemeral: true });
};