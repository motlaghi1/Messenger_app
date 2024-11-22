const mongoose = require("mongoose");
const autoIncrement = require('mongoose-sequence')(mongoose);

const messageSchema = new mongoose.Schema({
    muid: {
        type: Number,
        required: true,
        unique: true
    },
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

//auto-increment plugin for muid
messageSchema.plugin(autoIncrement, {
    id: 'messageUniqueIdCounter',
    inc_field: 'muid',
    start_seq: 1
  });

module.exports = {
    Message
};