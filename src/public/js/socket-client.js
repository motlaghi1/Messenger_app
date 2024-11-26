import { createContactItem, displayMessage , formatMessage } from './chat-helpers.js';
import { getCurrentChatId } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    const groupModalButton = document.getElementById('saveGroupButton');
    
    function sendMessage(message, chatId) {
        async function getCurrentUser() {
            const response = await fetch('/api/current_user');
            const currentUser = await response.json();
            return currentUser;
        }
        
        getCurrentUser().then((user) => {
            displayMessage(
                formatMessage(message, user.name, Date.now(), true),
            );
            console.log('chat id: ', chatId);
            if (!chatId) {
                socket.emit('send-message', message);
            } else {
                socket.emit('send-message', message, chatId);
            }
        });
    }
    
    groupModalButton.addEventListener('click', function() {
        const groupNameInput = document.getElementById('groupName');
        const groupName = groupNameInput.value.trim();
        const groupList = document.getElementById('groupList');

        if (groupName) {
            // Emit the group name to the server
            socket.emit('join-room', groupName);
            console.log(`Group "${groupName}" created!`);
            
            // Create contact card
            const contactItem = createContactItem({
                type: 'group',
                contactName: groupName,
            });

            groupList.appendChild(contactItem);

            // Clear the input field
            groupNameInput.value = '';

            // Hide the modal using Bootstrap's API
            const modal = bootstrap.Modal.getInstance(document.getElementById('groupModal'));
            modal.hide();
        } else {
            alert('Please enter a group name or cancel.');
        }
    });

    sendButton.addEventListener('click', function() {
        const message = inputField.value.trim();
        if (message) {
            sendMessage(message, getCurrentChatId());
            inputField.value = ''; // Clear the input field
        }
    });

    socket.on('response', (user, message, chatId) => {
        if (chatId != getCurrentChatId()) { return } // Doesn't need socket if window not open
        displayMessage(
            formatMessage(message, user.name, Date.now(), false)
        );
    });
});
