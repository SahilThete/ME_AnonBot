const mongoose = require('mongoose');

// User handle schema
const userHandleSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    handle: { type: String, required: true },
}, {
    timestamps: true
});

// Enforce one handle per user per guild
userHandleSchema.index(
    { guildId: 1, userId: 1 },
    { unique: true }
);

// Enforce unique handles within each guild
userHandleSchema.index(
    { guildId: 1, handle: 1 },
    { unique: true }
);

const UserHandle = mongoose.model('UserHandle', userHandleSchema);

// Anonymous channel schema
const darkWebChannelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
});

const DarkWebChannel = mongoose.model('DarkWebChannel', darkWebChannelSchema);

// Admin schema
const adminSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

adminSchema.index({ userId: 1, guildId: 1 }, { unique: true });

const Admin = mongoose.model('Admin', adminSchema);

// Admin action logging schema
const adminActionSchema = new mongoose.Schema({
    actionType: { type: String, required: true },
    performedBy: { type: String, required: true },
    targetUserId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    guildId: { type: String, required: true },
});

const AdminAction = mongoose.model('AdminAction', adminActionSchema);

// Export models only. MongoDB connection is managed by bot.js.
module.exports = {
    UserHandle,
    DarkWebChannel,
    Admin,
    AdminAction
};
