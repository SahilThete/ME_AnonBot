async function hasAdminAccess(user, member) {
    const isAdmin = await Admin.findOne({ userId: user.id });
    const perms = member.permissions;
    return isAdmin || perms.has('ADMINISTRATOR') || perms.has('MANAGE_GUILD');
}

module.exports = { hasAdminAccess };
