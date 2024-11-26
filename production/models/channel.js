const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {  
        type: String,
        default: null
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

channelSchema.statics.createGroupChannel = async function(name, password, creatorId) {
    const existingChannel = await this.findOne({ name, type: 'group' });
    if (existingChannel) {
        throw new Error('Group name already exists');
    }

    const groupChannel = new this({
        name,
        type: 'group',
        password: password || null,
        participants: [creatorId],
        messages: []
    });

    return await groupChannel.save();
};

channelSchema.statics.joinGroupChannel = async function(name, password, userId) {
    const channel = await this.findOne({ name, type: 'group' });
    if (!channel) {
        throw new Error('Group not found');
    }

    // Check password only if channel has a password
    if (channel.password) {
        if (!password || channel.password !== password) {
            throw new Error('Incorrect password');
        }
    }

    // Add user if not already a participant
    if (!channel.participants.includes(userId)) {
        channel.participants.push(userId);
        await channel.save();
    }
    
    return channel;
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