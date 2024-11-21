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

export function displayMessage(message, type) {
    const activeBox = document.querySelector(".chat-type.active")
    const item = document.createElement('p');
    item.classList.add('message-bubble', type);
    item.textContent = message;
    activeBox.appendChild(item);
    
    const chatMessagesContainer = document.querySelector('.chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}