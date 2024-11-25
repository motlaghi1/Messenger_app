// src/services/messageService.js
const { Channel } = require('../models/channel');
const { Message } = require('../models/message');

async function sendMessage(channelId, content, senderId) {
    const channel = channelId === 'global'
        ? await Channel.findOne({ type: 'global' })
        : await Channel.findById(channelId);

    if (!channel) {
        throw new Error('Channel not found');
    }

    const message = new Message({
        content,
        sender: senderId,
        timestamp: new Date()
    });

    await message.save();
    channel.messages.push(message._id);
    channel.updatedAt = new Date();
    await channel.save();

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name id');

    return populatedMessage;
}

module.exports = { sendMessage };
