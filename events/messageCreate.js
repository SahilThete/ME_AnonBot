const { DarkWebChannel, UserHandle } = require('../db');
const { MessageFlags, PermissionsBitField  } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith('!anon')) return;

        const anonMessage = message.content.slice(6).trim();
        if (!anonMessage) {
            return message.reply({
                content: 'Please provide a message to send anonymously.',
                flags: MessageFlags.Ephemeral, 
            });
        }

        let darkWeb, userHandle;
        try {
            darkWeb = await DarkWebChannel.findOne({ guildId: message.guild.id });
            userHandle = await UserHandle.findOne({ userId: message.author.id });
        } catch (error) {
            console.error('Database error:', error);
            return message.reply({
                content: 'An error occurred while checking setup. Please try again later.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (!darkWeb) {
            return message.reply({
                content: 'Anonymous message channel is not set up in this server.',
                flags: MessageFlags.Ephemeral,
            });
        }
        if (!userHandle) {
            return message.reply({
                content: 'You need to create an anonymous handle first. Use `/create` to set one up.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (message.channel.id !== darkWeb.channelId) {
            return message.reply({
                content: `Use <#${darkWeb.channelId}> for anonymous messages.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            await message.channel.send(`**${userHandle.handle}:** ${anonMessage}`);
            
            if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                await message.delete();
            } else {
                console.warn('Bot lacks permission to delete messages.');
            }

            const mentioned = anonMessage.match(/anon\d{4}/);
            if (mentioned) {
                const targetHandle = await UserHandle.findOne({ handle: mentioned[0] });
                if (targetHandle) {
                    try {
                        const targetUser = await client.users.fetch(targetHandle.userId);
                        await targetUser.send(
                            `You have a new anonymous message from ${userHandle.handle}: ${anonMessage}`
                        );
                    } catch (err) {
                        if (err.code === 50007) {
                            console.log(`DMs blocked for user ${targetHandle.userId}`);
                        } else {
                            console.error('Error sending anonymous DM:', err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error sending anonymous message:', error);
            return message.reply({
                content: 'An error occurred while processing your anonymous message.',
                flags: MessageFlags.Ephemeral, 
            });
        }
    },
};
