const { Admin } = require('../db');

module.exports = {
    async hasAdminAccess(user, member) {
        const isAdmin = await Admin.findOne({ userId: user.id });
        const perms = member.permissions;
        return isAdmin || perms.has('ADMINISTRATOR') || perms.has('MANAGE_GUILD');
    }
};
