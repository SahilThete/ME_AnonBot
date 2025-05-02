const { MessageFlags, SlashCommandSubcommandBuilder } = require('discord.js');
const { Admin, AdminAction } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('manage')
        .setDescription('Manage admin users (admin-only)')
        .addUserOption(opt =>
            opt.setName('add')
                .setDescription('User to add as admin')
                .setRequired(false)
        )
        .addUserOption(opt =>
            opt.setName('remove')
                .setDescription('User to remove from admin')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const addUser = interaction.options.getUser('add');
        const removeUser = interaction.options.getUser('remove');

        const isAdmin = await hasAdminAccess(interaction.user, interaction.member);
        if (!isAdmin) {
            return interaction.reply({
                content: 'You do not have permission to manage admins.',
                flags: MessageFlags.Ephemeral
            });
        }

        // ADD ADMIN
        if (addUser) {
            const existing = await Admin.findOne({ userId: addUser.id, guildId });
            if (existing) {
                return interaction.reply({
                    content: `<@${addUser.id}> is already an admin.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await Admin.create({ userId: addUser.id, guildId }); 
            await AdminAction.create({
                actionType: 'add',
                performedBy: interaction.user.id,
                targetUserId: addUser.id,
                guildId
            });

            return interaction.reply({
                content: `<@${addUser.id}> has been added as admin.`,
                flags: MessageFlags.Ephemeral
            });
        }

        // REMOVE ADMIN
        if (removeUser) {
            const existing = await Admin.findOne({ userId: removeUser.id, guildId });
            if (!existing) {
                return interaction.reply({
                    content: `<@${removeUser.id}> is not an admin.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await Admin.deleteOne({ userId: removeUser.id, guildId }); 
            await AdminAction.create({
                actionType: 'remove',
                performedBy: interaction.user.id,
                targetUserId: removeUser.id,
                guildId
            });

            return interaction.reply({
                content: `<@${removeUser.id}> has been removed from admin.`,
                flags: MessageFlags.Ephemeral
            });
        }

        // NEITHER ADD NOR REMOVE USED
        return interaction.reply({
            content: 'Please specify a user to add or remove.',
            flags: MessageFlags.Ephemeral
        });
    }
};
