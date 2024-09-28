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
});

const Admin = mongoose.model('Admin', adminSchema);

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
        name: 'viewhandle',
        description: 'View your current anonymous handle',
    },
    {
        name: 'help',
        description: 'Get a list of commands and their usage',
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

// Function to check if a user is a God Admin
const isGodAdmin = async (userId) => {
    const godAdminIds = process.env.GOD_ADMIN_IDS.split(',').map(id => id.trim());
    return godAdminIds.includes(userId);
};

// Command interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Handle the ping command
    if (interaction.commandName === 'ping') {
        const latency = Math.round(client.ws.ping);
        const apiLatency = Date.now() - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latency', value: `${latency} ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency} ms`, inline: true }
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

    // View current anonymous handle
    if (interaction.commandName === 'viewhandle') {
        const userId = interaction.user.id;
        const userHandle = await Handle.findOne({ userId });

        if (!userHandle) {
            return await interaction.reply({
                content: "You haven't set a handle yet! Use /create to set one.",
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: `Your current anonymous handle is **${userHandle.handle}**.`,
            ephemeral: true,
        });
    }
    
    // Help command
    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help - Available Commands');

        // List general commands
        embed.addFields(
            { name: '**/ping**', value: 'Check the bot\'s latency', inline: false },
            { name: '**/create**', value: 'Create a custom anonymous handle', inline: false },
            { name: '**/viewhandle**', value: 'View your current anonymous handle', inline: false },
            { name: '**/help**', value: 'Get a list of commands and their usage', inline: false },
        );

        // Check if the user is God Admin or Admin
        const isGod = await isGodAdmin(interaction.user.id);
        const isAdminUser = await isAdmin(interaction.user.id);

        if (isGod || isAdminUser) {
            // List admin commands if the user is an admin
            embed.addFields(
                { name: '**/admin**', value: 'Admin commands', inline: false },
                { name: 'Subcommands:', value: '**- viewhandles**: View all anonymous handles\n**- analytics**: View analytics about the bot\n**- manage**: Manage admin access', inline: false }
            );
        }

        await interaction.reply({ embeds: [embed] });
    }

    // Admin commands
    if (interaction.commandName === 'admin') {
        // Check if the user is God Admin or Admin
        const isGod = await isGodAdmin(interaction.user.id);
        const isAdminUser = await isAdmin(interaction.user.id);

        if (interaction.options.getSubcommand() === 'viewhandles') {
            // If the user is not God Admin or Admin, deny access
            if (!isGod && !isAdminUser) {
                return await interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true,
                });
            }

            // Fetch all handles from the database
            const handles = await Handle.find();
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('All Anonymous Handles');

            handles.forEach(handle => {
                embed.addFields(
                    { name: `**User ID:** ${handle.userId}`, value: `**Handle:** ${handle.handle}`, inline: false }
                );
            });

            await interaction.reply({ embeds: [embed] });
        }

        // Manage admin access
        if (interaction.options.getSubcommand() === 'manage') {
            if (!isGod) {
                return await interaction.reply({
                    content: 'You do not have permission to manage admin access.',
                    ephemeral: true,
                });
            }

            const addUserId = interaction.options.getUser('add')?.id;
            const removeUserId = interaction.options.getUser('remove')?.id;

            // Add admin
            if (addUserId) {
                const existingAdmin = await Admin.findOne({ userId: addUserId });
                
                if (existingAdmin) {
                    return await interaction.reply({
                        content: `<@${addUserId}> is already an admin.`,
                        ephemeral: true
                    });
                }

                const admin = new Admin({ userId: addUserId });
                await admin.save();
                return await interaction.reply({
                    content: `<@${addUserId}> has been added as an admin.`,
                    ephemeral: true
                });
            }

            // Remove admin
            if (removeUserId) {
                const existingAdmin = await Admin.findOne({ userId: removeUserId });

                if (!existingAdmin) {
                    return await interaction.reply({
                        content: `<@${removeUserId}> is not an admin.`,
                        ephemeral: true
                    });
                }

                await Admin.deleteOne({ userId: removeUserId });
                return await interaction.reply({
                    content: `<@${removeUserId}> has been removed from admin status.`,
                    ephemeral: true
                });
            }
        }
    }
});

// Anonymous Messaging
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
