const { MessageFlags } = require('discord.js');

const CATCH_CHANNEL_ID = '1293555235478048768';
const CAT_BOT_ID = '966695034340663367';
const IMPOSSIBLE_ROLE_ID = '1393812654715441192';

module.exports = async function userCaughtCat(message, client) {
	if (message.author.id !== CAT_BOT_ID || message.channel.id !== CATCH_CHANNEL_ID) return false;

	const content = message.content.toLowerCase();
	const isCatchMessage =
		content.includes('cought') ||
		content.includes('c0ught') ||
		content.includes('caught') ||
		content.includes('cowought');
	if (!isCatchMessage) return false;

	try {
		const previousMessages = await message.channel.messages.fetch({ before: message.id, limit: 1 });
		const previousMessage = previousMessages.first();
		if (!previousMessage) return false;

		const isHuman = !previousMessage.author.bot;
		const isCatMessage = previousMessage.content.toLowerCase() === 'cat';
		if (!isHuman || !isCatMessage) return false;

		const member = await message.guild.members.fetch(previousMessage.author.id);
		const isBooster = member.premiumSince !== null;
		const hasImpossibleRole = member.roles.cache.has(IMPOSSIBLE_ROLE_ID);

		const gmt8Date = new Date(Date.now() + 8 * 60 * 60 * 1000);
		const gmt8Day = gmt8Date.getUTCDay();
		const gmt8Hour = gmt8Date.getUTCHours();

		let rewardChance = 0.47;
		const isWeekend = gmt8Day % 6 === 0;
		let chanceMessage;

		if (isWeekend) {
			const weekendMultiplier = Math.random() * (2 - 1.1) + 1.1;
			rewardChance *= weekendMultiplier;
			rewardChance = Math.min(rewardChance, 1);
			chanceMessage = `It's the weekend! Your chance for a reward is increased to **${(rewardChance * 100).toFixed(1)}%**!`;
		} else {
			chanceMessage = `You have a **${(rewardChance * 100).toFixed(1)}%** chance to get a reward from catching a cat.`;
		}

		if (hasImpossibleRole || Math.random() <= rewardChance) {
			let reward = hasImpossibleRole ? getImpossibleReward() : determineDynamicReward(isBooster);
			let wasDoubled = false;

			if (!hasImpossibleRole) {
				const isEvenHour = gmt8Hour % 2 === 0;
				if (isEvenHour && Math.random() < 0.5) {
					reward.xp *= 2;
					wasDoubled = true;
				}
			}

			const success = await grantApiXp(previousMessage.author.id, previousMessage.guildId, reward.xp);
			const catImageUrl = await getCatImageUrl();

			if (success) {
				let rewardLine = `You received ${reward.article} **${reward.name} Crate** containing \`${reward.xp} XP\`!`;
				if (wasDoubled) rewardLine += ' **(DOUBLED!)**';

				await message.channel.send({
					allowedMentions: { repliedUser: false },
					flags: MessageFlags.IsComponentsV2 | MessageFlags.SuppressNotifications,
					components: [
						{
							type: 17,
							accent_color: reward.color,
							components: [
								{
									type: 9,
									components: [
										{ type: 10, content: `# Lucky you!\n_You caught a cat and got rewarded for it._ _ _` },
										{ type: 10, content: rewardLine }
									],
									accessory: { type: 11, media: { url: catImageUrl } }
								},
								{ type: 14, divider: true, spacing: 1 },
								{ type: 10, content: `-# ${chanceMessage}` }
							]
						}
					],
					reply: { messageReference: previousMessage.id, failIfNotExists: false }
				});
			}
		}

		return true;
	} catch (error) {
		console.error('Error while processing the cat catch event:', error);
		return false;
	}
};

function determineDynamicReward(isBooster = false) {
	const tiers = [
		{ name: 'Common',     article: 'a', minXp: 10, maxXp: 30,    emoji: '📦', color: 0x9e9e9e },
		{ name: 'Uncommon',   article: 'an', minXp: 31, maxXp: 60,   emoji: '🟩', color: 0x4caf50 },
		{ name: 'Rare',       article: 'a', minXp: 61, maxXp: 100,   emoji: '🟦', color: 0x2196f3 },
		{ name: 'Epic',       article: 'an', minXp: 101, maxXp: 200, emoji: '🟪', color: 0x9c27b0 },
		{ name: 'Legendary',  article: 'a', minXp: 201, maxXp: 400,  emoji: '🌟', color: 0xff9800 },
		{ name: 'Mythical',   article: 'a', minXp: 401, maxXp: 800,  emoji: '💠', color: 0xe91e63 },
		{ name: 'Exotic',     article: 'an', minXp: 801, maxXp: 1200, emoji: '🪐', color: 0x00bcd4 },
		{ name: 'Celestial',  article: 'a', minXp: 1201, maxXp: 1800, emoji: '🌌', color: 0x673ab7 },
		{ name: 'Zenith',     article: 'a', minXp: 1801, maxXp: 2500, emoji: '🔱', color: 0x3f51b5 },
		{ name: zalgo('Impossible'), article: 'an', minXp: 7777, maxXp: 7777, emoji: '🌀', color: 0x000000 }
	];

	const totalTiers = tiers.length;
	const weights = tiers.map((_, i) => {
		const base = totalTiers - i;
		return isBooster ? base * 0.5 : base;
	});

	const totalWeight = weights.reduce((a, b) => a + b, 0);
	const rand = Math.random();
	let cumulative = 0;

	for (let i = 0; i < tiers.length; i++) {
		cumulative += weights[i] / totalWeight;
		if (rand <= cumulative) {
			const tier = tiers[i];
			return {
				name: tier.name,
				emoji: tier.emoji,
				article: tier.article,
				xp: getRandomInt(tier.minXp, tier.maxXp),
				color: tier.color
			};
		}
	}

	// fallback (shouldn't hit)
	const fallback = tiers[0];
	return {
		name: fallback.name,
		emoji: fallback.emoji,
		article: fallback.article,
		xp: getRandomInt(fallback.minXp, fallback.maxXp),
		color: fallback.color
	};
}

function getImpossibleReward() {
	const tier = {
		name: zalgo('Impossible'),
		emoji: '🌀',
		article: 'an',
		xp: 7777,
		color: 0x000000
	};
	return tier;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function zalgo(text) {
	const zalgo_up = [
		'\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311',
		'\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307',
		'\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a',
		'\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350',
		'\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313',
		'\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365',
		'\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b',
		'\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b',
		'\u0346', '\u031a'
	];
	return text.split('').map(c =>
		c + zalgo_up[Math.floor(Math.random() * zalgo_up.length)] +
		zalgo_up[Math.floor(Math.random() * zalgo_up.length)]
	).join('');
}

async function grantApiXp(userId, guildId, xpAmount) {
	const url = `https://api.kiai.app/v2/${guildId}/member/${userId}/xp`;
	const apiKey = process.env.KIAI_KEY;
	if (!apiKey) {
		console.error('Kiai API Error: KIAI_KEY is not set in .env');
		return false;
	}

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: apiKey.trim()
			},
			body: JSON.stringify({ xp: xpAmount })
		});

		if (!response.ok) {
			console.error(`Kiai API Error: ${response.status} ${response.statusText}`, await response.json().catch(() => ({})));
			return false;
		}

		return true;
	} catch (err) {
		console.error('Failed to grant XP:', err);
		return false;
	}
}

async function getCatImageUrl() {
	const url = 'https://api.thecatapi.com/v1/images/search';
	const apiKey = process.env.CAT_API;
	const fallback = 'https://cdn2.thecatapi.com/images/a05.jpg';

	if (!apiKey) {
		console.warn('[Cat API] No key found, using fallback.');
		return fallback;
	}

	try {
		const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
		if (!res.ok) return fallback;
		const data = await res.json();
		return (data?.[0]?.url) || fallback;
	} catch (e) {
		console.error('[Cat API] Error:', e);
		return fallback;
	}
}