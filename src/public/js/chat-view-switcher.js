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

export default switchChat;