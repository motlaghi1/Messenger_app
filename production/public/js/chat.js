import { createContactItem, formatMessage, loadDirectMessages, loadGroupChats, loadChannelMessages } from "./chat-helpers.js";

// State Management
window.currentChatType = 'global';
window.currentChannelId = 'global';
window.currentUserId = null;

// DOM Elements
const navButtons = document.querySelectorAll('[data-chat-type]');
const dmContacts = document.getElementById('dmContacts');
const groupContacts = document.getElementById('groupContacts');
const chatTypes = document.querySelectorAll('.chat-type');
const currentChatTitle = document.getElementById('currentChat');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const usersList = document.getElementById('usersList');
const globalUsersList = document.getElementById('globalUsersList');
const refreshButton = document.getElementById('refreshBtn');


// Chat Switching Function
async function switchChat(chatType, channelId = null) {
    // Update state
    window.currentChatType = chatType;
    window.currentChannelId = channelId || (chatType === 'global' ? 'global' : null);
    
    // Reset navigation buttons
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate clicked button
    const activeButton = document.querySelector(`[data-chat-type="${chatType}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Show/hide contacts
    if (dmContacts && groupContacts) {
        dmContacts.classList.toggle('d-none', chatType !== 'dm');
        groupContacts.classList.toggle('d-none', chatType !== 'group');
    }

    // Show/hide users list
    if (usersList) {
        usersList.classList.toggle('d-none', chatType !== 'global');
    }

    // Show appropriate chat container and hide others
    chatTypes.forEach(chat => {
        chat.classList.toggle('d-none', chat.id !== `${chatType}Chat`);
        chat.classList.toggle('active', chat.id === `${chatType}Chat`);
    });

    // Update title
    if (currentChatTitle) {
        currentChatTitle.textContent = chatType === 'global' ? 'Global Chat' : 
                                     chatType === 'group' ? 'Select a Group' : 
                                     'Select a Conversation';
    }

    // Load appropriate content based on chat type
    if (chatType === 'global') {
        await loadUsers();
        await loadChannelMessages('global');
    } else if (chatType === 'dm') {
        await loadDirectMessages();
    } else if (chatType === 'group') {
        await loadGroupChats();
    }
}

// Load users function
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        if (globalUsersList) {
            globalUsersList.innerHTML = '';
            
            users.forEach(user => {
                if (user.id !== currentUserId) {
                    const contactItem = createContactItem({
                        type: 'contact',
                        contactName: user.name,
                        subText: 'Online',
                        userId: user._id,
                        showDmButton: true
                    });
                    globalUsersList.appendChild(contactItem);
                }
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing chat...');
        
        // Get current user info first
        const userResponse = await fetch('/api/current-user');
        if (userResponse.ok) {
            const userData = await userResponse.json();
            window.currentUserId = userData.id;
            console.log('Current user ID:', window.currentUserId);
        }

        // Set up event listeners for nav buttons
        navButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const chatType = button.dataset.chatType;
                if (['global', 'group', 'dm'].includes(chatType)) {
                    await switchChat(chatType);
                }
            });
        });

        // Set up message input handlers
        if (messageInput && sendButton) {
            sendButton.addEventListener('click', async () => {
                const message = messageInput.value.trim();
                if (message && window.currentChannelId) {
                    await sendMessage(message, window.currentChannelId);
                    messageInput.value = '';
                }
            });

            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendButton.click();
                }
            });
        }

        // Set up refresh button
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                if (window.currentChannelId) {
                    await loadChannelMessages(window.currentChannelId);
                }
            });
        }

        // Initialize chat
        await switchChat('global');
        
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
});

async function sendMessage(message, channelId) {
    if (!channelId) return;

    try {
        const response = await fetch(`/api/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: message })
        });

        if (!response.ok) throw new Error('Failed to send message');

        // Load updated messages for the current channel
        await loadChannelMessages(window.currentChannelId);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Search functionality
function setupSearch(searchId, listId) {
    const searchInput = document.getElementById(searchId);
    const list = document.getElementById(listId);
    
    if (searchInput && list) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const items = list.getElementsByClassName('contact-item');
            
            Array.from(items).forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function setupUserSearch() {
    const userSearch = document.getElementById('userSearch');
    if (userSearch && globalUsersList) {
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const items = globalUsersList.getElementsByClassName('contact-item');
            
            Array.from(items).forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

export function getCurrentChatId() {
    return currentChannelId;
}