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

    async execute(interaction) {
        const customHandle = interaction.options.getString('handle');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const handlePattern = /^anon\d{4}$/;
        if (!handlePattern.test(customHandle)) {
            return interaction.reply({
                content: 'Invalid handle format! Use "anonXXXX" where XXXX is 4 digits.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const existingHandle = await UserHandle.findOne({ handle: customHandle, guildId });
        if (existingHandle) {
            return interaction.reply({
                content: 'This handle is already taken in this server!',
                flags: MessageFlags.Ephemeral,
            });
        }

        const userHandle = new UserHandle({ userId, guildId, handle: customHandle });
        await userHandle.save();

        return interaction.reply({
            content: `Your anonymous handle has been set to **${customHandle}**!`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
