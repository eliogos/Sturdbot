module.exports = async (interaction, parts, context) => {
    if (parts[1] === "moderation" && parts[2] === "stafflist") {
        console.log("[Button] Staff list button clicked by", interaction.user.tag);

        await interaction.deferReply({ ephemeral: true });
        console.log("[Button] Deferred reply sent.");

        const guild = interaction.guild;
        if (!guild) {
            console.log("[Button] No guild found.");
            return await interaction.editReply({ content: "This command can only be used in a server." });
        }

        try {
            console.log("[Button] Fetching all guild members...");
            await guild.members.fetch();
            console.log("[Button] Members fetched. Filtering staff...");
            const staffMembers = guild.members.cache.filter(
                member => member.roles.cache.has(context.ADMIN_ROLE) && !member.user.bot
            );
            console.log(`[Button] Found ${staffMembers.size} staff members.`);

            if (staffMembers.size === 0) {
                return await interaction.editReply({ content: "No staff members. This should be not possible..." });
            }

            const statusEmoji = {
                online: "🟢",
                idle: "🌙",
                dnd: "⛔",
                offline: "❌"
            };

            // Prepare users array for the messageCreator file
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

            // Sort users by status: online > idle > dnd > offline
            const statusOrder = { online: 0, idle: 1, dnd: 2, offline: 3 };
            users.sort((a, b) => (statusOrder[a.statusRaw] ?? 4) - (statusOrder[b.statusRaw] ?? 4));

            // Dynamically require the messageCreator file using parts[2]
            const stafflistMessage = require(context.path.join(__dirname, '../../messageCreator', `${parts[2]}.js`));
            const messageData = stafflistMessage(users);

            console.log("[Button] Staff list messageData:", messageData);

            return await interaction.editReply(messageData);
        } catch (err) {
            console.error("[Button] Error in staff list handler:", err);
            return await interaction.editReply({ content: "An error occurred while fetching the staff list." });
        }
    }
    // more rules* button handlers here
};