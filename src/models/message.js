const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    senderID: { type: String, required: true }, // ID of the sender
    recipientID: { type: String, required: true }, // ID of the recipient
    content: { type: String, required: true }, // Message content
    timestamp: { type: Date, default: Date.now }, // Time the message was sent
    delivered: { type: Boolean, default: false } // Delivery status
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
