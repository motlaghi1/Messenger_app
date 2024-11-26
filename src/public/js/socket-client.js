import { createContactItem, displayMessage , formatMessage } from './chat-helpers.js';
import { getCurrentChatId } from './chat.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    
    async function sendMessage(message, chatId) {
        try {
            const user = await getCurrentUser();
            const messageData = {
                content: message,
                chatId: chatId,
                timestamp: Date.now()
            };

            // Display own message immediately
            displayMessage(
                formatMessage(message, user.name, messageData.timestamp, true)
            );

            // Send via socket with retry mechanism
            socket.emit('chat-message', messageData, (acknowledgement) => {
                if (!acknowledgement.success) {
                    console.error('Message failed:', acknowledgement.error);
                    // Optionally show error to user
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    socket.on('chat-message', (data) => {
        if (data.senderId !== window.currentUserId && data.chatId === getCurrentChatId()) {
            displayMessage(
                formatMessage(data.content, data.senderName, data.timestamp, false)
            );
        }
    });

    // Handle reconnection
    socket.on('connect', () => {
        const currentChannel = getCurrentChatId();
        if (currentChannel) {
            socket.emit('join-room', currentChannel);
        }
    });

    // Error handling
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        // Implement retry or fallback mechanism
    });
});
