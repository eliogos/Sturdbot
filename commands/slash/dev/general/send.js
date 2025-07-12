const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a message from a messageCreator file to a channel')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('The messageCreator filename (without .js)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the message to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),

        targets: ['bot_1'],

    async execute(interaction) {
        const filename = interaction.options.getString('filename');
        const channel = interaction.options.getChannel('channel');
        const filePath = path.join(__dirname, '../../../../', 'messageCreator', `${filename}.js`);

        // Log the file path reference
        console.log(`[SEND COMMAND] Attempting to load: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: `File \`${filename}.js\` not found in messageCreator.`, ephemeral: true });
        }

        let messageData;
        try {
            delete require.cache[require.resolve(filePath)];
            messageData = require(filePath)();
        } catch (err) {
            return interaction.reply({ content: `Error loading file: ${err.message}`, ephemeral: true });
        }

        try {
            await channel.send(messageData);
            await interaction.reply({ content: `Message sent to ${channel}!`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: `Failed to send message: ${err.message}`, ephemeral: true });
        }
    }
};