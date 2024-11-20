import { createContactItem, displayMessage } from './chat-helpers.js';
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    const groupModalButton = document.getElementById('saveGroupButton');
    let room = null;
    
    function sendMessage(message, roomId) {
        displayMessage(message, 'from-me');
        
        if (room === undefined || roomId === null) {
            socket.emit('send-message', message);
        } else {
            socket.emit('send-message', message, roomId);
        }
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
        const message = inputField.value;

        sendMessage(message, room);
    });

    socket.on('response', (message) => {
        displayMessage(message, 'from-them');
    });
});
