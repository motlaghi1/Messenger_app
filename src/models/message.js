const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    senderID: { type: String, required: true }, // ID of the sender
    recipientID: { type: String, required: true }, // ID of the recipient
    content: { type: String, required: true }, // Message content
    timestamp: { type: Date, default: Date.now }, // Time the message was sent
    delivered: { type: Boolean, default: false } // Delivery status 
});

const Message = mongoose.model('Message', messageSchema);

//send a message
async function sendMessage(senderID, recipientID, content) {
    const message = new Message({ senderID, recipientID, content });
    await message.save();
    return message; // Returns the saved message
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
            .sort({timestamp:-1}) //always show newest first
            .limit(limit) //only shows 50 at a time
            .lean(); //converts MongoDB object to plain JS object for better query performance

        return {
            messages: messages.reverse(), //reverse to show in chronological order
            totalMessages
        };
    } catch (error) {
        throw new Error(`Error fetching message history: ${error.message}`);
    }
}

//update delivery status of message
async function markAsDelivered(messageID) {
    return Message.updateOne({ _id: messageID }, { $set: { delivered: true } });
}

module.exports = Message;
