const { Admin } = require('../db');

/**
 * Checks if the user has admin access in the server or is a superadmin.
 * 
 * @param {import('discord.js').User} user - The user to check.
 * @param {import('discord.js').GuildMember} member - The guild member object for the user.
 * @returns {Promise<boolean>} - True if the user has admin access, false otherwise.
 */
async function hasAdminAccess(user, member) {
    try {
        // Check if the user is a superadmin (server admin with 'ADMINISTRATOR' permission)
        if (member.permissions.has('ADMINISTRATOR')) {
            return true; // Superadmins have full access
        }

        // Check if the user is listed as a bot admin in the database
        const isBotAdmin = await Admin.findOne({ userId: user.id });

        // Check if the user has the 'MANAGE_GUILD' permission (secondary bot-admin permission)
        const hasManageGuildPerms = member.permissions.has('MANAGE_GUILD');

        // Return true if the user is a bot admin or has 'MANAGE_GUILD' permissions
        return Boolean(isBotAdmin || hasManageGuildPerms);
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false; // Default to no admin access if an error occurs
    }
}

module.exports = { hasAdminAccess };
