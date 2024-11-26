// src/socket-server.js
const { sendMessage } = require('./services/messageService');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('chat-message', async (data, callback) => {
            try {
                const user = socket.request.session.user;
                if (!user) {
                    callback({ success: false, error: 'Not authenticated' });
                    return;
                }

                // Save to database
                const message = await sendMessage(data.chatId, data.content, user._id);

                // Broadcast to room
                io.to(data.chatId).emit('chat-message', {
                    content: data.content,
                    chatId: data.chatId,
                    senderId: user._id,
                    senderName: user.name,
                    timestamp: data.timestamp,
                    messageId: message._id
                });

                callback({ success: true, messageId: message._id });

            } catch (error) {
                console.error('Error handling message:', error);
                callback({ success: false, error: 'Failed to process message' });
            }
        });

        // Room management
        socket.on('join-room', (room) => {
            socket.join(room);
        });
        socket.on('leave-room', (room) => {
            socket.leave(room);
            console.log(`Socket ${socket.id} left room: ${room}`);
        });
    });
};
