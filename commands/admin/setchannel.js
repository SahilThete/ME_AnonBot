const { ChannelType, MessageFlags, SlashCommandBuilder } = require('discord.js');
const { DarkWebChannel } = require('../../db');
const { hasAdminAccess } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel for anonymous messaging')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to set as the anonymous message destination')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.member;
        const user = interaction.user;
        const guildId = interaction.guild.id;
        const channel = interaction.options.getChannel('channel');

        const isAdmin = await hasAdminAccess(user, member);
        if (!isAdmin) {
            return interaction.reply({
                content: 'You do not have permission to set the channel.',
                flags: MessageFlags.Ephemeral,
            });
        }

        let config = await DarkWebChannel.findOne({ guildId });
        if (config) {
            config.channelId = channel.id;
        } else {
            config = new DarkWebChannel({ guildId, channelId: channel.id });
        }

        await config.save();

        return interaction.reply({
            content: `Anonymous messages will now be accepted in <#${channel.id}>.`,
        });
    },
};
