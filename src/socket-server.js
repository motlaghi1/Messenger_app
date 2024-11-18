module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on('message', (data) => {
            console.log(`Message received: ${data}`);
            socket.emit('response', 'Message received on server');
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
