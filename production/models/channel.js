const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    name: String,
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
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: Date.now()},
});

// Static methods for channel operations
channelSchema.statics.createGlobalChannel = async function() {
    const existingGlobal = await this.findOne({ type: 'global' });
    if (existingGlobal) {
        return existingGlobal;
    }

    const globalChannel = new this({
        name: 'Global Chat',
        type: 'global',
        participants: [],
        messages: [],
    });

    return await globalChannel.save();
};

channelSchema.statics.createDirectMessageChannel = async function(user1Id, user2Id) {
    const existingChannel = await this.findOne({
        type: 'direct',
        participants: { 
            $all: [user1Id, user2Id],
            $size: 2
        }
    });

    if (existingChannel) {
        return existingChannel;
    }

    const dmChannel = new this({
        name: `DM: ${user1Id} & ${user2Id}`,
        type: 'direct',
        participants: [user1Id, user2Id],
        messages: [],
    });

    return await dmChannel.save();
};

channelSchema.statics.createGroupChannel = async function(name, participantIds) {
    const groupChannel = new this({
        name,
        type: 'group',
        participants: participantIds,
        messages: [],
    });

    return await groupChannel.save();
};

channelSchema.statics.getChannelMessages = async function(channelId) {
    return await this.findById(channelId)
        .populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'name id'
            }
        });
};

const Channel = mongoose.model("Channel", channelSchema);

module.exports = { Channel };