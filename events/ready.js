module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`✅ [${client.label}] Ready! Logged in as ${client.user.tag}`);
	}
};