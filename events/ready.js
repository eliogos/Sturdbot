const { REST, Routes } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Register commands
		const appCommandsArray = [];
		client.applicationCommands.forEach(cmd => {
			if (cmd.data) appCommandsArray.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
		});

		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		try {
			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: appCommandsArray }
			);
			console.log('Application commands registered.');
		} catch (error) {
			console.error('Error registering application commands:', error);
		}
	}
};