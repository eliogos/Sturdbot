const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong and response time!'),

	targets: ['bot_1', 'bot_2'],

	async execute(interaction, client) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		const diff = sent.createdTimestamp - interaction.createdTimestamp;
		await interaction.editReply(`Pong! 🏓 ${diff}ms`);
	}
};