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
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now  
    },
});

const Message = mongoose.model("message", messageSchema);

module.exports = { Message };

//send a message
async function sendMessage(senderID, recipientID, content) {
    try {
        const message = new Message({ senderID, recipientID, content });
        await message.save();
        return message;
    } catch (error) {
        throw new Error(`Error sending message: ${error.message}`);
    }
}


//retrieve message history between two users
async function getMessageHistory(user1, user2, limit = 50) {
    try {
        //query to match messages between two users sent in either direction
        const query = {
            $or: [
                {senderID: user1, recipientID: user2},
                {senderID: user2, recipientID: user1}
            ]
        };

        //get total message count
        const totalMessages = await Message.countDocuments(query);

        //get messages sorted by newest first
        const messages = await Message.find(query)
        .sort({ timestamp: 1 }) // Sorted in chronological order directly
        .limit(limit)
        .lean();
        
        return { messages, totalMessages };
        
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