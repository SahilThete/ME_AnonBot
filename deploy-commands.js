// deploy-commands.js
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

const commands = [];
const commandNames = new Set();

// Load commands recursively from the commands directory
function loadCommands(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error(`Directory not found: ${directory}`);
    }

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        const command = require(fullPath);

        if (!command.data || typeof command.data.toJSON !== 'function') {
            throw new Error(`Invalid command definition: ${fullPath}`);
        }

        const json = command.data.toJSON();

        if (commandNames.has(json.name)) {
            throw new Error(`Duplicate command name: ${json.name}`);
        }

        commandNames.add(json.name);
        commands.push(json);

        console.log(`Loaded command: ${json.name}`);
    }
}

loadCommands(path.join(__dirname, 'commands'));

// Ensure required environment variables are set
if (!process.env.BOT_TOKEN ||
    !process.env.CLIENT_ID ||
    !process.env.GUILD_ID) {
    throw new Error('Missing required deployment environment variables.');
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('📡 Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Guild commands registered successfully.');
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
})();
