module.exports = {

    name: "guildMemberRemove",

    async execute(member) {

        const channel = member.guild.channels.cache.get("1281984173548109925");

        if (!channel) return;

        const isBot = member.user.bot;

        if (isBot) {

            return channel.send({
                flags: 32768,

                components: [

                    {

                        type: 17,

                        accent_color: null,

                        components: [

                            {

                                type: 10,

                                content: "## App Uninstalled"

                            },

                            {

                                type: 9,

                                components: [

                                    {

                                        type: 10,

                                        content: `<@${member.user.id}> has been decommissioned.`

                                    }

                                ],

                                accessory: {

                                    type: 11,

                                    media: {

                                        url: member.user.displayAvatarURL({ extension: "png", size: 128 })

                                    }

                                }

                            },

                            {

                                type: 10,

                                content: "_System cleanup complete._"

                            }

                        ]

                    }

                ]

            });

        }

        const titles = [

            `## Signal Lost`,

            `## Void Entry Detected`,

            `## Trace Erased`,

            `## Connection Terminated`

        ];

        const messages = [

            `Transmission with <@${member.user.id}> lost.`,

            `<@${member.user.id}> exited the safe zone. Status: Unknown.`,

            `<@${member.user.id}> disconnected. Last seen in hostile territory.`,

            `Memory logs purged. Identity <@${member.user.id}> not found.`,

            `<@${member.user.id}> has vanished from all surveillance grids.`

        ];

        const footers = [

            "_Their journey ends here..._",

            "_Another soul swallowed by the dark._",

            "_Records sealed._",

            "_Fate unknown._"

        ];

        return channel.send({
            flags: 32768,

            components: [

                {

                    type: 17,

                    accent_color: 0xFF0000,

                    components: [

                        {

                            type: 10,

                            content: random(titles)

                        },

                        {

                            type: 9,

                            components: [

                                {

                                    type: 10,

                                    content: random(messages)

                                }

                            ],

                            accessory: {

                                type: 11,

                                media: {

                                    url: member.user.displayAvatarURL({ extension: "png", size: 128 })

                                }

                            }

                        },

                        {

                            type: 14,

                            divider: true

                        },

                        {

                            type: 10,

                            content: random(footers)

                        }

                    ]

                }

            ]

        });

    }

};

// Helper

function random(arr) {

    return arr[Math.floor(Math.random() * arr.length)];

}