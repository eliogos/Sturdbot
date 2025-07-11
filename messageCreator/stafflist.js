module.exports = (users, options = {}) => {
    const { showOffline = true } = options;

    const userSections = [];
    users.forEach((user, idx) => {
        userSections.push({
            type: 9, // Section
            components: [
                {
                    type: 10, // Text
                    content: `<@${user.id}>_ _ _ _ _ _\n-# ${user.statusEmoji} ${user.status}`
                }
            ],
            accessory: {
                type: 11, // Media (user avatar)
                media: {
                    url: user.avatarURL
                }
            }
        });

        if (idx < users.length - 1) {
            userSections.push({
                type: 14, // Separator
                divider: true,
                spacing: 2
            });
        }
    });

    return {
        flags: 32768,
        components: [
            {
                type: 17, // Container
                accent_color: null,
                components: [
                    {
                        type: 10,
                        content: "# Meet the Staff\nHere are the staff members of this server.\nYou may message them for concerns, questions, or suggestions.\n_ _"
                    },
                    ...userSections,
                    {
                        type: 10,
                        content: "_ _"
                    },
                    {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 2, // Button
                                label: "Refresh",
                                emoji: { name: "🔃" },
                                style: 2,
                                custom_id: "rules_moderation_stafflist_refresh"
                            },
                            {
                                type: 2,
                                label: showOffline ? "Hide Offline" : "Show All",
                                emoji: { name: showOffline ? "🙈" : "👁️" },
                                style: 2,
                                custom_id: showOffline? "rules_moderation_stafflist_toggle_hide" : "rules_moderation_stafflist_toggle_show"
                            }
                        ]
                    }
                ]
            }
        ]
    };
};