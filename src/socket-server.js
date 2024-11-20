module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on('send-message', (user, data, room) => {
            console.log(`Message received: ${data} ${room}`);
            
            if (room === undefined || room === null) { // Global
                socket.broadcast.emit('response', user, data);
            } else { // DM and Group
                io.to(room).emit('response', user, data, room);
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
