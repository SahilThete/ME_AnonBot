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
            userHandle = await UserHandle.findOne({ userId: message.author.id, guildId: message.guild.id });
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
            // Send the anonymous message in the designated channel
            await message.channel.send(`**${userHandle.handle}:** ${anonMessage}`);
            
            // Check if the bot has permission to delete messages
            if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                await message.delete();             // Delete the original message for anonymity
            } else {
                console.warn('Bot lacks permission to delete messages.');
            }
        
            // Check if the message contains a mentioned handle (e.g., 'anonXXXX')
            const mentioned = anonMessage.match(/anon\d{4}/);           // Regex to match 'anonXXXX'
        
            if (mentioned) {
                const mentionedHandle = mentioned[0];
        
                // Query for the mentioned handle within the same guild
                const targetHandle = await UserHandle.findOne({ handle: mentionedHandle, guildId: message.guild.id });
        
                if (targetHandle) {
                    try {
                        // Fetch the user associated with the mentioned handle
                        const targetUser = await client.users.fetch(targetHandle.userId);
                        
                        // Send a DM notification to the mentioned user
                        await targetUser.send(
                            `You have a new anonymous message from **${userHandle.handle}**: ${anonMessage}`
                        );
                    } catch (err) {
                        if (err.code === 50007) {
                            console.error(`DMs blocked for user ${targetHandle.userId}`);
                            
                            // Notify the sender about DM failure
                            await message.reply({
                                content: `I couldn't send a DM to the user you mentioned. They may have DMs disabled or blocked the bot.`,
                                flags: MessageFlags.Ephemeral
                            });
                        } else {
                            console.error('Error sending anonymous DM:', err);
                        }
                    }
                }
            }
        } catch (error) {
            // Log any unexpected errors during the process
            console.error('Error sending anonymous message:', error);
        
            // Inform the sender about the failure
            await message.reply({
                content: 'An error occurred while processing your anonymous message. Please try again later.',
                flags: MessageFlags.Ephemeral // Updated with flags for ephemeral response
            });
        }
    },
};
