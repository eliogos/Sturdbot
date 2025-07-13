const CATCH_CHANNEL_ID = '1293555235478048768';
const CAT_BOT_ID = '966695034340663367';

module.exports = {
    name: 'messageCreate',
    targets: ['bot_1'],
    async execute(message, client) {
        if (message.author.id !== CAT_BOT_ID || message.channel.id !== CATCH_CHANNEL_ID) return;

        const content = message.content.toLowerCase();
        const isCatchMessage = content.includes('cought') || content.includes('c0ught') || content.includes('caught') || content.includes('cowought');
        if (!isCatchMessage) return;

        try {
            const previousMessages = await message.channel.messages.fetch({ before: message.id, limit: 1 });
            const previousMessage = previousMessages.first();
            if (!previousMessage) return;

            const isHuman = !previousMessage.author.bot;
            const isCatMessage = previousMessage.content.toLowerCase() === 'cat';
            if (isHuman && isCatMessage) {
                const gmt8Date = new Date(Date.now() + 8 * 60 * 60 * 1000);
                const gmt8Day = gmt8Date.getUTCDay();
                const gmt8Hour = gmt8Date.getUTCHours();

                let rewardChance = 0.35;
                const isWeekend = gmt8Day % 6 === 0;
                let chanceMessage;

                if (isWeekend) {
                    rewardChance *= 2;
                    chanceMessage = `It's the weekend! Your chance for a reward is increased to ${rewardChance * 100}%!`;
                } else {
                    chanceMessage = `There is a ${rewardChance * 100}% chance to get a reward from catching a cat.`;
                }

                if (Math.random() <= rewardChance) {
                    const member = await message.guild.members.fetch(previousMessage.author.id);
                    const isBooster = member.premiumSince !== null;

                    const reward = determineDynamicReward(isBooster);
                    let wasDoubled = false;

                    const isEvenHour = gmt8Hour % 2 === 0;
                    if (isEvenHour && Math.random() < 0.5) {
                        reward.xp *= 2;
                        wasDoubled = true;
                    }

                    const success = await grantApiXp(previousMessage.author.id, previousMessage.guildId, reward.xp);
                    const catImageUrl = await getCatImageUrl();

                    if (success) {
                        let rewardLine = `You received ${reward.name} Crate** containing \`${reward.xp} XP\`!`;
                        if (wasDoubled) rewardLine += ' **(DOUBLED!)**';

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
                                                media: { url: catImageUrl }
                                            }
                                        },
                                        { type: 14, divider: true, spacing: 1 },
                                        { type: 10, content: `-# ${chanceMessage}` }
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

function determineDynamicReward(isBooster = false) {
    const tiers = [
        { name: 'Common',     minXp: 10,   maxXp: 30 },
        { name: 'Uncommon',   minXp: 31,   maxXp: 60 },
        { name: 'Superior',   minXp: 61,   maxXp: 100 },
        { name: 'Rare',       minXp: 101,  maxXp: 200 },
        { name: 'Epic',       minXp: 201,  maxXp: 500 },
        { name: 'Legendary',  minXp: 1000, maxXp: 1000 },
        { name: 'Mythic',     minXp: 2000, maxXp: 2500 }
    ];

    const totalTiers = tiers.length;

    const weights = tiers.map((_, i) => {
        const baseWeight = totalTiers - i;
        return isBooster ? baseWeight * 0.5 : baseWeight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < tiers.length; i++) {
        cumulative += weights[i] / totalWeight;
        if (random <= cumulative) {
            const tier = tiers[i];
            return {
                name: `${getPrefix(tier.name)} **${tier.name}`,
                xp: getRandomInt(tier.minXp, tier.maxXp)
            };
        }
    }

    // Fallback
    const fallback = tiers[0];
    return {
        name: `${getPrefix(fallback.name)} **${fallback.name}`,
        xp: getRandomInt(fallback.minXp, fallback.maxXp)
    };
}

function getPrefix(word) {
    if (!word || typeof word !== "string") return "a";
    const firstChar = word.trim().charAt(0).toLowerCase();
    return ["a", "e", "i", "o", "u"].includes(firstChar) ? "an" : "a";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

async function getCatImageUrl() {
    const url = 'https://api.thecatapi.com/v1/images/search';
    const apiKey = process.env.CAT_API;
    const fallbackUrl = 'https://cdn2.thecatapi.com/images/a05.jpg';

    if (!apiKey) {
        console.warn('[Cat API] CAT_API key is not set in the .env file. Using fallback image.');
        return fallbackUrl;
    }

    try {
        const response = await fetch(url, {
            headers: { 'x-api-key': apiKey }
        });

        if (!response.ok) {
            console.error(`[Cat API] Error fetching image: ${response.status} ${response.statusText}`);
            return fallbackUrl;
        }

        const data = await response.json();
        return (data && data.length > 0 && data[0].url) ? data[0].url : fallbackUrl;
    } catch (error) {
        console.error('[Cat API] Failed to make request:', error);
        return fallbackUrl;
    }
}