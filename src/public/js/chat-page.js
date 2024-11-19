document.addEventListener('DOMContentLoaded', () => {
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

    // Search Functionality
    function setupSearch(searchId, listId) {
        const searchInput = document.getElementById(searchId);
        const list = document.getElementById(listId);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const items = list.getElementsByClassName('contact-item');
            
            Array.from(items).forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Initialize search
    setupSearch('dmSearch', 'dmList');
    setupSearch('groupSearch', 'groupList');

    // Chat Switching Function
    function switchChat(chatType) {
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
        dmContacts.classList.toggle('d-none', chatType !== 'dms');
        groupContacts.classList.toggle('d-none', chatType !== 'groups');

        // Show appropriate chat
        chatTypes.forEach(chat => {
            chat.classList.toggle('d-none', chat.id !== `${chatType}Chat`);
        });

        // Update title
        currentChatTitle.textContent = chatType === 'global' ? 'Global Chat' : 
                                    chatType === 'groups' ? 'Select a Group' : 
                                    'Select a Conversation';

        // Update state
        currentChatType = chatType;
        currentChatId = chatType === 'global' ? 'global' : null;

        // Load messages
        loadMessages(chatType);
    }

    // Navigation handlers
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chatType = button.dataset.chatType;
            switchChat(chatType);
        });
    });

    // Contact item handlers
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.contact-item').forEach(i => 
                i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Message sending handler
    //- sendButton.addEventListener('click', () => {
    //-     const message = messageInput.value.trim();
    //-     if (message && currentChatId) {
    //-         sendMessage(message);
    //-         messageInput.value = '';
    //-     }
    //- });

    // Enter key handler
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // Message loading function
    function loadMessages(chatType, chatId = null) {
        const chatContainer = document.getElementById(`${chatType}Chat`);
        // Here you would typically fetch messages from your server
    }

    // Message sending function
    function sendMessage(message) {
        console.log(`Sending message to ${currentChatType}:`, message);
        // Here you would typically send the message to your server
    }

    // Initialize with global chat
    switchChat('global');
})