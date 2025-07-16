const userCaughtCat = require('../src/flows/userCaughtCat');
const deleteCatForcespawnCommand = require('../src/flows/deleteCatForcespawnCommand');
const wordlePoints = require('../src/flows/wordlePoints');

module.exports = {
	name: 'messageCreate',
	targets: ['bot_1'],
	async execute(message, client) {
		if (await deleteCatForcespawnCommand(message)) return;
		if (await userCaughtCat(message, client)) return;
		if (await wordlePoints(message, client)) return;
	}
};
