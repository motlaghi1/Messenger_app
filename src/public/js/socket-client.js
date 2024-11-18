function displayMessage(message) {
    const activeBox = document.querySelector(".chat-type.active")
    const item = document.createElement('li');
    item.textContent = message;
    activeBox.appendChild(item);
}

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    const chatBox = document.getElementById('chatBox-glob');
    
    function sendMessage(message, roomId) {
        displayMessage(`You: ${message}`);
        
        if (roomId === null) {
            socket.emit('send-message', message);
        } else {
            socket.emit('send-message', message, roomId);
        }
    }
    
    sendButton.addEventListener('click', function() {
        const message = inputField.value;
        sendMessage(message, message);
    });

    socket.on('connect', () => {
        console.log(`Connected to server with ID: ${socket.id}`);
    });

    socket.on('response', (message) => {
        displayMessage(message);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
});
