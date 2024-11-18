document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');

    sendButton.addEventListener('click', function() {
        const message = inputField.value;
        console.log(message);
        alert(message);
    });

    socket.on('connect', () => {
        console.log(`Connected to server with ID: ${socket.id}`);

        socket.on('response', (data) => {
            console.log('Server response:', data);
        });

        socket.emit('message', 'Hello from the client!');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
});
