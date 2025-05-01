const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { UserHandle } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewhandle')
        .setDescription('View your current anonymous handle'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const userHandle = await UserHandle.findOne({ userId, guildId });

        if (!userHandle) {
            return interaction.reply({
                content: "You haven't set a handle yet. Use `/create` to set one.",
                flags: MessageFlags.Ephemeral,
            });
        }

        return interaction.reply({
            content: `Your current anonymous handle is **${userHandle.handle}**.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
