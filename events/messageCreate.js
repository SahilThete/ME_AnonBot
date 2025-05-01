const { DarkWebChannel, UserHandle } = require('../db');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith('!anon')) return;

        const anonMessage = message.content.slice(6).trim();
        const darkWeb = await DarkWebChannel.findOne({ guildId: message.guild.id });
        const userHandle = await UserHandle.findOne({ userId: message.author.id });

        if (!darkWeb || !userHandle) {
            return message.reply({ content: 'Setup not complete or handle missing.', ephemeral: true });
        }

        if (message.channel.id !== darkWeb.channelId) {
            return message.reply({ content: `Use <#${darkWeb.channelId}> for anonymous messages.`, ephemeral: true });
        }

        await message.channel.send(`**${userHandle.handle}:** ${anonMessage}`);
        await message.delete();

        const mentioned = anonMessage.match(/anon\d{4}/);
        if (mentioned) {
            const targetHandle = await UserHandle.findOne({ handle: mentioned[0] });
            if (targetHandle) {
                try {
                    const targetUser = await client.users.fetch(targetHandle.userId);
                    await targetUser.send(`You have a new anonymous message from ${userHandle.handle}: ${anonMessage}`);
                } catch (err) {
                    if (err.code === 50007) {
                        console.log(`DMs blocked for user ${targetHandle.userId}`);
                    }
                }
            }
        }
    }
};
