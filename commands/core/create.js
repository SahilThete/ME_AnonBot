const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { UserHandle } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a custom anonymous handle')
        .addStringOption(option =>
            option.setName('handle')
                .setDescription('The custom handle (e.g., anon1234)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const handle = interaction.options.getString('handle');
        const pattern = /^anon\d{4}$/;

        // Check for handle format
        if (!pattern.test(handle)) {
            return interaction.reply({
                content: 'Invalid handle format. Please use `anonXXXX` (4 digits).',
                flags: MessageFlags.Ephemeral
            });
        }

        // Check if user already has a handle in this guild
        const existingHandle = await UserHandle.findOne({ userId, guildId });
        
        if (existingHandle) {
            return interaction.reply({
                content: `You already have an anonymous handle: **${existingHandle.handle}**. You can't create a new one.`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Check if the handle is already taken by another user in this guild
        const handleTaken = await UserHandle.findOne({ handle, guildId });
        if (handleTaken) {
            return interaction.reply({
                content: 'That handle is already taken by another user. Please choose a different one.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Create the new handle
        try {
            await UserHandle.create({
                userId,
                guildId,
                handle
            });

            return interaction.reply({
                content: `Your anonymous handle is successfully set to **${handle}**.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            if (error.code === 11000) {
                return interaction.reply({
                    content: 'That handle is already taken, or you already have a handle in this server.',
                    flags: MessageFlags.Ephemeral
                });
            }

            console.error('Error creating anonymous handle:', error);

            return interaction.reply({
                content: 'Unable to create your handle right now. Please try again later.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
