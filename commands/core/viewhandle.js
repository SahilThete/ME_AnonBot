const { SlashCommandBuilder, MessageFlags} = require('discord.js');
const { UserHandle } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewhandle')
        .setDescription('View your current anonymous handle'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const handle = await UserHandle.findOne({ userId, guildId });
        if (!handle) {
            return interaction.reply({
                content: "You haven't set a handle yet. Use `/create` first.",
                flags: MessageFlags.Ephemeral
            });
        }

        return interaction.reply({
            content: `Your handle is **${handle.handle}**.`,
            flags: MessageFlags.Ephemeral
        });
    }
};
