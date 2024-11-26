// src/socket-server.js
const { sendMessageToChannel } = require('./services/messageService');
const { updateUser, findUserByHashId } = require('./models/user');
const { findChannelById } = require('./models/channel');

module.exports = (io) => {
    io.on('connection', async (socket) => {
        // Assign new socket to connected user
        console.log(`New connection: ${socket.id}`);
        const user = socket.request.session.user;
        if (user) {
            console.log(await updateUser(user.id, { socket_id: socket.id }))
        }

        socket.on('send-message', async (data, chatId = 'global', currentUserId) => {
            try {
                if (!user) {
                    console.error('User not authenticated');
                    return;
                }


                let channel = (chatId !== 'global') ? await findChannelById(chatId) : null
                let targetUserId = null
                if (channel) {
                    targetUserId = channel.participants.find(p => p.toString() !== currentUserId.toString());
                } else {
                    console.log('\x1b[36m%s\x1b[5m', `There is no channel`)
                }


                const targetUser = await findUserByHashId(targetUserId)
                console.log('\x1b[93m%s\x1b[5m', `THE TARGET USER IS HERE: ${targetUser} ${targetUserId}`)
                const message = await sendMessageToChannel(chatId, data, user._id);
                const roomId = (targetUser) ? targetUser.socket_id : chatId
                console.log('\x1b[36m%s\x1b[0m', `Message sent: ${message.content}`);
                console.log('\x1b[36m%s\x1b[0m', `chat id: ${chatId}`)
                
                if (chatId === 'global') {
                    socket.broadcast.emit('response', user, data, chatId);
                    console.log('\x1b[36m%s\x1b[0m', 'Emitting to global chat');
                } else {
                    io.to(roomId).emit('response', user, data, chatId);
                    console.log('\x1b[36m%s\x1b[0m', `Emitting to chat room ${roomId}`);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('join-room', (room) => {
            socket.join(room);
            console.log('\x1b[36m%s\x1b[0m', `Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('start-dm', (userId) => {
            console.log('\x1b[32m%s\x1b[0m', 'Server start dm activated')
        })

        socket.on('disconnect', () => {
            console.log('\x1b[36m%s\x1b[0m', `Socket disconnected: ${socket.id}`);
            if (user) {
                updateUser(user.id, { socket_id: null })
            }
        });
    });
};
