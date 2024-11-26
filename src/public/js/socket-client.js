import { createContactItem, displayMessage , formatMessage, showIsTyping } from './chat-helpers.js';
import { getCurrentChatId } from './chat.js';

document.addEventListener('DOMContentLoaded', async () => {
    const socket = io();
    const sendButton = document.getElementById('sendButton');
    const inputField = document.getElementById('messageInput');
    const groupModalButton = document.getElementById('saveGroupButton');
    let typingStarted = false;
    
    const response = await fetch('/api/current_user');
    const currentUser = await response.json();

    function sendMessage(message, chatId, userId) {
        console.log('\x1b[36m%s\x1b[0m', `socket client chat id: ${chatId}`)
        displayMessage(
            formatMessage(message, currentUser.name, Date.now(), true),
        );
        console.log('\x1b[36m%s\x1b[0m', `chat id: ${chatId}`);
        if (chatId === 'global') {
            socket.emit('send-message', message);
        } else {
            socket.emit('send-message', message, chatId, currentUser._id);
        }
    }
    
    groupModalButton.addEventListener('click', function() {
        const groupNameInput = document.getElementById('groupName');
        const groupName = groupNameInput.value.trim();
        const groupList = document.getElementById('groupList');

        if (groupName) {
            // Emit the group name to the server
            socket.emit('join-room', groupName);
            console.log('\x1b[36m%s\x1b[0m', `Group "${groupName}" created!`);
            
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
            sendMessage(message, getCurrentChatId(), window.targetUserId); // TODO clear window.targetUserId and start dm emition
            inputField.value = ''; // Clear the input field
        }
    });

    inputField.addEventListener('input', () => {
        if (typingStarted && inputField.value === '') {
            socket.emit('user-typing-change', currentUser, getCurrentChatId(), false)
            return
        } else 
        if (typingStarted) {
            return
        }
        socket.emit('user-typing-change', currentUser, getCurrentChatId(), true)
        typingStarted = true
        console.log('Started typing')
    })

    inputField.addEventListener('blur', () => {
        typingStarted = false
        socket.emit('user-typing-change', currentUser, getCurrentChatId(), false)
        console.log('Ended typing')
    })

    socket.on('response', (user, message, chatId) => {
        if (chatId != getCurrentChatId()) { return } // Doesn't need socket if window not open
        console.log('\x1b[36m%s\x1b[0m', 'Receiving Message');
        displayMessage(
            formatMessage(message, user.name, Date.now(), false)
        );
    });

    socket.on('user-typing-change', (user, chatId, isTyping) => {
        if (chatId != getCurrentChatId()) { return } // Doesn't need socket if window not open
        const typingIndicator = document.querySelector('.typing-indicator.other')
        if (typingIndicator) typingIndicator.remove();

        if (isTyping) { 
            console.log(`${user.name} is typing...`)
            showIsTyping(user)
        } else {
            console.log(`${user.name} stopped typing...`)
        }
    })
});
