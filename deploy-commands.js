require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

function loadCommandsFromFolder(folderPath) {
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }

    // Recursively load subfolders
    const subfolders = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    for (const subfolder of subfolders) {
        loadCommandsFromFolder(path.join(folderPath, subfolder.name));
    }
}

loadCommandsFromFolder(foldersPath);

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`🔁 Started refreshing ${commands.length} application (/) commands...`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('✅ Successfully reloaded all commands.');
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
})();
