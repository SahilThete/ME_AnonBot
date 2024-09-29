const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

// Create a schema for the storing user handle
const userHandleSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  // New field for guild ID
    userId: { type: String, required: true },
    handle: { type: String, required: true },
});
const UserHandle = mongoose.model('UserHandle', userHandleSchema);

// Create a schema for the dark web channel
const darkWebChannelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
});
const DarkWebChannel = mongoose.model('DarkWebChannel', darkWebChannelSchema);

module.exports = { UserHandle, DarkWebChannel };