const { EmbedBuilder, MessageFlags, SlashCommandBuilder } = require('discord.js');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async execute(interaction, client) {
        try {
            // Check if the user has admin access
            const isAdmin = await hasAdminAccess(interaction.user, interaction.member);

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📖 Anon Bot Commands')
                .addFields(
                    { 
                        name: '/ping',
                        value: 'Check bot latency',
                        inline: false 
                    },
                    { 
                        name: '/create',
                        value: 'Create an anonymous handle (e.g., anon1234)',
                        inline: false 
                    },
                    { 
                        name: '/viewhandle',
                        value: 'See your current anonymous handle',
                        inline: false 
                    },
                    { 
                        name: '/setchannel',
                        value: 'Set the dark web channel (admin only)',
                        inline: false 
                    },
                    { 
                        name: '!anon <message>',
                        value: 'Send an anonymous message in the configured channel',
                        inline: false 
                    }
                );

            // Add admin-specific commands if the user is an admin
            if (isAdmin) {
                embed.addFields(
                { 
                    name: '/viewhandles',
                    value: 'View all anonymous handles in this server.',
                    inline: false},
                { 
                    name: '/manage add',
                    value: 'Grant bot admin access to a user.',
                    inline: false 
                },
                { 
                    name: '/manage remove',
                    value: 'Revoke bot admin access from a user.',
                    inline: false
                }
            );
            }

            embed.setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            // Reply conditionally (ephemeral for admins, public for others)
            await interaction.reply({embeds: [embed], flags: isAdmin ? MessageFlags.Ephemeral : undefined});
            
        } catch (error) {
            console.error('Error executing help command:', error);
            await interaction.reply({
                content: 'An error occurred while retrieving the help information.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
