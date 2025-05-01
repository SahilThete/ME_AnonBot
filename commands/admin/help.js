const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasAdminAccess } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),

    async execute(interaction, client) {
        const isAdmin = await hasAdminAccess(interaction.user, interaction.member);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📖 MERP Bot Commands')
            .addFields(
                { name: '/ping', value: 'Check bot latency', inline: false },
                { name: '/create', value: 'Create an anonymous handle (e.g., anon1234)', inline: false },
                { name: '/viewhandle', value: 'See your current anonymous handle', inline: false },
                { name: '/setchannel', value: 'Set the dark web channel (admin only)', inline: false },
                { name: '!anon <msg>', value: 'Send an anonymous message in the configured channel', inline: false }
            );

        if (isAdmin) {
            embed.addFields(
                { name: '/admin viewhandles', value: 'View all registered handles', inline: false },
                { name: '/admin manage add/remove', value: 'Manage admin access', inline: false }
            );
        }

        embed.setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
