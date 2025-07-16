const userCaughtCat = require('./flows/userCaughtCat');
const deleteCatForcespawnCommand = require('./flows/deleteCatForcespawnCommand');

module.exports = {
	name: 'messageCreate',
	targets: ['bot_1'],
	async execute(message, client) {
		if (await deleteCatForcespawnCommand(message)) return;
		if (await userCaughtCat(message, client)) return;
	}
};
