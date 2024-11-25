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
    activeBox.appendChild(
        div
    );
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