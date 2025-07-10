module.exports = {
    data: {
        name: 'Ping User',
        type: 2, // 2 = USER context menu
    },
    async execute(interaction) {
        await interaction.reply(`You selected user: ${interaction.targetUser.tag}`);
    },
};