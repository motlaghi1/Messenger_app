export function createContactItem({
    type = 'group',
    contactName = 'Contact Name',
    subText = type === 'group' ? '1 member' : '',
    channelId = null,
    userId = null,
    showDmButton = false
}) {
    const div = document.createElement('div');
    const iconClass = type === 'contact' ? 'fas fa-user' : 'fas fa-users';
    const color = type === 'contact' ? 'bg-secondary' : 'bg-primary';
    
    div.className = `contact-item p-3 position-relative`;
    if (channelId) {
        div.dataset.channelId = channelId;
    }
    
    // Create the main contact item HTML
    let innerHtml = `
        <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center flex-grow-1 contact-content">
                <div class="rounded-circle ${color} text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="${iconClass}"></i>
                </div>
                <div class="ms-3">
                    <div class="fw-semibold">${contactName}</div>
                    <div class="text-muted small">${subText}</div>
                </div>
            </div>
            <div class="action-buttons" style="display: none;">`;

    // Add appropriate button based on type
    if (type === 'group') {
        innerHtml += `
            <button class="btn btn-link text-danger p-1 leave-button" 
                    title="Leave Group" 
                    data-channel-id="${channelId}">
                <i class="fas fa-sign-out-alt"></i>
            </button>`;
    } else if (type === 'contact' && !showDmButton) {
        innerHtml += `
            <button class="btn btn-link text-danger p-1 delete-button" 
                    title="Delete Conversation" 
                    data-channel-id="${channelId}">
                <i class="fas fa-trash"></i>
            </button>`;
    }

    if (showDmButton) {
        innerHtml += `
            <button class="btn btn-link text-primary p-1 dm-button" 
                    title="Start Direct Message" 
                    data-user-id="${userId}">
                <i class="fas fa-comments"></i>
            </button>`;
    }

    innerHtml += `</div></div>`;
    div.innerHTML = innerHtml;

    // Add hover events for action buttons
    const actionButtons = div.querySelector('.action-buttons');
    div.addEventListener('mouseenter', () => {
        actionButtons.style.display = 'block';
    });
    div.addEventListener('mouseleave', () => {
        actionButtons.style.display = 'none';
    });

    // Handle click events
    div.addEventListener('click', async (e) => {
        // Don't trigger click if clicking on buttons
        if (e.target.closest('.action-buttons')) {
            return;
        }

        // Handle channel selection
        if (channelId && !showDmButton) {
            await handleChannelSelection(div, channelId, type, contactName);
        }
    });

    // Add button click handlers
    const leaveButton = div.querySelector('.leave-button');
    const deleteButton = div.querySelector('.delete-button');
    const dmButton = div.querySelector('.dm-button');

    if (leaveButton) {
        leaveButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const channelId = leaveButton.dataset.channelId;
            await handleLeaveGroup(channelId, div);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const channelId = deleteButton.dataset.channelId;
            await handleDeleteDM(channelId, div);
        });
    }

    if (dmButton) {
        dmButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const userId = dmButton.dataset.userId;
            await initiateDM(userId);
        });
    }

    return div;
}

async function handleChannelSelection(element, channelId, type, contactName) {
    // Set the current channel and chat type
    window.currentChannelId = channelId;
    window.currentChatType = type === 'group' ? 'group' : 'dm';

    // Update UI active states
    document.querySelectorAll('.contact-item').forEach(item => 
        item.classList.remove('active'));
    element.classList.add('active');

    // Update chat title
    const currentChatTitle = document.getElementById('currentChat');
    if (currentChatTitle) {
        currentChatTitle.textContent = contactName;
    }

    // Show correct chat container
    document.querySelectorAll('.chat-type').forEach(chat => {
        chat.classList.add('d-none');
        chat.classList.remove('active');
    });
    
    const chatContainer = document.getElementById(`${window.currentChatType}Chat`);
    if (chatContainer) {
        chatContainer.classList.remove('d-none');
        chatContainer.classList.add('active');
    }

    // Join socket room if it's a group chat
    if (type === 'group' && window.chatSocket) {
        window.chatSocket.emit('join-room', channelId);
    }
    
    // Load messages
    await loadChannelMessages(channelId);
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

            if (window.currentChatType === 'dm' && !window.currentChannelId) {
                const firstDM = dmList.querySelector('.contact-item');
                if (firstDM) {
                    firstDM.click();
                }
            }
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
export async function initiateDM(userId) {
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
                    subText: `${channel.participants.length} members${channel.password ? ' • Private' : ' • Public'}`,
                    channelId: channel._id,
                });

                // Add click handler for channel selection
                contactItem.addEventListener('click', async () => {
                    window.currentChannelId = channel._id;
                    window.currentChatType = 'group';

                    // Update UI active states
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
                        groupChat.innerHTML = ''; // Clear previous messages
                    }

                    // Join socket room
                    if (window.chatSocket) {
                        window.chatSocket.emit('join-room', channel._id);
                    }
                    
                    // Load messages
                    await loadChannelMessages(channel._id);
                });

                groupList.appendChild(contactItem);
            });

            // If we're in group chat type and no channel is selected, select the first one
            if (window.currentChatType === 'group' && !window.currentChannelId) {
                const firstGroup = groupList.querySelector('.contact-item');
                if (firstGroup) {
                    firstGroup.click();
                }
            }
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function handleLeaveGroup(channelId, element) {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
        const response = await fetch(`/api/channels/${channelId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to leave group');

        // Remove the channel from UI
        element.remove();

        // Reset chat if this was the active channel
        if (window.currentChannelId === channelId) {
            const groupChat = document.getElementById('groupChat');
            if (groupChat) {
                groupChat.innerHTML = '';
                window.currentChannelId = null;
                document.getElementById('currentChat').textContent = 'Select a Group';
            }
        }

        // Leave socket room
        if (window.chatSocket) {
            window.chatSocket.emit('leave-room', channelId);
        }

    } catch (error) {
        console.error('Error leaving group:', error);
        alert('Failed to leave group');
    }
}

async function handleDeleteDM(channelId, element) {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
        const response = await fetch(`/api/channels/${channelId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete conversation');

        // Remove the channel from UI
        element.remove();

        // Reset chat if this was the active channel
        if (window.currentChannelId === channelId) {
            const dmChat = document.getElementById('dmChat');
            if (dmChat) {
                dmChat.innerHTML = '';
                window.currentChannelId = null;
                document.getElementById('currentChat').textContent = 'Select a Conversation';
            }
        }

    } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Failed to delete conversation');
    }
}


export function displayMessage(messageContent) {
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