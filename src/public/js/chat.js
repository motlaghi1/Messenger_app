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
        
        window.socket = io();

        // Get current user info first
        const userResponse = await fetch('/api/current-user');
        if (userResponse.ok) {
            const userData = await userResponse.json();
            window.currentUserId = userData.id;
            console.log('\x1b[36m%s\x1b[0m', `Current user ID: ${window.currentUserId}`);
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
                    sendButton.click()
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

        initializeGroupModal();

        // Initialize chat
        await switchChat('global');
        
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
});

function initializeGroupModal() {
    const groupForm = document.getElementById('groupForm');
    const makePrivateCheckbox = document.getElementById('makePrivate');
    const passwordField = document.querySelector('.password-field');
    const groupAction = document.getElementById('groupAction');
    const createOnlyFields = document.querySelectorAll('.create-only');
    const joinPasswordHint = document.querySelector('.join-password-hint');
    const passwordInput = document.getElementById('groupPassword');
    const saveGroupButton = document.getElementById('saveGroupButton');
    const groupNameInput = document.getElementById('groupName');
    document.getElementById('groupName').value.trim();

    // Toggle password field based on private checkbox
    makePrivateCheckbox?.addEventListener('change', function() {
        passwordField?.classList.toggle('d-none', !this.checked);
        if (passwordInput) {
            passwordInput.required = this.checked;
        }
    });

    // Toggle fields based on action
    groupAction?.addEventListener('change', function() {
        const isCreate = this.value === 'create';
        createOnlyFields.forEach(field => {
            field.classList.toggle('d-none', !isCreate);
        });
        
        if (!isCreate) {
            if (passwordField) passwordField.classList.remove('d-none');
            if (joinPasswordHint) joinPasswordHint.classList.remove('d-none');
            if (passwordInput) passwordInput.required = false;
        } else {
            if (passwordField) {
                passwordField.classList.toggle('d-none', !makePrivateCheckbox?.checked);
            }
            if (joinPasswordHint) joinPasswordHint.classList.add('d-none');
            if (passwordInput && makePrivateCheckbox) {
                passwordInput.required = makePrivateCheckbox.checked;
            }
        }

        if (saveGroupButton) {
            saveGroupButton.textContent = isCreate ? 'Create Group' : 'Join Group';
        }
    });

    // Handle form submission
    groupForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const action = groupAction.value;
        const groupName = groupNameInput.value.trim();
        const makePrivate = makePrivateCheckbox?.checked || false;
        const groupPassword = passwordInput?.value?.trim() || null;

        if (!groupName) {
            alert('Please enter a group name.');
            return;
        }

        if (action === 'create' && makePrivate && !groupPassword) {
            alert('Please enter a password for private group.');
            return;
        }

        try {
            const response = await fetch('/api/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'group',
                    name: groupName,
                    password: groupPassword,
                    action: action
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create/join group');
            }

            const channel = await response.json();
            console.log('Channel created/joined:', channel);

            // Add channel to UI
            const groupList = document.getElementById('groupList');
            if (!groupList) {
                console.error('Group list element not found');
                return;
            }

            const contactItem = createContactItem({
                type: 'group',
                contactName: channel.name,
                subText: `${channel.participants.length} members${channel.password ? ' • Private' : ' • Public'}`,
                channelId: channel._id
            });

            groupList.appendChild(contactItem);

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('groupModal'));
            if (modal) {
                modal.hide();
                groupForm.reset();
                passwordField?.classList.add('d-none');
                joinPasswordHint?.classList.add('d-none');
            }

            // Switch to the new channel
            window.currentChannelId = channel._id;
            window.currentChatType = 'group';
            
            // Update UI states
            document.querySelectorAll('.contact-item').forEach(item => 
                item.classList.remove('active'));
            contactItem.classList.add('active');

            // Update chat title
            const currentChatTitle = document.getElementById('currentChat');
            if (currentChatTitle) {
                currentChatTitle.textContent = channel.name;
            }

            // Show correct chat container
            document.querySelectorAll('.chat-type').forEach(chat => {
                chat.classList.add('d-none');
                chat.classList.remove('active');
            });
            
            const groupChat = document.getElementById('groupChat');
            if (groupChat) {
                groupChat.classList.remove('d-none');
                groupChat.classList.add('active');
            }

            // Load messages
            await loadChannelMessages(channel._id);

        } catch (error) {
            console.error('Error details:', error);
            alert(error.message || `Failed to ${action} group`);
        }
    });

    // Set up socket listener for group updates
    if (window.socket) {
        window.socket.on('group-updated', async () => {
            await loadGroupChats();
        });
    }
}

export function getCurrentChatId() {
    return currentChannelId;
}