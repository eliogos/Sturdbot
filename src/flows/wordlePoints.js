const WORDLE_USER_ID = '1211781489931452447';
const { MessageFlags } = require('discord.js');

const POINTS_PER_LINE = {
  '1': 10000,
  '2': 8000,
  '3': 6000,
  '4': 4000,
  '5': 2500,
  '6': 1250,
  'X': -1000
};

module.exports = async function wordlePoints(message, client) {
  if (message.author.id !== WORDLE_USER_ID || !message.guild) return false;

  await message.guild.members.fetch();
  const lines = message.content.split('\n');

  const rewardGroups = {}; // { line: [userId] }
  const penaltyUsers = [];

  for (const line of lines) {
    const match = line.match(/^\D*([X1-6])\/6:\s(.+)$/);
    if (!match) continue;

    const score = match[1];
    const points = POINTS_PER_LINE[score];
    const userIds = await extractUserIdsFromLine(line, message.guild);

    if (score === 'X') {
      for (const userId of userIds) {
        const success = await grantApiXp(userId, message.guild.id, points);
        if (success) {
          const user = await client.users.fetch(userId).catch(() => null);
          if (user) penaltyUsers.push({ userId, tag: user.tag, xp: Math.abs(points) });
        }
      }
    } else {
      if (userIds.length === 0 || points === 0) continue;

      const totalPoints = points;
      const basePoints = Math.floor(totalPoints / userIds.length / 10) * 10;

      for (const userId of userIds) {
        const granted = await grantApiXp(userId, message.guild.id, basePoints);
        if (!granted) continue;

        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) continue;

        if (!rewardGroups[score]) rewardGroups[score] = [];
        rewardGroups[score].push({ userId, tag: user.tag, xp: basePoints });
      }
    }
  }

  const rewardScores = Object.keys(rewardGroups).sort((a, b) => a.localeCompare(b));
  const rewardSections = [];

  if (rewardScores.length > 0) {
    let first = true;
    for (const score of rewardScores) {
      const label = first ? `\ud83d\udc51 **TOP SCORERS (${score}/6)**` : `**${score}/6**`;
      first = false;
      const list = rewardGroups[score].map(u => `• <@${u.userId}> gained ${u.xp} XP`).join('\n');
      rewardSections.push(`${label}\n${list}`);
    }
  }

  const components = [];
  if (rewardSections.length > 0) {
    components.push({
      type: 17,
      accent_color: 0x2ecc71,
      spoiler: false,
      components: [
        { type: 10, content: '# Wordle Points' },
        { type: 10, content: 'These users gained points from answering yesterday\'s Wordle.' },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: rewardSections.join('\n\n') }
      ]
    });
  }

  if (penaltyUsers.length > 0) {
    const penaltyList = penaltyUsers
      .map(p => `• <@${p.userId}> lost ${p.xp} XP`)
      .join('\n');
    components.push({
      type: 17,
      accent_color: 0xe74c3c,
      spoiler: false,
      components: [
        { type: 10, content: 'These members were not successful from answering the Wordle:' },
        { type: 10, content: penaltyList }
      ]
    });
  }

  if (components.length > 0) {
    await message.reply({
      components,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [] }
    });
  }

  return components.length > 0;
};

async function extractUserIdsFromLine(line, guild) {
  const parts = line.split(':');
  if (parts.length < 2) return [];

  const mentionBlock = parts[1].trim();
  const rawParts = mentionBlock.split(/ +/g);
  const userIds = [];

  for (const token of rawParts) {
    const idMatch = token.match(/^<@!?(\d+)>$/);
    if (idMatch) {
      userIds.push(idMatch[1]);
      continue;
    }

    const name = token.replace(/^@/, '').toLowerCase();
    const match = guild.members.cache.find(member => {
      return (
        member.user.username?.toLowerCase() === name ||
        member.user.globalName?.toLowerCase() === name ||
        member.nickname?.toLowerCase() === name
      );
    });

    if (match) userIds.push(match.user.id);
  }

  return [...new Set(userIds)];
}

async function grantApiXp(userId, guildId, xpAmount) {
  const url = `https://api.kiai.app/v2/${guildId}/member/${userId}/xp`;
  const apiKey = process.env.KIAI_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey.trim()
      },
      body: JSON.stringify({ xp: xpAmount })
    });

    return response.ok;
  } catch {
    return false;
  }
}
