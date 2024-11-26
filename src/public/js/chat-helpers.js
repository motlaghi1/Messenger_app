export function createContactItem({
    type = 'group',
    contactName = 'Contact Name',
    subText = type === 'group' ? '1 member' : '',
    isActive = false,
    channelId = null,
    userId = null,
    showDmButton = false
}) {
    const div = document.createElement('div');
    const iconClass = type === 'contact' ? 'fas fa-user' : 'fas fa-users';
    const color = type === 'contact' ? 'bg-secondary' : 'bg-primary';
    
    div.className = `contact-item p-3 position-relative ${isActive ? 'active' : ''}`;
    
    // Create the main contact item HTML
    let innerHtml = `
        <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center flex-grow-1">
                <div class="rounded-circle ${color} text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="${iconClass}"></i>
                </div>
                <div class="ms-3">
                    <div class="fw-semibold">${contactName}</div>
                    <div class="text-muted small">${subText}</div>
                </div>
            </div>`;
    
    // Add DM button if showDmButton is true
    if (showDmButton) {
        innerHtml += `
            <button class="btn btn-link text-primary p-1 dm-button" 
                    title="Start Direct Message" 
                    data-user-id="${userId}"
                    style="display: none;">
                <i class="fas fa-comments"></i>
            </button>`;
    }
    
    innerHtml += `</div>`;
    div.innerHTML = innerHtml;

    // Add hover events for DM button
    if (showDmButton) {
        const dmButton = div.querySelector('.dm-button');
        div.addEventListener('mouseenter', () => {
            dmButton.style.display = 'block';
        });
        div.addEventListener('mouseleave', () => {
            dmButton.style.display = 'none';
        });

        // Add click handler for DM button
        dmButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const userId = dmButton.dataset.userId;
            await initiateDM(userId);
        });
    }

    return div;
}

export async function loadDirectMessages() {
    try {
        const userResponse = await fetch('/api/current-user');
        const currentUser = await userResponse.json();
        const currentUserId = currentUser.id;

        const response = await fetch('/api/channels/direct');
        const channels = await response.json();
        
        const dmList = document.getElementById('dmList');
        if (dmList) {
            dmList.innerHTML = '';
            
            channels.forEach(channel => {
                const otherParticipant = channel.participants.find(p => p.id !== currentUserId);
                
                if (otherParticipant) {
                    const contactItem = createContactItem({
                        type: 'contact',
                        contactName: otherParticipant.name,
                        subText: 'Direct Message',
                        channelId: channel._id,
                        isActive: channel._id === window.currentChannelId
                    });

                    contactItem.addEventListener('click', async () => {
                        // Set the current channel and chat type
                        window.currentChannelId = channel._id;
                        window.currentChatType = 'dm';

                        // Update UI active states
                        document.querySelectorAll('.contact-item').forEach(item => 
                            item.classList.remove('active'));
                        contactItem.classList.add('active');

                        // Update chat title
                        const currentChatTitle = document.getElementById('currentChat');
                        if (currentChatTitle) {
                            currentChatTitle.textContent = `${otherParticipant.name}`;
                        }

                        // Show correct chat container
                        document.querySelectorAll('.chat-type').forEach(chat => {
                            chat.classList.add('d-none');
                            chat.classList.remove('active');
                        });
                        
                        const dmChat = document.getElementById('dmChat');
                        if (dmChat) {
                            dmChat.classList.remove('d-none');
                            dmChat.classList.add('active');
                        }

                        // Load messages
                        await loadChannelMessages(channel._id);
                    });

                    dmList.appendChild(contactItem);
                }
            });
        }
    } catch (error) {
        console.error('Error loading DMs:', error);
    }
}

// Update loadChannelMessages function
export async function loadChannelMessages(channelId) {
    try {
        const response = await fetch(`/api/channels/${channelId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const messages = await response.json();
        
        // Use the currentChatType to determine which container to use
        const chatContainer = document.getElementById(`${window.currentChatType}Chat`);
        
        if (chatContainer) {
            chatContainer.innerHTML = messages
                .map(msg => formatMessage(
                    msg.content, 
                    msg.sender.name, 
                    msg.timestamp, 
                    msg.sender.id === window.currentUserId
                ))
                .join('');
            
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Update initiateDM function
async function initiateDM(userId) {
    try {
        const response = await fetch('/api/channels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'direct',
                participants: [userId]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create DM channel');
        }

        const channel = await response.json();
        
        // Switch to DM section and set the current channel ID
        window.currentChatType = 'dm';
        window.currentChannelId = channel._id;

        const dmBtn = document.querySelector('[data-chat-type="dm"]');
        if (dmBtn) {
            dmBtn.click();
            await loadDirectMessages();
            
            // Find and activate the new DM in the list
            const dmItem = document.querySelector(`[data-channel-id="${channel._id}"]`);
            if (dmItem) {
                dmItem.click();
            }
        }
    } catch (error) {
        console.error('Error creating DM:', error);
    }
}

export async function loadGroupChats() {
    try {
        const response = await fetch('/api/channels/group');
        const channels = await response.json();
        
        const groupList = document.getElementById('groupList');
        if (groupList) {
            groupList.innerHTML = '';
            
            channels.forEach(channel => {
                const contactItem = createContactItem({
                    type: 'group',
                    contactName: channel.name,
                    subText: `${channel.participants.length} members`,
                    channelId: channel._id
                });
                groupList.appendChild(contactItem);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

export function displayMessage(messageContent) {
    // const activeBox = document.querySelector(".chat-type.active")
    // const now = new Date();
    // const timestamp = now.toLocaleTimeString();
    // const messageItem = document.createElement("div");

    // const messageClasses = type === 'sent'
    //     ? 'message sent p-3 mb-3'
    //     : 'message received shadow-sm p-3 mb-3';

    // const timestampClass = type === 'sent'
    //     ? 'text-white-50 small mt-1'
    //     : 'text-muted small mt-1';

    // const senderHTML = type !== 'sent'
    //     ? `<div class="fw-semibold">${user.name}</div>`
    //     : '';

    // // Build the inner HTML using a template literal
    // messageItem.innerHTML = `
    //     <div class="message ${messageClasses}">
    //         ${senderHTML}
    //         <div>${message}</div>
    //         <div class="${timestampClass}">${timestamp}</div>
    //     </div>
    // `;
    // return messageItem;
    console.log('tryna socket post')
    const activeBox = document.querySelector(".chat-type.active")
    const div =  document.createElement("div");
    div.innerHTML = messageContent;
    activeBox.appendChild(div);
    const chatMessagesContainer = document.querySelector('.chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

export function formatMessage(message, sender, timestamp, isSentByCurrentUser) {
    const messageTime = new Date(timestamp).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
    });
    console.log('making the message element')
    return `
        <div class="message ${isSentByCurrentUser ? 'sent bg-primary' : 'received bg-secondary shadow-sm'} p-3 mb-3">
            ${!isSentByCurrentUser ? `<div class="fw-semibold">${sender}</div>` : ''}
            <div>${message}</div>
            <div class="${isSentByCurrentUser ? 'text-white-50' : 'text-muted'} small mt-1">${messageTime}</div>
        </div>
    `;
}