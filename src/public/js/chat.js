import { createContactItem } from "./chat-helpers.js";
// State Management
let currentChatType = 'global';
let currentChatId = null;

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

// Search Functionality
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

// Chat Switching Function
function switchChat(chatType) {
    // Reset navigation buttons
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    console.log(chatType);
    
    // Activate clicked button
    const activeButton = document.querySelector(`[data-chat-type="${chatType}"]`);
    console.log(activeButton);
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

    if (chatType === 'global') {
        loadUsers(); // Load users when switching to global chat
    }

    // Show appropriate chat
    chatTypes.forEach(chat => {
        chat.classList.toggle('d-none', chat.id !== `${chatType}Chat`);
        chat.classList.toggle('active', chat.id === `${chatType}Chat`);
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

    // Load messages
    loadMessages(chatType);
}

// Message sending handler
if (sendButton && messageInput) {
    // Enter key handler
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
}

// Message loading function
function loadMessages(chatType, chatId = null) {
    // const chatContainer = document.getElementById(`${chatType}Chat`);
    // if (chatContainer) {
    //     chatContainer.innerHTML = `
    //         <div class="text-center text-muted py-5">
    //             <i class="fas fa-comments fa-2x mb-3"></i>
    //             <p>Loading ${chatType} messages...</p>
    //         </div>
    //     `;
    // }
}

// Message sending function
function sendMessage(message) {
    console.log(`Sending message to ${currentChatType}:`, message);
    // Here you would typically send the message to your server
}

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
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const chatType = button.dataset.chatType;
        switchChat(chatType);
    });
});

// DOM-dependent event listeners
document.querySelectorAll('[data-chat-type]').forEach(button => {
    button.addEventListener('click', (e) => {
        const chatType = button.dataset.chatType;
        if (['global', 'group', 'dm'].includes(chatType)) {
            e.preventDefault();
            switchChat(chatType);
        }
    });
});

// Contact item click handlers
document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.contact-item').forEach(i => 
            i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setupUserSearch();
    setupSearch('dmSearch', 'dmList');
    setupSearch('groupSearch', 'groupList');
    switchChat('global');
});

// Auto refresh users list periodically
setInterval(loadUsers, 30000); // Refresh every 30 seconds

// Export functions for use in other scripts
window.switchChat = switchChat;
window.sendMessage = sendMessage;
window.loadMessages = loadMessages;