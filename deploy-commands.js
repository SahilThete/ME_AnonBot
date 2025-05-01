const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load commands dynamically
commandFiles.forEach(file => {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
});

// Initialize the REST API client
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// Register slash commands with Discord
(async () => {
    try {
        console.log('Started refreshing application (/) commands...');

        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
})();
