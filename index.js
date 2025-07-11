require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, Options, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    // Disable message cache
    sweepers: {
        messages: {
            interval: 60,
            lifetime: 0  
        }
    },
    makeCache: Options.cacheWithLimits({
        MessageManager: 0
    })
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();
client.applicationCommands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const ADMIN_ROLE = process.env.ADMIN_ROLE;
// Safely load developer IDs from your .env file
const DEV_IDS = process.env.DEV_IDS?.split(',') || [];

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
            const eventModule = require(path.join(dir, file.name));

            // The event files should export an object with 'name' and 'execute' properties.
            if (!eventModule.name || typeof eventModule.execute !== 'function') {
                console.warn(`[Event Loader] The event in ${file.name} is missing a 'name' or 'execute' property. Skipping.`);
                continue;
            }

            if (eventModule.once) {
                client.once(eventModule.name, (...args) => eventModule.execute(...args, client));
            } else {
                client.on(eventModule.name, (...args) => eventModule.execute(...args, client));
            }
            client.events.set(eventModule.name, eventModule);
        }
    }
}

// Load commands and events
loadCommands(commandsPath);
loadEvents(eventsPath);

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

const buttonHandlers = {};
const selectMenuHandlers = {};

// Dynamically load all button handlers
fs.readdirSync(path.join(__dirname, 'handlers/button')).forEach(file => {
    const name = file.replace('.js', '');
    buttonHandlers[name] = require(path.join(__dirname, 'handlers/button', file));
});

// Dynamically load all select menu handlers
fs.readdirSync(path.join(__dirname, 'handlers/selectMenu')).forEach(file => {
    const name = file.replace('.js', '');
    selectMenuHandlers[name] = require(path.join(__dirname, 'handlers/selectMenu', file));
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
                return interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
            }
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error executing that command.', flags: MessageFlags.Ephemeral });
            }
        }
        return;
    }

    // Button handler
    if (interaction.isButton?.()) {
        const parts = interaction.customId.split('_');
        const handler = buttonHandlers[parts[0]];
        if (handler) {
            return handler(interaction, parts, { ADMIN_ROLE, path });
        }
    }

    // Select menu handler
    if (interaction.isStringSelectMenu?.()) {
        const customId = interaction.customId;
        const handler = selectMenuHandlers[customId.split('_')[0]];
        if (handler) {
            return handler(interaction, customId, interaction.values);
        }
    }

    // Other component handlers here
});

// Memory usage monitor
const MEMORY_LIMIT_MB = 200;

setInterval(() => {
    const memoryUsage = process.memoryUsage();

    const rssMb = memoryUsage.rss / 1024 / 1024;



    if (rssMb >= MEMORY_LIMIT_MB) {
        console.warn(`[Memory Monitor] RSS memory (${rssMb.toFixed(2)} MB) has reached the limit of ${MEMORY_LIMIT_MB} MB. Clearing caches...`);

        client.guilds.cache.forEach(guild => {
            guild.members.cache.clear();
            guild.presences.cache.clear();
        });

        console.log('[Memory Monitor] Caches cleared successfully.');


        if (global.gc) { global.gc(); console.log('[Memory Monitor] Garbage collection triggered.'); }
    }
}, 30000);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

client.login(process.env.DISCORD_TOKEN);