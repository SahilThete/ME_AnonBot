const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { UserHandle } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a custom anonymous handle')
        .addStringOption(option =>
            option.setName('handle')
                .setDescription('The custom handle (format: anon1234)')
                .setRequired(true)
        ),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            const customHandle = interaction.options.getString('handle');
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            // Check if the handle follows the required format
            const handlePattern = /^anon\d{4}$/;
            if (!handlePattern.test(customHandle)) {
                return interaction.reply({
                    content: 'Invalid handle format! Use "anonXXXX" where XXXX is 4 digits.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Check if the user already has a handle in the server
            const userHandle = await UserHandle.findOne({ userId, guildId });
            if (userHandle) {
                return interaction.reply({
                    content: `You already have a handle registered: **${userHandle.handle}**. You cannot create a new one.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Check if the desired handle is already taken
            const existingHandle = await UserHandle.findOne({ handle: customHandle, guildId });
            if (existingHandle) {
                return interaction.reply({
                    content: `The handle **${customHandle}** is already taken in this server. Please choose a different one.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Create and save the new handle
            const newHandle = new UserHandle({ userId, guildId, handle: customHandle });
            await newHandle.save();

            return interaction.reply({
                content: `Your anonymous handle has been successfully set to **${customHandle}**!`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Error creating anonymous handle:', error);
            return interaction.reply({
                content: 'An error occurred while creating your anonymous handle. Please try again later.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
