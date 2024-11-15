const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    type: String,         // 'global', 'group', or 'dm'
    sender: String,       // User ID
    recipient: String,    // User/Group ID (for non-global)
    content: String,      // Message content
    timestamp: Date,      // When sent
    status: String,       // Message status
});

const Message = mongoose.model("message", messageSchema);

module.export= {Message}