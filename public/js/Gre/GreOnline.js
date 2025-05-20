  // Form validation and submission
  document.getElementById('gre-enquiry-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const program = document.getElementById('program').value;
    const mode = document.getElementById('mode').value;
    const city = document.getElementById('city').value;

    // Simple validation
    if (!firstName || !lastName || !email || !mobile || !program || !mode || !city) {
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
    if (!phoneRegex.test(mobile)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }

    // If all validations pass, show success message
    alert('Thank you for your interest! Our counselor will contact you shortly.');
    this.reset();
});

// Fix for the floating labels
document.querySelectorAll('.form-group input, .form-group select').forEach(element => {
    // Add has-value class on input if it has a value
    element.addEventListener('input', function() {
        if (this.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
    
    // For select elements
    if (element.tagName === 'SELECT') {
        element.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    }
    
    // Check on page load
    if (element.value) {
        element.classList.add('has-value');
    }
});

// FAQ Toggle Functionality - Improved version
document.querySelectorAll('.faq-item').forEach(faq => {
    const toggle = faq.querySelector('.faq-toggle');
    const heading = faq.querySelector('h3');
    const content = faq.querySelector('p');
    
    // Initially hide all FAQ answers
    content.style.maxHeight = '0';
    
    // Add click event to the entire heading for better UX
    heading.addEventListener('click', () => {
        // Close all other FAQs
        document.querySelectorAll('.faq-item.active').forEach(activeFaq => {
            if (activeFaq !== faq) {
                activeFaq.classList.remove('active');
                activeFaq.querySelector('p').style.maxHeight = '0';
                activeFaq.querySelector('.faq-toggle').textContent = '+';
            }
        });
        
        // Toggle active class
        faq.classList.toggle('active');
        
        // Change the toggle symbol
        toggle.textContent = faq.classList.contains('active') ? '-' : '+';
        
        // Toggle content visibility
        if (faq.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            content.style.maxHeight = '0';
        }
    });
});