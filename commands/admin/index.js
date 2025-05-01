const { SlashCommandBuilder } = require('discord.js');

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

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandGroup = interaction.options.getSubcommandGroup(false);

        if (!subcommandGroup) {
            if (subcommand === 'viewhandles') {
                return require('./viewhandles').execute(interaction, client);
            }
        } else if (subcommandGroup === 'manage') {
            return require('./manage').execute(interaction, client, subcommand);
        }
    }
};
