const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

// Create a schema for the storing user handle
const userHandleSchema = new mongoose.Schema({
    userId: String,
    handle: String,
});

const UserHandle = mongoose.model('UserHandle', userHandleSchema);

// Create a schema for the dark web channel
const darkWebChannelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
});

const DarkWebChannel = mongoose.model('DarkWebChannel', darkWebChannelSchema);


module.exports = { UserHandle, DarkWebChannel };