const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    type: {
        type: String,
        enum: ['global', 'direct', 'group'],
        required: true,
    },
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    messages: [{ 
        type: mongoose.Schema.Types.ObjectId, 
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

//creates new channel
async function createChannel(channelName, channelType, [participants]) {
    const channel = new Channel({
        channelName,
        channelType,
        participants,
    });

    return await channel.save();
}

//adds new participants to channel
async function updateChannel(channelID, [newParticipants]) {
    return await Channel.findOneAndUpdate(
        { id: channelID },
        { $push: {participants: newParticipants}}
    );
}

//counts participants in channel
async function getChannelParticipantCount(channelId) {
    const channel = await Channel.findById(channelId);
    return channel.participants.length;
}

//get all channels for a specific user
async function getUserChannels(userId) {
    return await Channel.find({ 
      participants: { $in: [userId] } 
    }).populate('participants').populate('messages');
}

const Channel = mongoose.model("channel", channelSchema);

module.exports = { Channel, createChannel, updateChannel };