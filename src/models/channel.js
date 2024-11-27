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
        required: true
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

channelSchema.statics.createGroupChannel = async function(name, password, userId) {
    try {
        // Check if group already exists
        const existingChannel = await this.findOne({ name, type: 'group' });
        if (existingChannel) {
            throw new Error('Group name already exists');
        }

        // Create new group channel
        const groupChannel = new this({
            name: name,
            type: 'group',  // Make sure type is set
            password: password || null,
            participants: [userId],
            messages: []
        });

        console.log('Creating group channel:', groupChannel); // Add logging
        const savedChannel = await groupChannel.save();
        console.log('Saved channel:', savedChannel); // Add logging
        return savedChannel;
    } catch (error) {
        console.error('Error creating group channel:', error);
        throw error;
    }
};

channelSchema.statics.joinGroupChannel = async function(name, password, userId) {
    try {
        const channel = await this.findOne({ name, type: 'group' });
        if (!channel) {
            throw new Error('Group not found');
        }

        // Check password if the group is private
        if (channel.password && channel.password !== password) {
            throw new Error('Incorrect password');
        }

        // Check if user is already a participant
        if (channel.participants.includes(userId)) {
            throw new Error('Already a member of this group');
        }

        // Add user to participants
        channel.participants.push(userId);
        await channel.save();

        return channel;
    } catch (error) {
        console.error('Error joining group channel:', error);
        throw error;
    }
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

async function findChannelById(channelId) {
    return await Channel.findOne({_id: channelId});
}


module.exports = { Channel, findChannelById };