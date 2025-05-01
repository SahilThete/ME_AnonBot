const { EmbedBuilder, SlashCommandBuilder } = require('discord.js'); 
const { UserHandle } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewhandles')
        .setDescription('View all anonymous handles in the server'),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async execute(interaction, client) {
        try {
            // Check if the user has admin access
            const canAccess = await hasAdminAccess(interaction.user, interaction.member);
            if (!canAccess) {
                return interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true, // Use ephemeral for better compatibility
                });
            }

            // Fetch all anonymous handles for the guild
            const handles = await UserHandle.find({ guildId: interaction.guild.id });

            // Create the embed for displaying handles
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('All Anonymous Handles')
                .setDescription('These are the anonymous handles registered in this guild.');

            // Add handles to the embed or indicate if there are none
            if (handles.length === 0) {
                embed.setDescription('No anonymous handles found in this guild.');
            } else {
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
            }

            // Send the embed as a reply
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            // Handle unexpected errors
            console.error('Error fetching handles:', error);
            return interaction.reply({
                content: 'An error occurred while retrieving anonymous handles.',
                ephemeral: true,
            });
        }
    },
};
