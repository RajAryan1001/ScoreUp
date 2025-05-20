 // Form validation and submission
 document.getElementById('gre-enquiry-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const studyLevel = document.getElementById('study-level').value;
    const country = document.getElementById('country').value;
    
    // Simple validation
    if (!name || !email || !phone || !studyLevel || !country) {
        alert('Please fill all required fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Phone validation - simple check for numbers only
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
});

// Fix for the floating labels
document.querySelectorAll('.form-group select').forEach(select => {
    select.addEventListener('change', function() {
        if (this.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
});