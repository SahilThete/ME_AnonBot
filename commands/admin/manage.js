const { Admin, AdminAction } = require('../../db');
const { MessageFlags } = require('discord.js');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    async execute(interaction, client, subcommand) {
        const isAllowed = await hasAdminAccess(interaction.user, interaction.member);
        if (!isAllowed) {
            return interaction.reply({
                content: 'You do not have permission to manage admins.',
                flags: MessageFlags.Ephemeral
            });
        }

        const targetUser = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        if (subcommand === 'add') {
            const exists = await Admin.findOne({ userId: targetUser.id });
            if (exists) {
                return interaction.reply({ content: `<@${targetUser.id}> is already an admin.`, flags: MessageFlags.Ephemeral });
            }

            await new Admin({ userId: targetUser.id }).save();
            await new AdminAction({
                actionType: 'add',
                performedBy: interaction.user.id,
                targetUserId: targetUser.id,
                guildId
            }).save();

            return interaction.reply({ content: `<@${targetUser.id}> has been added as an admin.`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'remove') {
            const exists = await Admin.findOne({ userId: targetUser.id });
            if (!exists) {
                return interaction.reply({ content: `<@${targetUser.id}> is not an admin.`, flags: MessageFlags.Ephemeral });
            }

            await Admin.deleteOne({ userId: targetUser.id });
            await new AdminAction({
                actionType: 'remove',
                performedBy: interaction.user.id,
                targetUserId: targetUser.id,
                guildId
            }).save();

            return interaction.reply({ content: `<@${targetUser.id}> has been removed from admins.`, flags: MessageFlags.Ephemeral });
        }
    }
};
