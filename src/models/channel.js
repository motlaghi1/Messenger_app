const mongoose = require("mongoose");
const { Message } = require("./message");

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['global', 'direct', 'group'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: Number, // Changed to Number to store muid instead of _id
    ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});

// Create a new channel
async function createChannel(channelName, channelType, participants) {
  const channel = new Channel({
    name: channelName,
    type: channelType,
    participants,
  });
  return await channel.save();
}

// Add new participants to channel
async function updateChannel(channelID, newParticipants) {
  return await Channel.findByIdAndUpdate(
    channelID,
    { 
      $push: { participants: newParticipants },
      updatedAt: Date.now()
    },
    { new: true }
  );
}

// Send a message in a channel
async function sendMessage(senderID, channelID, content) {
  try {
    // Create new message
    const message = new Message({ 
      sender: senderID, 
      channel: channelID, 
      content 
    });
    
    // Save message
    await message.save();
    
    // Update channel with message's muid
    await Channel.findByIdAndUpdate(
      channelID,
      { 
        $push: { messages: message.muid }, 
        updatedAt: Date.now() 
      }
    );
    
    return message;
  } catch (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }
}

// Get message history for a channel
async function getMessageHistory(channelID, limit = 50) {
  try {
    // Get total message count
    const totalMessages = await Message.countDocuments({ channel: channelID });
    
    // Get messages sorted by newest first
    const messages = await Message.find({ channel: channelID })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('sender', 'username')
      .lean();
    
    return { 
      messages: messages.reverse(), 
      totalMessages 
    };
  } catch (error) {
    throw new Error(`Error fetching message history: ${error.message}`);
  }
}

// Count participants in channel
async function getChannelParticipantCount(channelId) {
  const channel = await Channel.findById(channelId);
  return channel.participants.length;
}

// Get all channels for a specific user
async function getUserChannels(userId) {
  return await Channel.find({
    participants: { $in: [userId] }
  }).populate('participants').populate({
    path: 'messages',
    model: 'Message'
  });
}

const Channel = mongoose.model("channel", channelSchema);

module.exports = { 
  Channel, 
  createChannel, 
  updateChannel, 
  sendMessage,
  getMessageHistory,
  getChannelParticipantCount, 
  getUserChannels 
};