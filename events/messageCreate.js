const CATCH_CHANNEL_ID = '1293555235478048768';
const CAT_BOT_ID = '966695034340663367';

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {


        if (message.author.id !== CAT_BOT_ID || message.channel.id !== CATCH_CHANNEL_ID) {
            return;
        }

        const content = message.content.toLowerCase();
        const isCatchMessage = content.includes('cought') || content.includes('c0ught') || content.includes('caught') || content.includes('cowought');

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
                // --- Time-based bonus logic (GMT+8) ---
                const gmt8Date = new Date(Date.now() + 8 * 60 * 60 * 1000);
                const gmt8Day = gmt8Date.getUTCDay(); // 0=Sun, 6=Sat
                const gmt8Hour = gmt8Date.getUTCHours();

                // --- Determine Reward Chance ---
                let rewardChance = 0.35; // Base 35% chance.
                const isWeekend = gmt8Day % 6 === 0; // Use modulo to check for Sat (6) or Sun (0).
                let chanceMessage;

                if (isWeekend) {
                    rewardChance *= 2; // Double the chance on weekends.
                    chanceMessage = `It's the weekend! Your chance for a reward is increased to ${rewardChance * 100}%!`;
                } else {
                    chanceMessage = `There is a ${rewardChance * 100}% chance to get a reward from catching a cat.`;
                }

                if (Math.random() <= rewardChance) {
                    let reward = determineReward();
                    let wasDoubled = false;

                    // --- 50/50 chance to double XP on even hours ---
                    const isEvenHour = gmt8Hour % 2 === 0;
                    if (isEvenHour && Math.random() < 0.5) {
                        reward.xp *= 2;
                        wasDoubled = true;
                    }

                    const success = await grantApiXp(previousMessage.author.id, previousMessage.guildId, reward.xp);
                    const catImageUrl = await getCatImageUrl();

                    if (success) {
                        // Build the reward message, including the "doubled" status if applicable.
                        let rewardLine = `You received ${reward.name} Crate** containing \`${reward.xp} XP\`!`;
                        if (wasDoubled) {
                            rewardLine += ' **(DOUBLED!)**';
                        }

                        await message.channel.send({

                            flags: 32768,
                            components: [
                                {
                                    type: 17,
                                    accent_color: Math.floor(Math.random() * 16777216),
                                    components: [
                                        {
                                            type: 9,
                                            components: [
                                                {
                                                    type: 10,
                                                    content: `# Lucky you!\n_You caught a cat and got rewarded for it._ _ _`
                                                },
                                                {
                                                    type: 10,
                                                    content: rewardLine
                                                }
                                            ],
                                            accessory: {
                                                type: 11,
                                                media: {
                                                    url: catImageUrl
                                                }
                                            }
                                        },
                                        {
                                            type: 14,
                                            divider: true,
                                            spacing: 1
                                        },
                                        {
                                            type: 10,
                                            content: `-# ${chanceMessage}`
                                        }
                                    ]
                                }
                            ],
                            reply: {
                                messageReference: previousMessage.id,
                                failIfNotExists: false
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
 */
function determineReward() {
    const tiers = [
        { name: 'a **Common', minXp: 10, maxXp: 30, chance: 0.45 },
        { name: 'an **Uncommon', minXp: 31, maxXp: 60, chance: 0.25 },
        { name: 'a **Superior', minXp: 61, maxXp: 100, chance: 0.15 },
        { name: 'a **Rare', minXp: 101, maxXp: 200, chance: 0.08 },
        { name: 'an **Epic', minXp: 201, maxXp: 500, chance: 0.02 },
        { name: 'a **Legendary', minXp: 1000, maxXp: 1000, chance: 0.05 }
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
    return { name: 'a Common', xp: getRandomInt(10, 30) };
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
    const apiKey = process.env.KIAI_KEY;

    if (!apiKey) {
        console.error('Kiai API Error: KIAI_KEY is not set in the .env file.');
        return false;
    }

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${apiKey.trim()}`
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

/**
 * Fetches a random cat image URL from TheCatAPI.
 * @returns {Promise<string>} The URL of a cat image.
 */
async function getCatImageUrl() {
    const url = 'https://api.thecatapi.com/v1/images/search';
    const apiKey = process.env.CAT_API;
    // A static, reliable fallback image from the same API service.
    const fallbackUrl = 'https://cdn2.thecatapi.com/images/a05.jpg';

    if (!apiKey) {
        console.warn('[Cat API] CAT_API key is not set in the .env file. Using fallback image.');
        return fallbackUrl;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            console.error(`[Cat API] Error fetching image: ${response.status} ${response.statusText}`);
            return fallbackUrl;
        }

        const data = await response.json();
        // Ensure the response is valid and contains a URL before returning it.
        return (data && data.length > 0 && data[0].url) ? data[0].url : fallbackUrl;
    } catch (error) {
        console.error('[Cat API] Failed to make request:', error);
        return fallbackUrl;
    }
}