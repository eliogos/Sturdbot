const DELETE_COMMAND_ID = '1345374182401114268';

module.exports = async function deleteCatForcespawnCommand(message) {
	if (
		!message.author.bot &&
		message.interaction &&
		message.interaction.commandId === DELETE_COMMAND_ID
	) {
		try {
			await message.delete();
			console.log(`Deleted message from ${message.author.tag} for command ID ${DELETE_COMMAND_ID}`);
		} catch (err) {
			console.error('Failed to delete command-triggered message:', err);
		}
		return true;
	}
	return false;
};
