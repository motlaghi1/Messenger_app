import { createContactItem, formatMessage } from "./chat-helpers.js";

// State Management
let currentChatType = 'global';
let currentChatId = null;
let currentUserId = null;

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

// Load channel messages
async function loadChannelMessages(channelId) {
    try {
        const response = await fetch(`/api/channels/${channelId}/messages`);
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const messages = await response.json();
        
        const chatContainer = document.querySelector(`#${currentChatType}Chat`);
        if (chatContainer) {
            chatContainer.innerHTML = messages.map(msg => 
                formatMessage(msg, currentUserId)
            ).join('');
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Send message function
async function sendMessage(content) {
    if (!content.trim() || !currentChatId) return;

    try {
        const response = await fetch(`/api/channels/${currentChatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content.trim() })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Clear input and reload messages
        messageInput.value = '';
        await loadChannelMessages(currentChatId);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Chat Switching Function
async function switchChat(chatType) {
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
        dmContacts.classList.toggle('d-none', chatType !== 'dms');
        groupContacts.classList.toggle('d-none', chatType !== 'groups');
    }

    // Show/hide users list
    if (usersList) {
        usersList.classList.toggle('d-none', chatType !== 'global');
    }

    // Show appropriate chat
    chatTypes.forEach(chat => {
        chat.classList.toggle('d-none', chat.id !== `${chatType}Chat`);
    });

    // Update title
    if (currentChatTitle) {
        currentChatTitle.textContent = chatType === 'global' ? 'Global Chat' : 
                                    chatType === 'groups' ? 'Select a Group' : 
                                    'Select a Conversation';
    }

    // Update state
    currentChatType = chatType;
    currentChatId = chatType === 'global' ? 'global' : null;

    // Load messages if it's global chat
    if (chatType === 'global') {
        await loadUsers();
        await loadChannelMessages('global');
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing chat...');
        
        // Create global channel if it doesn't exist
        const response = await fetch('/api/channels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'global'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create global channel');
        }

        // Get current user info
        const userResponse = await fetch('/api/current-user');
        if (userResponse.ok) {
            const userData = await userResponse.json();
            currentUserId = userData.id;
            console.log('Current user ID:', currentUserId);
        }

        // Set up event listeners for nav buttons
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const chatType = button.dataset.chatType;
                if (['global', 'groups', 'dms'].includes(chatType)) {
                    switchChat(chatType);
                }
            });
        });

        // Set up refresh button
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                if (currentChatId) {
                    loadChannelMessages(currentChatId);
                }
            });
        }

        // Set up message input handlers
        if (messageInput && sendButton) {
            // Send button click handler
            sendButton.addEventListener('click', () => {
                sendMessage(messageInput.value);
            });

            // Enter key handler
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(messageInput.value);
                }
            });
        }

        // Initialize search functionality
        setupSearch('dmSearch', 'dmList');
        setupSearch('groupSearch', 'groupList');
        setupUserSearch();

        // Start with global chat
        await switchChat('global');
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
});

// Load users function
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        if (globalUsersList) {
            // Clear existing content
            globalUsersList.innerHTML = '';

            // Append each contact item
            users.forEach(user => {
                const contactItem = createContactItem({
                    type: 'contact',
                    contactName: user.name,
                    subText: user.id,
                });
                globalUsersList.appendChild(contactItem);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
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

// Setup search for all users
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

// Auto refresh messages periodically
setInterval(() => {
    if (currentChatId) {
        loadChannelMessages(currentChatId);
    }
}, 5000); // Refresh every 5 seconds

// Auto refresh users list periodically
setInterval(loadUsers, 30000); // Refresh every 30 seconds