const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

messageSchema.statics.createMessage = async function(channelId, senderId, content) {
    const message = new this({
        content,
        sender: senderId,
        timestamp: new Date()
    });

    const savedMessage = await message.save();

    // Update the channel with the new message
    await mongoose.model('Channel').findByIdAndUpdate(
        channelId,
        { 
            $push: { messages: savedMessage._id },
            updatedAt: new Date()
        }
    );

    return savedMessage;
};

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };