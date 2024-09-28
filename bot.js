const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const mongoose = require('mongoose');
const Handle = require('./db'); // Ensure you have this model defined correctly

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const token = process.env.BOT_TOKEN;
const clientId = '1289536538333548606'; // Ensure this is a string
const guildId = '1121136965622956132'; // Ensure this is a string

// Register slash commands
const commands = [
    {
        name: 'create',
        description: 'Create a custom anonymous handle',
        options: [
            {
                name: 'handle',
                type: 3, // Use 3 for STRING
                description: 'The custom handle you want to use',
                required: true, // This can be kept since STRING supports required
            }
        ],
    }
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        console.log('Slash commands registered!');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`${client.user.tag} is now online!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'create') {
        const userId = interaction.user.id;
        const customHandle = interaction.options.getString('handle');

        // Check if handle is already taken
        const existingHandle = await Handle.findOne({ handle: customHandle });

        if (existingHandle) {
            return await interaction.reply({
                content: 'This handle is already taken! Try another one.',
                ephemeral: true
            });
        }

        // Save handle in the database
        const userHandle = new Handle({ userId, handle: customHandle });
        await userHandle.save();

        await interaction.reply({
            content: `Your anonymous handle has been set to **${customHandle}**!`,
            ephemeral: true
        });
    }
});

// Add Anon Messaging
client.on('messageCreate', async message => {
    if (message.content.startsWith('!anon')) {
        const userId = message.author.id;
        const anonMessage = message.content.slice(6).trim(); // Strip "!anon" part

        const userHandle = await Handle.findOne({ userId });

        if (!userHandle) {
            return message.reply("You haven't set a handle yet! Use /create to set one.");
        }

        if (anonMessage) {
            await message.channel.send(`**${userHandle.handle}:** ${anonMessage}`);
            await message.delete();
        }
    }
});

client.login(token);
