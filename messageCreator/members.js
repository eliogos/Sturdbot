module.exports = () => (
    {
        flags: 32768,
        components: [
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
                            type: 10, content: "### MEMBERSHIP"
                        },

                        {
                            type: 10, content: "Guide on fitting in and being an offical member. Learn more about what we do in this server."
                        },
                    ],
                    accessory: {
                        type: 2,
                        style: 5,
                        label: "Learn more about roles",
                        url: "https://discord.com/channels/827186337500102706/1369397941113983129"
                    }
                },

                


                // Action Row
                {
                    type: 1,
                    components: [

                        // String Select
                        {
                            type: 3,
                            custom_id: "rules_member",
                            placeholder: "Click to read more",
                            options: [
                                {
                                    label: "Feel free to engage in server roleplay",
                                    value: "1",
                                    emoji: { name: "🗡️" }
                                },
                                {
                                    label: "We are artists and developers",
                                    value: "2",
                                    emoji: { name: "🎨" }
                                },
                                {
                                    label: "We like to banter",
                                    value: "3",
                                    emoji: { name: "🗯️" }
                                },
                                {
                                    label: "We love anime and movies",
                                    value: "4",
                                    emoji: { name: "🎬" }
                                },
                            ]
                        }
                    ]
                }
            ]
        },
        ]
    }
)