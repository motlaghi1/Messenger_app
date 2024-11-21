const mongoose = require("mongoose");
const { Channel } = require("./channel");

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
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now  
    }
});

const Message = mongoose.model("message", messageSchema);

//send a message
async function sendMessage(senderID, channelID, content) {
    try {
        //create a new message
        const message = new Message({ sender: senderID, channel: channelID, content });
        
        //save message to DB
        await message.save();

        //add message ID to channel's messages array
        await Channel.updateOne(
            {id: channelID},
            {$push: {messages: message._id}, updatedAt: Date.now()}
        );

        return message;
    } catch (error) {
        throw new Error(`Error sending message: ${error.message}`);
    }
}


//retrieve message history between two users
async function getMessageHistory(channelID, limit = 50) {
    try {

        //get total message count
        const totalMessages = await Message.countDocuments({channel: channelID});

        //get messages sorted by newest first
        const messages = await Message.find({channel: channelID})
        .sort({ timestamp: -1 }) //newest messages first
        .limit(limit)
        .populate('sender', 'username') //populate sender details
        .lean(); //change DB object to JS object for easier frontend manipulation
        
        return { messages: messages.reverse(), totalMessages }; 
        
    } catch (error) {
        throw new Error(`Error fetching message history: ${error.message}`);
    }
}

//update delivery status of message
async function markAsDelivered(messageID) {
    return Message.updateOne({ _id: messageID }, { $set: { delivered: true } });
}

module.exports = {
    Message,
    sendMessage,
    getMessageHistory,
    markAsDelivered,
};