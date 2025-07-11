const CATCH_CHANNEL_ID = '1293555235478048768';
const CATBOT_ID = '966695034340663367';

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Perform initial, low-cost checks first to exit early for irrelevant messages.
        if (message.author.id !== CATBOT_ID || message.channel.id !== CATCH_CHANNEL_ID) {
            return;
        }

        const content = message.content.toLowerCase();
        const isCatchMessage = content.includes('cought') || content.includes('c0ught');

        if (!isCatchMessage) {
            return;
        }

        try {
            // Fetch the single message sent immediately before the bot's "catch" message.
            const previousMessages = await message.channel.messages.fetch({ before: message.id, limit: 1 });
            const previousMessage = previousMessages.first();

            // If there's no previous message, stop.
            if (!previousMessage) {
                return;
            }

            // Check if the previous message was from a human and was exactly "cat".
            const isHuman = !previousMessage.author.bot;
            const isCatMessage = previousMessage.content.toLowerCase() === 'cat';

            if (isHuman && isCatMessage) {
                console.log('--- Cat Bot Catch Event Triggered ---');
                console.log(`User: ${previousMessage.author.tag} (ID: ${previousMessage.author.id})`);
                console.log(`Caught with message: "${previousMessage.content}" (ID: ${previousMessage.id})`);
                console.log('Data', { author: previousMessage.author, message: previousMessage });
            }
        } catch (error) {
            console.error('Error while processing the fish catch event:', error);
        }
    }
};