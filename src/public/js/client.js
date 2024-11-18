
// Connect to the server
const socket = io('http://localhost:8080');

// Listen for events from the server
socket.on('connect', () => {
    console.log(`Connected to server with ID: ${socket.id}`);

    // Example: Listen for a custom event
    socket.on('response', (data) => {
        console.log('Server response:', data);
    });

    // Emit an example event to the server
    socket.emit('message', 'Hello from the client!');
});

// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
