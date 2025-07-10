module.exports = (users) => {
    const userSections = [];
    users.forEach((user, idx) => {
        userSections.push({
            type: 9, // Section
            components: [
                {
                    type: 10, // Text
                    content: `<@${user.id}>\n-# ${user.statusEmoji} ${user.status}`
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
                spacing: 1
            });
        }
    });

    return {
        flags: 32768,
        components: [
            {
                type: 17, // Container
                components: [
                    {
                        type: 10, // Text header
                        content: "## Meet the Staff"
                    },
                    ...userSections
                ]
            }
        ]
    };
};