const { Events, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const commandFolders = ['core', 'admin'];
        let command;

        // attempt to dynamically load the command from folders
        for (const folder of commandFolders) {
            const commandPath = path.join(__dirname, '..', 'commands', folder, `${interaction.commandName}.js`);
            if (fs.existsSync(commandPath)) {
                command = require(commandPath);
                break;
            }
        }

        if (!command || !command.data) {
            return interaction.reply({ content: 'Command not found.', flags: MessageFlags.Ephemeral });
        }

        try {
            await command.execute(interaction, interaction.client);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);
            if (!interaction.replied) {
                interaction.reply({ content: 'There was an error while executing this command.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
