module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on('send-message', (data, room) => {
            console.log(`Message received: ${data}`);
            if (room === null) { // Global
                socket.broadcast.emit('response', data);
            } else { // DM and Group
                io.to(room).emit('response', data, room);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
