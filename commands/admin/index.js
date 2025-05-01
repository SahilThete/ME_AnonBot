const { SlashCommandBuilder } = require('discord.js');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands')
        .addSubcommand(sub =>
            sub.setName('viewhandles')
                .setDescription('View all anonymous handles')
        )
        .addSubcommandGroup(group =>
            group.setName('manage')
                .setDescription('Manage admin access')
                .addSubcommand(sub =>
                    sub.setName('add')
                        .setDescription('Add a user as admin')
                        .addUserOption(opt =>
                            opt.setName('user')
                                .setDescription('User to add as admin')
                                .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub.setName('remove')
                        .setDescription('Remove a user from admin')
                        .addUserOption(opt =>
                            opt.setName('user')
                                .setDescription('User to remove')
                                .setRequired(true)
                        )
                )
        ),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async execute(interaction, client) {
        try {
            // Check admin access
            const hasAccess = await hasAdminAccess(interaction.user, interaction.member);
            if (!hasAccess) {
                return interaction.reply({
                    content: 'You do not have permission to use admin commands.',
                    ephemeral: true
                });
            }

            // Fetch subcommand and subcommand group
            const subcommand = interaction.options.getSubcommand();
            const subcommandGroup = interaction.options.getSubcommandGroup(false); // Optional group

            // Handle subcommands and groups
            if (!subcommandGroup) {
                if (subcommand === 'viewhandles') {
                    console.log(`Executing subcommand: viewhandles`);
                    return require('./viewhandles').execute(interaction, client);
                }
            } else if (subcommandGroup === 'manage') {
                console.log(`Executing subcommand group: manage, subcommand: ${subcommand}`);
                return require('./manage').execute(interaction, client, subcommand);
            }

            // Fallback for unknown subcommands
            await interaction.reply({
                content: 'Unknown subcommand. Please use a valid admin subcommand.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error executing admin command:', error);
            await interaction.reply({
                content: 'An error occurred while executing admin commands. Please try again later.',
                ephemeral: true
            });
        }
    },
};
