const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // Get the command from the client's collection
        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) {
            return interaction.reply({
                content: 'Command not found.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await command.execute(interaction, interaction.client);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error );
            
            // Attempt to reply with an error message
            try {
                if (interaction.deferred) {
                    await interaction.editReply({
                        content: 'There was an error while executing the command.',
                        embeds: []
                    });
                } else if (interaction.replied) {
                    await interaction.followUp({
                        content: 'There was an error while executing the command.',
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing the command.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            } catch (replyError) {
                console.error(
                    'Failed to send interaction error response:',
                    replyError
                );
            }
        }
    }
};
