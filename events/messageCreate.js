const CATCH_CHANNEL_ID = '1293555235478048768';
const CAT_BOT_ID = '966695034340663367';

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {


        if (message.author.id !== CAT_BOT_ID || message.channel.id !== CATCH_CHANNEL_ID) {
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
                console.log('--- Cat Bot Catch Event Triggered ---'); // This log confirms the initial trigger
                console.log(`User: ${previousMessage.author.tag} (ID: ${previousMessage.author.id})`);
                console.log(`Caught with message: "${previousMessage.content}" (ID: ${previousMessage.id})`);

                
                const chance = 0.35;

                if (Math.random() <= chance) {
                    const reward = determineReward();
                    const success = await grantApiXp(previousMessage.author.id, previousMessage.guildId, reward.xp);

                    if (success) {
                        const replyMessage = `Congratulations <@${previousMessage.author.id}>! You were rewarded with **${reward.xp} XP** for your catch! (Rarity: ${reward.name})`;
                        await message.channel.send({
                            content: replyMessage,
                            reply: {
                                messageReference: previousMessage.id,
                                failIfNotExists: false // Don't error if the original message was deleted
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error while processing the cat catch event:', error);
        }
    }
};

/**
 * Determines the XP reward based on predefined tiers and probabilities.
 * As requested, I've used improved category names: Common, Uncommon, Rare, and Legendary.
 */
function determineReward() {
    const tiers = [
        { name: 'Common', minXp: 1, maxXp: 10, chance: 0.70 },
        { name: 'Uncommon', minXp: 11, maxXp: 20, chance: 0.20 },
        { name: 'Rare', minXp: 21, maxXp: 50, chance: 0.09 },
        { name: 'Legendary', minXp: 150, maxXp: 350, chance: 0.01 }
    ];

    const random = Math.random();
    let cumulativeChance = 0;

    for (const tier of tiers) {
        cumulativeChance += tier.chance;
        if (random <= cumulativeChance) {
            return {
                name: tier.name,
                xp: getRandomInt(tier.minXp, tier.maxXp)
            };
        }
    }

    // Fallback to common tier just in case of floating point inaccuracies
    return { name: 'Common', xp: getRandomInt(1, 10) };
}

/**
 * Grants XP to a user via the Kiai API.
 * @param {string} userId The user's Discord ID.
 * @param {string} guildId The guild's Discord ID.
 * @param {number} xpAmount The amount of XP to grant.
 * @returns {Promise<boolean>} True if the API call was successful, false otherwise.
 */
async function grantApiXp(userId, guildId, xpAmount) {
    const url = `https://api.kiai.app/v2/${guildId}/member/${userId}/xp`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.KIAI_KEY}`
            },
            body: JSON.stringify({ xp: xpAmount })
        });

        if (!response.ok) {
            console.error(`Kiai API Error: ${response.status} ${response.statusText}`, await response.json().catch(() => ({})));
            return false;
        }
        console.log(`Successfully granted ${xpAmount} XP to user ${userId} in guild ${guildId}.`);
        return true;
    } catch (error) {
        console.error('Failed to make request to Kiai API:', error);
        return false;
    }
}

/**
 * Generates a random integer between min and max (inclusive).
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}