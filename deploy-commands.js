const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error('❌ Missing environment variables. Ensure BOT_TOKEN, CLIENT_ID, and GUILD_ID are defined in your .env file.');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Recursive function to load commands
function loadCommands(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(directory, file.name);
        if (file.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.name.endsWith('.js')) {
            const command = require(fullPath);
            if (command.data && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
                console.log(`✅ Command loaded: ${command.data.name}`);
            } else {
                console.warn(`⚠️ Invalid command file: ${file.name} in ${directory}`);
            }
        }
    }
}
loadCommands(commandsPath);

// Initialize the REST API client
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// Register slash commands with Discord with retry logic
async function registerCommands(retries = 3) {
    while (retries > 0) {
        try {
            console.log('Started refreshing application (/) commands...');
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
                body: commands,
            });
            console.log(`✅ Successfully reloaded application (/) commands. Total commands: ${commands.length}`);
            commands.forEach(command => console.log(`Registered command: ${command.name}`));
            return; // Exit if successful
        } catch (error) {
            retries--;
            console.error(`❌ Error registering commands. Retries left: ${retries}`, error);
            if (error.response && error.response.data) {
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
            if (retries === 0) throw error; // Throw error after exhausting retries
        }
    }
}
registerCommands().catch(error => console.error('❌ Failed to register commands:', error));
