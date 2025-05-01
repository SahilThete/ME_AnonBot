const { EmbedBuilder } = require('discord.js');
const { UserHandle } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    async execute(interaction, client) {
        const canAccess = await hasAdminAccess(interaction.user, interaction.member);
        if (!canAccess) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const handles = await UserHandle.find({ guildId: interaction.guild.id });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('All Anonymous Handles');

        for (const [index, handle] of handles.entries()) {
            try {
                const user = await interaction.guild.members.fetch(handle.userId);
                const date = handle.createdAt?.toLocaleString() ?? 'Unknown';
                embed.addFields({
                    name: `**${index + 1}. ${user.user.username}**`,
                    value: `Handle: ${handle.handle}\nCreated on: ${date}`,
                    inline: false
                });
            } catch {
                embed.addFields({
                    name: `**${index + 1}. User ID: ${handle.userId}**`,
                    value: `Handle: ${handle.handle}\n(Couldn't fetch username)`,
                    inline: false
                });
            }
        }

        return interaction.reply({ embeds: [embed] });
    }
};
