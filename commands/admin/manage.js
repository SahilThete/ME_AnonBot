const { Admin, AdminAction } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     * @param {string} subcommand - The specific subcommand being executed (add/remove)
     */
    async execute(interaction, client, subcommand) {
        try {
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
                const exists = await Admin.findOne({ userId: targetUser.id });
                if (exists) {
                    return interaction.reply({
                        content: `<@${targetUser.id}> is already an admin.`,
                        ephemeral: true
                    });
                }

                await new Admin({ userId: targetUser.id }).save();
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
                const exists = await Admin.findOne({ userId: targetUser.id });
                if (!exists) {
                    return interaction.reply({
                        content: `<@${targetUser.id}> is not an admin.`,
                        ephemeral: true
                    });
                }

                await Admin.deleteOne({ userId: targetUser.id });
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
            console.error('Error managing admins:', error);
            return interaction.reply({
                content: 'An error occurred while managing admins. Please try again later.',
                ephemeral: true
            });
        }
    },
};
