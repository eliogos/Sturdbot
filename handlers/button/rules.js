module.exports = async (interaction, parts, context) => {
    if (parts[1] === "moderation" && parts[2] === "stafflist") {
        const subAction = parts[3] || "default";
        const isInitial = subAction === "default";
        const isRefresh = subAction === "refresh";
        const toggleHide = subAction === "toggle" && parts[4] === "hide";
        const toggleShow = subAction === "toggle" && parts[4] === "show";
        const hideOffline = toggleHide;

        // Defer only if it's the first interaction (not a button update)
        if (isInitial) {
            await interaction.deferReply({ ephemeral: true });
        }

        const guild = interaction.guild;
        if (!guild) {
            const errorMsg = { content: "This command can only be used in a server." };
            return isInitial
                ? interaction.editReply(errorMsg)
                : interaction.update(errorMsg);
        }

        try {
            await guild.members.fetch();
            const staffMembers = guild.members.cache.filter(
                member => member.roles.cache.has(context.ADMIN_ROLE) && !member.user.bot
            );

            const statusEmoji = {
                online: "🟢",
                idle: "🌙",
                dnd: "⛔",
                offline: "❌"
            };

            let users = staffMembers.map(member => {
                const status = member.presence?.status || "offline";
                return {
                    id: member.user.id,
                    tag: member.user.tag,
                    avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 128 }),
                    status: `_ _ \`${status.toUpperCase()}\``,
                    statusRaw: status,
                    statusEmoji: statusEmoji[status] || "❔"
                };
            });

            if (hideOffline) {
                users = users.filter(user => user.statusRaw !== "offline");
            }

            const statusOrder = { online: 0, idle: 1, dnd: 2, offline: 3 };
            users.sort((a, b) => (statusOrder[a.statusRaw] ?? 4) - (statusOrder[b.statusRaw] ?? 4));

            const stafflistMessage = require(context.path.join(__dirname, '../../messageCreator/stafflist.js'));
            const messageData = stafflistMessage(users, { showOffline: !hideOffline });

            return isInitial
                ? interaction.editReply(messageData)
                : interaction.update(messageData);
        } catch (err) {
            console.error("[Button] Error in staff list handler:", err);
            const errorMessage = { content: "An error occurred while fetching the staff list." };
            return isInitial
                ? interaction.editReply(errorMessage)
                : interaction.update(errorMessage);
        }
    }

    // more button handlers...
};