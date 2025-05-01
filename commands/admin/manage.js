const { SlashCommandBuilder } = require('discord.js');
const { Admin, AdminAction } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manage')
        .setDescription('Manage admin access')
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Add a user to the admin list')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to add as an admin')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove a user from the admin list')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove as an admin')
                        .setRequired(true))
        ),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async execute(interaction, client) {
        try {
            // Get the subcommand (add/remove)
            const subcommand = interaction.options.getSubcommand();
            const isAllowed = await hasAdminAccess(interaction.user, interaction.member);

            // Permission check for the user
            if (!isAllowed) {
                return interaction.reply({
                    content: 'You do not have permission to manage admins.',
                    ephemeral: true
                });
            }

            // Fetch the target user and guild ID
            const targetUser = interaction.options.getUser('user');
            const guildId = interaction.guild.id;

            if (subcommand === 'add') {
                // Check if the target user is already an admin
                const exists = await Admin.findOne({ userId: targetUser.id });
                if (exists) {
                    return interaction.reply({
                        content: `<@${targetUser.id}> is already an admin.`,
                        ephemeral: true
                    });
                }

                // Add the user as admin in the database
                await new Admin({ userId: targetUser.id }).save();

                // Log the action in the AdminAction collection
                await new AdminAction({
                    actionType: 'add',
                    performedBy: interaction.user.id,
                    targetUserId: targetUser.id,
                    guildId
                }).save();

                return interaction.reply({
                    content: `<@${targetUser.id}> has been added as an admin.`,
                    ephemeral: true
                });
            }

            if (subcommand === 'remove') {
                // Check if the target user is an admin
                const exists = await Admin.findOne({ userId: targetUser.id });
                if (!exists) {
                    return interaction.reply({
                        content: `<@${targetUser.id}> is not an admin.`,
                        ephemeral: true
                    });
                }

                // Remove the user from the admin database
                await Admin.deleteOne({ userId: targetUser.id });

                // Log the action in the AdminAction collection
                await new AdminAction({
                    actionType: 'remove',
                    performedBy: interaction.user.id,
                    targetUserId: targetUser.id,
                    guildId
                }).save();

                return interaction.reply({
                    content: `<@${targetUser.id}> has been removed from admins.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            // Log and handle any errors
            console.error('Error managing admins:', error);
            return interaction.reply({
                content: 'An error occurred while managing admins. Please try again later.',
                ephemeral: true
            });
        }
    },
};
