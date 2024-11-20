export function createContactItem({
    type = 'group',
    contactName = 'Contact Name',
    subText = type === 'group' ? '1 member' : '',
}) {
    // Create a container div
    const contactItem = document.createElement('div');
    const iconClass = type === 'group' ? 'fas fa-users' : 'fas fa-user'
    contactItem.classList.add('contact-item', 'p-3');
    const color = type === 'group' ? 'bg-primary' : 'bg-secondary'

    // Build the inner HTML using a template literal
    contactItem.innerHTML = `
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

    contactItem.addEventListener('click', function() {
        document.querySelectorAll('.contact-item').forEach(i => 
            i.classList.remove('active'));
        this.classList.add('active');
    });

    return contactItem;
}

export function displayMessage(user, message, type) {
    const activeBox = document.querySelector(".chat-type.active")
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const messageItem = document.createElement("div");

    const messageClasses = type === 'sent'
        ? 'message sent p-3 mb-3'
        : 'message received shadow-sm p-3 mb-3';

    const timestampClass = type === 'sent'
        ? 'text-white-50 small mt-1'
        : 'text-muted small mt-1';

    const senderHTML = type !== 'sent'
        ? `<div class="fw-semibold">${user.name}</div>`
        : '';

    // Build the inner HTML using a template literal
    messageItem.innerHTML = `
        <div class="message ${messageClasses}">
            ${senderHTML}
            <div>${message}</div>
            <div class="${timestampClass}">${timestamp}</div>
        </div>
    `;
    activeBox.appendChild(messageItem);
    const chatMessagesContainer = document.querySelector('.chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}