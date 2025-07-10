module.exports = () => ({
    flags: 32768,
    components: [
        {
            type: 17, // Container (e.g., "panel")
            accent_color: 703487,
            components: [
                {
                    type: 10, // Text
                    content: "# You have encountered a wild coyote!"
                },
                {
                    type: 10, // Text
                    content: "What would you like to do?"
                },
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            custom_id: "pet_coyote",
                            label: "Pet it!",
                            style: 1
                        },
                        {
                            type: 2, // Button
                            custom_id: "feed_coyote",
                            label: "Attempt to feed it",
                            style: 2
                        },
                        {
                            type: 2, // Button
                            custom_id: "run_away",
                            label: "Run away!",
                            style: 4
                        }
                    ]
                }
            ]
        }
    ]
});