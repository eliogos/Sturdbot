require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences ] });

client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();
client.applicationCommands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const ADMIN_ROLE = process.env.ADMIN_ROLE;

// Load commands from the commands directory
function loadCommands(dir, context = []) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            loadCommands(path.join(dir, file.name), [...context, file.name]);
        } else if (
            file.name.endsWith('.js') &&
            !file.name.startsWith('__archived__')
        ) {
            const command = require(path.join(dir, file.name));
            let commandName = command.data?.name || file.name.replace('.js', '');
            let commandData = { ...command, context, name: commandName };
            // Register by type
            if (command.data?.type === 2 || context.includes('user')) {
                client.applicationCommands.set(commandName, commandData);
            } else if (command.data?.type === 3 || context.includes('message')) {
                client.applicationCommands.set(commandName, commandData);
            } else if (command.data?.toJSON || context.includes('slash')) {
                client.applicationCommands.set(commandName, commandData);
            } else {
                client.commands.set(commandName, commandData); // fallback for text commands
            }
        }
    }
}

// Load events from the events directory
function loadEvents(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            loadEvents(path.join(dir, file.name));
        } else if (
            file.name.endsWith('.js') &&
            !file.name.startsWith('__archived__')
        ) {
            const event = require(path.join(dir, file.name));
            const eventName = file.name.replace('.js', '');
            client.on(eventName, event.bind(null, client));
            client.events.set(eventName, event);
        }
    }
}

// Load commands and events
loadCommands(commandsPath);
loadEvents(eventsPath);

// Register slash commands with Discord
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Prepare all application commands (slash, user, message)
    const appCommandsArray = [];
    client.applicationCommands.forEach(cmd => {
        if (cmd.data) appCommandsArray.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: appCommandsArray }
        );
        console.log('Application commands registered.');
    } catch (error) {
        console.error(error);
    }
});

// Message command handler
client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (command) {
        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }
    }
});

// Slash/User/Message command handler
client.on('interactionCreate', async interaction => {
    // Handle application commands (slash, user, message)
    if (
        interaction.isCommand?.() ||
        interaction.isUserContextMenuCommand?.() ||
        interaction.isMessageContextMenuCommand?.()
    ) {
        const command = client.applicationCommands.get(interaction.commandName);
        if (command) {
            if (command.isDevCommand && !DEV_IDS.includes(interaction.user.id)) {
                return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
            }
        }
        return;
    }

    // Handle button interactions
    if (interaction.isButton?.()) {
        const parts = interaction.customId.split('_');

        if (parts[0] === "rules") {
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
                        member => member.roles.cache.has(ADMIN_ROLE) && !member.user.bot
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
                    const users = staffMembers.map(member => {
                        const status = member.presence?.status || "offline";
                        return {
                            id: member.user.id,
                            tag: member.user.tag,
                            avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 128 }),
                            status: `_ _ \`${status.toUpperCase()}\``,
                            statusEmoji: statusEmoji[status] || "❔"
                        };
                    });

                    // Dynamically require the messageCreator file using parts[2]
                    const stafflistMessage = require(path.join(__dirname, 'messageCreator', `${parts[2]}.js`));
                    const messageData = stafflistMessage(users);

                    console.log("[Button] Staff list messageData:", messageData);

                    return await interaction.editReply(messageData);
                } catch (err) {
                    console.error("[Button] Error in staff list handler:", err);
                    return await interaction.editReply({ content: "An error occurred while fetching the staff list." });
                }
            }
            // more rules* button handlers here
        }

        // more button handlers below this line
    }

    // Other component handlers here
});

client.login(process.env.DISCORD_TOKEN);