require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB connected!');
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err);
});

// Command collection
client.commands = new Collection();

// Load slash commands
function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadCommands(fullPath); // Recursive loading for nested directories
        } else if (file.name.endsWith('.js')) {
            const command = require(fullPath);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Command loaded: ${command.data.name}`);
            } else {
                console.warn(`⚠️ Invalid command file: ${file.name}`);
            }
        }
    }
}
const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

// Load event handlers
function loadEvents(dir) {
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    for (const file of files) {
        const event = require(path.join(dir, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`✅ Event loaded: ${event.name}`);
    }
}
const eventsPath = path.join(__dirname, 'events');
loadEvents(eventsPath);

// Handle uncaught errors and rejections
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// Start the bot
client.login(process.env.BOT_TOKEN).then(() => {
    console.log(`🤖 ${client.user.tag} is now online!`);
}).catch((err) => {
    console.error('❌ Bot login failed:', err);
})