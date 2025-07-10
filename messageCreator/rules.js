module.exports = () => ({
    flags: 32768,
    components: [

        // Container
        {
            
            type: 17,
            accent_color: null,
            components: [

                // Text
                {
                    type: 10,
                    content: "-# **The Sturdy Shelter Handbook - Section I. Orientation**"
                },
                
                // Media
                {
                    type: 12,
                    items: [
                        {
                            media: {
                                url: "https://dl.dropboxusercontent.com/scl/fi/1yjpfydst4ktkxf53iced/Rules.png?rlkey=si7i6qa3drbscxu51sr6xww9y&st=fx0rl1n9&dl=0"
                            }
                        }
                    ]
                },


                // Text
                {
                    type: 10,
                    content: "# Welcome to the Sturdy Shelter, survivor!"
                },

                // Text
                {
                    type: 10,
                    content: "**You've made it into the shelter—congratulations, for now I guess…**\nThis shelter is built to withstand the harshest conditions, but its true strength comes from those within, and that includes *you*.\n_ _"
                },

                // Section
                {
                    type: 9,
                    components: [

                        // Text
                        {
                            type: 10,
                            content: "To ensure a safe and orderly environment, it is imperative that all residents adhere to the Rules and Guidelines."
                        },

                        // Text
                        {
                            type: 10,
                            content: "-# Non-compliance may result in punishment and/or exile."
                        }

                    ],

                    // Accessory
                    accessory: {
                        type: 11,
                        media: {
                            url: "https://uxwing.com/wp-content/themes/uxwing/download/signs-and-symbols/warning-icon.png"
                        }
                    }
                },

                // Separator
                {
                    type: 14,
                    divider: true,
                    spacing: 1
                },

                // Text
                {
                    type: 10,
                    content: "Before enjoying your residency, always remember our core values:\n-# Safety first. Respect the community. Contribute to the order."
                }

            ]
        },

        // Separator
        {
            type: 14,
            divider: true,
            spacing: 2
        },

        // Text
        {
            type: 10,
            content: "_ _\n_ _"
        },

        // Container
        {
            type: 17,
            accent_color: null,
            components: [

                {
                    type: 10, content: "### BEHAVIOR"
                },

                {
                    type: 10, content: "Guide on avoiding creating unnecessary chaos.\n-# You may also read Discord's [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines)."
                },


                // Action Row
                {
                    type: 1,
                    components: [

                        // String Select
                        {
                            type: 3,
                            custom_id: "rules_behavior",
                            placeholder: "Click to read more",
                            options: [
                                {
                                    label: "Respect everyone",
                                    value: "1",
                                    emoji: { name: "💞" }
                                },
                                {
                                    label: "Respect opinions",
                                    value: "2",
                                    emoji: { name: "🤝" }
                                },
                                {
                                    label: "No hostility",
                                    value: "3",
                                    emoji: { name: "🐍" }
                                },
                                {
                                    label: "Chill out",
                                    value: "4",
                                    emoji: { name: "😌" }
                                },
                                {
                                    label: "No personal attacks",
                                    value: "5",
                                    emoji: { name: "🎯" }
                                },
                            ]
                        }
                    ]
                }
            ]
        },

        // Text
        {
            type: 10,
            content: "_ _"
        },

        // Container
        {
            type: 17,
            accent_color: null,
            components: [

                {
                    type: 10, content: "### LANGUAGE"
                },

                {
                    type: 10, content: "Guide on effective communication and interaction."
                },


                // Action Row
                {
                    type: 1,
                    components: [

                        // String Select
                        {
                            type: 3,
                            custom_id: "rules_language",
                            placeholder: "Click to read more",
                            options: [
                                {
                                    label: "Speak English",
                                    value: "1",
                                    emoji: { name: "🇬🇧" }
                                },
                                {
                                    label: "Limit profanity",
                                    value: "2",
                                    emoji: { name: "🤬" }
                                },
                                {
                                    label: "No threats",
                                    value: "3",
                                    emoji: { name: "😨" }
                                },
                                {
                                    label: "Think before you send",
                                    value: "4",
                                    emoji: { name: "🤔" }
                                },
                            ]
                        }
                    ]
                }
            ]
        },

        // Text
        {
            type: 10,
            content: "_ _"
        },

        // Container
        {
            type: 17,
            accent_color: null,
            components: [

                {
                    type: 9,
                    components: [
                        {
                            type: 10, content: "### MODERATION"
                        },

                        {
                            type: 10, content: "Guide on reporting and compliance."
                        },
                    ],
                    accessory: {
                        type: 2,
                        style: 2,
                        label: "Staff list",
                        custom_id: "rules_moderation_stafflist",
                        emoji: { name: "👥" }
                    }
                },

                


                // Action Row
                {
                    type: 1,
                    components: [

                        // String Select
                        {
                            type: 3,
                            custom_id: "rules_moderation",
                            placeholder: "Click to read more",
                            options: [
                                {
                                    label: "Report problems to the staff",
                                    value: "1",
                                    emoji: { name: "📢" }
                                },
                                {
                                    label: "Be civil when warned",
                                    value: "2",
                                    emoji: { name: "✉️" }
                                },
                                {
                                    label: "Stop and comply",
                                    value: "3",
                                    emoji: { name: "🛑" }
                                },
                                {
                                    label: "Be at least 15 years old",
                                    value: "4",
                                    emoji: { name: "🚸" }
                                },
                                {
                                    label: "No inappropriate profiles",
                                    value: "5",
                                    emoji: { name: "‼️" }
                                },
                            ]
                        }
                    ]
                }
            ]
        },

         // Text
        {
            type: 10,
            content: "_ _"
        },

        // Container
        {
            type: 17,
            accent_color: null,
            components: [

                {
                    type: 10, content: "### CONTENT & SHARING"
                },

                {
                    type: 10, content: "Guide on posting content, sharing media, and showing off your profile."
                },


                // Action Row
                {
                    type: 1,
                    components: [

                        // String Select
                        {
                            type: 3,
                            custom_id: "rules_content",
                            placeholder: "Click to read more",
                            options: [
                                {
                                    label: "Keep personal info private",
                                    value: "1",
                                    emoji: { name: "🕵️" }
                                },
                                {
                                    label: "No doxxing",
                                    value: "2",
                                    emoji: { name: "📍" }
                                },
                                {
                                    label: "Use channels correctly",
                                    value: "3",
                                    emoji: { name: "💬" }
                                },
                                {
                                    label: "No malicious links or files",
                                    value: "4",
                                    emoji: { name: "⛓️‍💥" }
                                },
                                {
                                    label: "No AI-generated artworks",
                                    description: "Do not post AI content in art channels.",
                                    value: "5",
                                    emoji: { name: "no_ai", id: "1392864612478619809" }
                                },
                            ]
                        }
                    ]
                }
            ]
        }


    ]
})