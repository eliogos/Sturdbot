require('dotenv').config(); const { Client, GatewayIntentBits, Collection, REST, Routes, Options, MessageFlags } = require('discord.js'); const fs = require('fs'); const path = require('path');

const commandsPath = path.join(__dirname, 'commands'); const eventsPath = path.join(__dirname, 'events');

const ADMIN_ROLE = process.env.ADMIN_ROLE; const DEV_IDS = process.env.DEV_IDS?.split(',') || [];

const clientIds = { bot_1: process.env.CLIENT_ID_BOT_1, bot_2: process.env.CLIENT_ID_BOT_2 };

function createClient(label) { const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences ], sweepers: { messages: { interval: 60, lifetime: 0 } }, makeCache: Options.cacheWithLimits({ MessageManager: 0 }) });

client.label = label;
client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();
client.applicationCommands = new Collection();

return client;

}

const clients = { bot_1: createClient('bot_1'), bot_2: createClient('bot_2') };

function loadCommands(client, dir, context = []) { const files = fs.readdirSync(dir, { withFileTypes: true }); for (const file of files) { if (file.isDirectory()) { loadCommands(client, path.join(dir, file.name), [...context, file.name]); } else if (file.name.endsWith('.js') && !file.name.startsWith('archived')) { const command = require(path.join(dir, file.name)); const commandName = command.data?.name || file.name.replace('.js', ''); const targets = command.targets || ['bot_1', 'bot_2']; if (!targets.includes(client.label)) continue;

const commandData = { ...command, context, name: commandName };
        if (command.data?.type === 2 || context.includes('user')) {
            client.applicationCommands.set(commandName, commandData);
        } else if (command.data?.type === 3 || context.includes('message')) {
            client.applicationCommands.set(commandName, commandData);
        } else if (command.data?.toJSON || context.includes('slash')) {
            client.applicationCommands.set(commandName, commandData);
        } else {
            client.commands.set(commandName, commandData);
        }
    }
}

}

function loadEvents(client, dir) { const files = fs.readdirSync(dir, { withFileTypes: true }); for (const file of files) { if (file.isDirectory()) { loadEvents(client, path.join(dir, file.name)); } else if (file.name.endsWith('.js') && !file.name.startsWith('archived')) { const eventModule = require(path.join(dir, file.name)); const targets = eventModule.targets || ['bot_1', 'bot_2']; if (!targets.includes(client.label)) continue;

if (!eventModule.name || typeof eventModule.execute !== 'function') {
            console.warn(`[Event Loader] ${file.name} missing 'name' or 'execute'. Skipping.`);
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

const buttonHandlers = {}; const selectMenuHandlers = {};

fs.readdirSync(path.join(__dirname, 'handlers/button')).forEach(file => { const name = file.replace('.js', ''); buttonHandlers[name] = require(path.join(__dirname, 'handlers/button', file)); });

fs.readdirSync(path.join(__dirname, 'handlers/selectMenu')).forEach(file => { const name = file.replace('.js', ''); selectMenuHandlers[name] = require(path.join(__dirname, 'handlers/selectMenu', file)); });

for (const [label, client] of Object.entries(clients)) { loadCommands(client, commandsPath); loadEvents(client, eventsPath);

const token = process.env[`DISCORD_TOKEN_${label.toUpperCase()}`];
if (!token) {
    console.error(`[${label}] Missing DISCORD_TOKEN_${label.toUpperCase()}`);
    continue;
}

const rest = new REST({ version: '10' }).setToken(token);
const slashCommands = Array.from(client.applicationCommands.values()).map(cmd => cmd.data.toJSON());

if (!clientIds[label]) {
    console.error(`[${label}] Missing CLIENT_ID for registration.`);
    continue;
}

rest.put(
  Routes.applicationCommands(clientIds[label]),
  { body: slashCommands }
)
.then(() => console.log(`[${label}] Global slash commands registered`))
.catch(err => console.error(`[${label}] Failed to register global commands`, err));

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

client.on('interactionCreate', async interaction => {
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

    if (interaction.isButton?.()) {
        const parts = interaction.customId.split('_');
        const handler = buttonHandlers[parts[0]];
        if (handler) {
            return handler(interaction, parts, { ADMIN_ROLE, path });
        }
    }

    if (interaction.isStringSelectMenu?.()) {
        const customId = interaction.customId;
        const handler = selectMenuHandlers[customId.split('_')[0]];
        if (handler) {
            return handler(interaction, customId, interaction.values);
        }
    }
});

const MEMORY_LIMIT_MB = 160;
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const rssMb = memoryUsage.rss / 1024 / 1024;

    if (rssMb >= MEMORY_LIMIT_MB) {
        console.warn(`[${label} Memory Monitor] RSS memory (${rssMb.toFixed(2)} MB) exceeded limit. Clearing caches...`);
        client.guilds.cache.forEach(guild => {
            guild.members.cache.clear();
            guild.presences.cache.clear();
        });
        if (global.gc) {
            global.gc();
            console.log(`[${label} Memory Monitor] GC triggered.`);
        }
    }
}, 30000);

client.login(token);

}

process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection:', reason); }); process.on('uncaughtException', err => { console.error('Uncaught Exception:', err); });

