document.addEventListener('DOMContentLoaded', function() {
    // Form label animation
    const formInputs = document.querySelectorAll('.form-group input, .form-group select');
    
    formInputs.forEach(input => {
        // Check if input has value on load
        if (input.value !== '') {
            input.nextElementSibling.classList.add('active');
        }
        
        // Input focus event
        input.addEventListener('focus', function() {
            this.nextElementSibling.classList.add('active');
        });
        
        // Input blur event
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.nextElementSibling.classList.remove('active');
            }
        });
    });
    
    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            let isValid = true;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const program = document.getElementById('program').value;
            const authorize = document.getElementById('authorize').checked;
            
            // Check if fields are empty
            if (!firstName || !lastName || !email || !mobile || !program || !authorize) {
                isValid = false;
                alert('Please fill in all required fields');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                isValid = false;
                alert('Please enter a valid email address');
                return;
            }
            
            // Validate mobile number (10 digits)
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(mobile)) {
                isValid = false;
                alert('Please enter a valid 10-digit mobile number without +91');
                return;
            }
            
            // If all validations pass
            if (isValid) {
                alert('Thank you for your submission! We will contact you shortly.');
                contactForm.reset();
            }
        });
    }
    
    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Initialize active state for form labels if inputs have values
    document.querySelectorAll('.form-group input, .form-group select').forEach(input => {
        if (input.value !== '') {
            input.nextElementSibling.style.top = '0';
            input.nextElementSibling.style.fontSize = '0.8rem';
            input.nextElementSibling.style.color = 'var(--primary)';
        }
    });
});