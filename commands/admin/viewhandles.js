const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { UserHandle } = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewhandles')
    .setDescription('View all anonymous handles in this server (admin-only)'),

  /**
   * @param {import('discord.js').CommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    try {
      const handles = await UserHandle.find({ guildId: interaction.guild.id });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('All Anonymous Handles')
        .setDescription(handles.length === 0
          ? 'No anonymous handles found in this guild.'
          : 'These are the anonymous handles registered in this guild.'
        );

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

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('Error fetching handles:', error);
      return interaction.reply({
        content: 'An error occurred while retrieving anonymous handles.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};
