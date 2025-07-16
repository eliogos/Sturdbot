// events/channelDayCounter.js

module.exports = {
  name: 'ready',
  once: true,
  targets: ['bot_1'],
  async execute(client) {
    const channelId = '1281986277473779722';
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || channel.type !== 2) return; // Type 2 = Voice

    const incrementDay = async () => {
      const match = channel.name.match(/Day (\d+)/);
      if (!match) return;
      const current = parseInt(match[1], 10);
      const next = current + 1;
      await channel.setName(`Day ${next}`).catch(console.error);
    };

    // GMT+8 midnight
    const now = new Date();
    const offset = 8 * 60; // GMT+8 in minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const gmt8 = new Date(utc + offset * 60000);

    const nextMidnight = new Date(gmt8);
    nextMidnight.setHours(24, 0, 0, 0);

    const delay = nextMidnight - gmt8;
    setTimeout(() => {
      incrementDay();
      setInterval(incrementDay, 24 * 60 * 60 * 1000);
    }, delay);
  }
};
