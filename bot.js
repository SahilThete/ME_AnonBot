const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// // connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('🟢 MongoDB connected'))
//     .catch(err => console.error('🔴 MongoDB connection failed:', err));

// Command collection
client.commands = new Collection();

// dynamically load event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Start the bot
client.login(process.env.BOT_TOKEN)
    .then(() => console.log(`🤖 ${client.user.tag} is now online!`))
    .catch(err => console.error('❌ Bot login failed:', err));

