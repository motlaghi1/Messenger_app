export function createContactItem({
    type = 'group',
    contactName = 'Contact Name',
    subText = type === 'group' ? '1 member' : '',
    isActive = false
}) {
    const div = document.createElement('div');
    const iconClass = type === 'contact' ? 'fas fa-user' : 'fas fa-users';
    const color = type === 'contact' ? 'bg-secondary' : 'bg-primary';
    
    div.className = `contact-item p-3 ${isActive ? 'active' : ''}`;
    
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="rounded-circle ${color} text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                <i class="${iconClass}"></i>
            </div>
            <div class="ms-3">
                <div class="fw-semibold">${contactName}</div>
                <div class="text-muted small">${subText}</div>
            </div>
        </div>
    `;

    div.addEventListener('click', function() {
        document.querySelectorAll('.contact-item').forEach(i => 
            i.classList.remove('active'));
        this.classList.add('active');
    });

    return div;
}

export function displayMessage(message, type) {
    const activeBox = document.querySelector(".chat-type.active");
    const item = document.createElement('p');
    item.classList.add('message-bubble', type);
    item.textContent = message;
    activeBox.appendChild(item);
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

export function formatMessage(message, currentUserId) {
    const isSentByCurrentUser = message.sender.id === currentUserId;
    const messageTime = new Date(message.timestamp).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
    });

    return `
        <div class="message ${isSentByCurrentUser ? 'sent bg-primary text-white' : 'received bg-white shadow-sm'} p-3 mb-3">
            ${!isSentByCurrentUser ? `<div class="fw-semibold">${message.sender.name}</div>` : ''}
            <div>${message.content}</div>
            <div class="${isSentByCurrentUser ? 'text-white-50' : 'text-muted'} small mt-1">${messageTime}</div>
        </div>
    `;
}