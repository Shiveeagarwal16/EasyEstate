// Contact page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }
});

function handleContactForm() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    const messageDiv = document.getElementById('contactFormMessage');

    // Basic client-side validation
    if (!name || !email || !message) {
        showMessage(messageDiv, 'Please fill in the required fields.', 'error');
        return;
    }
    if (name.trim().length < 2) {
        showMessage(messageDiv, 'Name must be at least 2 characters.', 'error');
        return;
    }
    if (message.trim().length < 10) {
        showMessage(messageDiv, 'Message must be at least 10 characters.', 'error');
        return;
    }

    // Send data to server as JSON
    fetch('/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, subject, message })
    })
    .then(async (res) => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to submit form');
        }
        return res.json();
    })
    .then(data => {
        showMessage(messageDiv, data.message || 'Thank you for your message!', 'success');
        document.getElementById('contactForm').reset();
    })
    .catch(err => {
        console.error('Contact form submit error:', err);
        showMessage(messageDiv, err.message || 'There was an error. Please try again.', 'error');
    });
}

