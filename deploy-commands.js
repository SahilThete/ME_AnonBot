// deploy-commands.js
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

const commands = [];
const commandDirs = ['core', 'admin'];

for (const dir of commandDirs) {
    const dirPath = path.join(__dirname, 'commands', dir);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        const command = require(`./commands/${dir}/${file}`);
        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
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
