module.exports = {
    data: {
        name: 'Ping Message',
        type: 3, // 3 = MESSAGE context menu
    },
    async execute(interaction) {
        await interaction.reply(`You selected message: "${interaction.targetMessage.content}"`);
    },
};