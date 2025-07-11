module.exports = {

    name: "guildMemberAdd",

    async execute(member) {

        const channel = member.guild.channels.cache.get("1281984173548109925");

        if (!channel) return;

        const isBot = member.user.bot;

        const guildId = member.guild.id;

        if (isBot) {

            // Bot message

            return channel.send({
                flags: 32768,

                components: [

                    {

                        type: 17,

                        accent_color: null,

                        components: [

                            {

                                type: 10,

                                content: "## App Installed"

                            },

                            {

                                type: 9,

                                components: [

                                    {

                                        type: 10,

                                        content: `<@${member.user.id}> has been deployed into the network.`

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

                                content: "_Initialization complete. Awaiting configuration._"

                            }

                        ]

                    }

                ]

            });

        }

        // Survivor join phrases (randomized)

        const intros = [

            `## Survivor Detected`,

            `## Incoming Signal`,

            `## Perimeter Breach Logged`,

            `## New Identity Registered`,

            `## Unknown Entity Scanned`

        ];

        const lines = [

            `A new survivor <@${member.user.id}> has emerged from the wastelands.`,

            `<@${member.user.id}> has arrived. Environmental scan initiated.`,

            `Tracking enabled. <@${member.user.id}> has been logged.`,

            `They said no one made it out of Zone 13. They were wrong. <@${member.user.id}> lives!`,

            `Disoriented. Dust-covered. Alive. Welcome, <@${member.user.id}>.`

        ];

        const footers = [

            "_Assigning sector..._",

            "_Stabilizing vitals..._",

            "_Temporary clearance granted._",

            "_Awaiting faction alignment..._",

            "_Monitoring behavior profile._"

        ];

        // Buttons

        const buttons = {

            type: 1,

            components: [

                {

                    type: 2,

                    label: "Server Guide",

                    style: 5, // Link

                    url: `https://discord.com/channels/${guildId}/@home`

                },


            ]

        };

        return channel.send({
 flags: 32768,
            components: [
               

                {

                    type: 17,

                    accent_color:0x9caf88,

                    components: [

                        {

                            type: 10,

                            content: random(intros)

                        },

                        {

                            type: 9,

                            components: [

                                {

                                    type: 10,

                                    content: random(lines)

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

                        },

                        buttons

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