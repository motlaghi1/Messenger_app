// src/socket-server.js
const { sendMessage } = require('./services/messageService');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on('send-message', async (data, chatId = 'global') => {
            try {
                const user = socket.request.session.user;
                if (!user) {
                    console.error('User not authenticated');
                    return;
                }

                const message = await sendMessage(chatId, data, user._id);
                console.log('Message sent:', message);

                // Broadcast the message to other clients
                if (chatId === 'global') {
                    socket.broadcast.emit('response', user, data, chatId);
                    console.log('Emitting to global chat');
                } else {
                    io.to(chatId).emit('response', user, data, chatId);
                    console.log(`Emitting to chat room ${chatId}`);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('join-room', (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
