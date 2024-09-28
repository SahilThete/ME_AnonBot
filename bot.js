const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const mongoose = require('mongoose');
const Handle = require('./db'); // Ensure you have this model defined correctly

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a schema for admins
const adminSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    isGod: { type: Boolean, default: false },
});

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
        name: 'ping',
        description: 'Check the bot\'s latency',
    },
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
    },
    {
        name: 'admin',
        description: 'Admin commands',
        options: [
            {
                name: 'viewhandles',
                type: 1, // Subcommand type
                description: 'View all anonymous handles',
            },
            {
                name: 'analytics',
                type: 1, // Subcommand type
                description: 'View analytics about the bot',
            },
            {
                name: 'manage',
                type: 1, // Subcommand type
                description: 'Manage admin access',
                options: [
                    {
                        name: 'add',
                        type: 6, // User type
                        description: 'User to add as admin',
                    },
                    {
                        name: 'remove',
                        type: 6, // User type
                        description: 'User to remove from admin',
                    },
                ],
            },
        ],
    },
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

// Middleware for admin check
async function isAdmin(userId) {
    const admin = await Admin.findOne({ userId });
    return admin !== null;
}

// Check if user is God Admin
async function isGodAdmin(userId) {
    const admin = await Admin.findOne({ userId, isGod: true });
    return admin !== null;
}

// Command interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Handle the ping command
    if (interaction.commandName === 'ping') {
        const pingEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latency', value: `${Math.round(client.ws.ping)} ms`, inline: true },
                { name: 'API Latency', value: `${Date.now() - interaction.createdTimestamp} ms`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [pingEmbed] });
    }

    // Create a custom handle
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

    // Admin commands
    if (interaction.commandName === 'admin') {
        // Check if the user is God Admin
        const isGod = await isGodAdmin(interaction.user.id);
        if (!isGod) {
            return await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
        }

        if (interaction.options.getSubcommand() === 'viewhandles') {
            const allHandles = await Handle.find({});
            const handlesList = allHandles.map(h => `User ID: ${h.userId}, Handle: ${h.handle}`).join('\n') || 'No handles found.';

            const handlesEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('All Anonymous Handles')
                .setDescription(handlesList);

            await interaction.reply({ embeds: [handlesEmbed] });
        }

        if (interaction.options.getSubcommand() === 'analytics') {
            const totalHandles = await Handle.countDocuments({});
            const analyticsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Bot Analytics')
                .addFields(
                    { name: 'Total Anonymous Handles', value: `${totalHandles}`, inline: true },
                );

            await interaction.reply({ embeds: [analyticsEmbed] });
        }

        // Manage admin access
        if (interaction.options.getSubcommand() === 'manage') {
            const addUserId = interaction.options.getUser('add')?.id;
            const removeUserId = interaction.options.getUser('remove')?.id;

            // Add admin
            if (addUserId) {
                const admin = new Admin({ userId: addUserId });
                await admin.save();
                return await interaction.reply({ content: `<@${addUserId}> has been added as an admin.`, ephemeral: true });
            }

            // Remove admin
            if (removeUserId) {
                await Admin.deleteOne({ userId: removeUserId });
                return await interaction.reply({ content: `<@${removeUserId}> has been removed from admin status.`, ephemeral: true });
            }
        }
    }
});

// Add Anon Messaging
client.on('messageCreate', async message => {
    if (message.content.startsWith('!anon')) {
        const userId = message.author.id;
        const anonMessage = message.content.slice(6).trim(); // Strip "!anon" part

        // Check if the message contains an anonymous handle
        const mentionedHandleMatch = anonMessage.match(/(anon\d{4})/); // Regex to match 'anonXXXX'
        let notifiedUserId = null;

        if (mentionedHandleMatch) {
            const mentionedHandle = mentionedHandleMatch[0];

            // Find the user associated with the mentioned handle
            const userHandle = await Handle.findOne({ handle: mentionedHandle });

            if (userHandle) {
                notifiedUserId = userHandle.userId; // Get the user ID associated with the handle
            }
        }

        // Retrieve the user's handle from the database
        const userHandle = await Handle.findOne({ userId });

        if (!userHandle) {
            return message.reply("You haven't set a handle yet! Use /create to set one.");
        }

        // Send the anonymous message
        if (anonMessage) {
            await message.channel.send(`**${userHandle.handle}:** ${anonMessage}`);
            await message.delete(); // Optionally delete the original message
        }

        // Notify the mentioned user if found
        if (notifiedUserId) {
            const mentionedUser = await client.users.fetch(notifiedUserId);
            if (mentionedUser) {
                await mentionedUser.send(`You have a new message from **${userHandle.handle}**: ${anonMessage}`);
            }
        }
    }
});


client.login(token);
