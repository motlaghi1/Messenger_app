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

const Channel = mongoose.model("channel", channelSchema);

module.exports = { Channel };