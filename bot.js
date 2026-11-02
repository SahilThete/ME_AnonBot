require('dotenv').config();

const {Client, GatewayIntentBits, Collection} = require('discord.js');

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Command collection
client.commands = new Collection();

// Load commands recursively from commands/
function loadCommands(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error(`Commands directory not found: ${directory}`);
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        const command = require(fullPath);

        if (!command.data || !command.execute) {
            console.warn(`⚠️ Skipping invalid command: ${fullPath}`);
            continue;
        }

        const commandName = command.data.name;

        if (client.commands.has(commandName)) {
            throw new Error(`Duplicate command detected: ${commandName}`);
        }

        client.commands.set(commandName, command);

        console.log(`✅ Loaded command: ${commandName}`);
    }
}

// Load event files
function loadEvents(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error(`Events directory not found: ${directory}`);
    }

    const eventFiles = fs.readdirSync(directory)
        .filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(directory, file);
        const event = require(filePath);

        if (!event.name || typeof event.execute !== 'function') {
            console.warn(`⚠️ Skipping invalid event: ${file}`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        console.log(`✅ Loaded event: ${event.name}`);
    }
}

// Start the bot
async function startBot() {
    try {
        // Validate environment variables
        if (!process.env.BOT_TOKEN) {
            throw new Error('BOT_TOKEN is missing from .env');
        }

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from .env');
        }

        // Load commands and events
        loadCommands(path.join(__dirname, 'commands'));
        loadEvents(path.join(__dirname, 'events'));

        // Connect MongoDB first
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('\n🗄️ MongoDB connected successfully!');

        // Login to Discord only after successful DB connection
        await client.login(process.env.BOT_TOKEN);

    } catch (error) {
        console.error('\n❌ Bot startup failed:', error.message);

        await mongoose.disconnect().catch(() => {});

        client.destroy();

        process.exit(1);
    }
}

client.once('clientReady', () => {
    console.log(`\n🤖 ${client.user.tag} is now online!`);
    console.log(`📦 Registered commands: ${client.commands.size}`);
});

startBot();

// Graceful shutdown
let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`\n➜] Received ${signal}. Shutting down bot...`);

    try {
        client.destroy();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        console.log('\n📴 Bot shutdown completed.');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));