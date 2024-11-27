import { createContactItem, displayMessage , formatMessage } from './chat-helpers.js';
import { getCurrentChatId } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    const groupModalButton = document.getElementById('saveGroupButton');
    
    function sendMessage(message, chatId, userId) {
        async function getCurrentUser() {
            const response = await fetch('/api/current_user');
            const currentUser = await response.json();
            return currentUser;
        }
        console.log('\x1b[36m%s\x1b[0m', `socket client chat id: ${chatId}`)
        getCurrentUser().then((user) => {
            displayMessage(
                formatMessage(message, user.name, Date.now(), true),
            );
            console.log('\x1b[36m%s\x1b[0m', `chat id: ${chatId}`);
            if (chatId === 'global') {
                socket.emit('send-message', message);
            } else {
                socket.emit('send-message', message, chatId, user._id);
            }
        });
    }
    
    
    sendButton.addEventListener('click', function() {
        const message = inputField.value.trim();
        console.log('\x1b[32m%s\x1b[0m', `send button pressed with target user = : ${window.targetUserId}`);
        if (message) {
            sendMessage(message, getCurrentChatId(), window.targetUserId); // TODO clear window.targetUserId and start dm emition
            inputField.value = ''; // Clear the input field
        }
    });

    socket.on('response', (user, message, chatId) => {
        console.log('\x1b[36m%s\x1b[0m', 'Receiving Message');
        if (chatId != getCurrentChatId()) { return } // Doesn't need socket if window not open
        displayMessage(
            formatMessage(message, user.name, Date.now(), false)
        );
    });

    //room joined event
    socket.on('room-joined', (roomId) => {
        console.log('\x1b[36m%s\x1b[0m', `Joined room: ${roomId}`);
    });
});
