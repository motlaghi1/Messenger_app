function displayMessage(message, type) {
    const activeBox = document.querySelector(".chat-type.active")
    const item = document.createElement('p');
    item.classList.add('message-bubble', type);
    item.textContent = message;
    activeBox.appendChild(item);
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    
    function sendMessage(message, roomId) {
        displayMessage(message, 'from-me');
        
        if (roomId === null) {
            socket.emit('send-message', message);
        } else {
            socket.emit('send-message', message, roomId);
        }
    }
    
    sendButton.addEventListener('click', function() {
        const message = inputField.value;

        sendMessage(message);
    });

    socket.on('response', (message) => {
        displayMessage(message, 'from-them');
    });
});
