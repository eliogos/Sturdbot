module.exports = async function deleteCatForcespawnCommand(message) {
	if (
		message.interaction?.commandName === 'forcespawn' &&
		message.author?.bot
	) {
		try {
			console.log(`Deleting message triggered by /forcespawn`);
			await message.delete();
			console.log(`Deleted message for /forcespawn`);
		} catch (err) {
			console.error('Failed to delete command-triggered message:', err);
		}
		return true;
	}
	return false;
};
