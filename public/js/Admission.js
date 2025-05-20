document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInsideNav = navToggle.contains(e.target) || navMenu.contains(e.target);
        const isMenuActive = navMenu.classList.contains('active');

        if (!isClickInsideNav && isMenuActive) {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        }
    });

    // Handle active state for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Close mobile menu after clicking a link
            if (window.innerWidth <= 768) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        }
    });
});
//   Header End

//  Adminsiion....

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enquiryForm');
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select');

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Show success state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = '✓ Submitted Successfully';
                submitBtn.style.backgroundColor = '#4CAF50';
                
                // Reset form after delay
                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        
        switch(input.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'tel':
                isValid = /^\d{10}$/.test(value);
                break;
            case 'select-one':
                isValid = value !== '';
                break;
            default:
                isValid = value.length >= 2;
        }

        toggleError(input, isValid);
        return isValid;
    }

    // Handle floating labels
    inputs.forEach(input => {
        // Initial state check
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }

        // Input events
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (!input.value) {
                input.parentElement.classList.remove('has-value');
            }
            validateInput(input);
        });

        input.addEventListener('input', () => {
            input.parentElement.classList.add('has-value');
            if (input.parentElement.classList.contains('error')) {
                validateInput(input);
            }
        });
    });

    // Error handling
    function toggleError(input, isValid) {
        const formGroup = input.parentElement;
        
        if (!isValid) {
            formGroup.classList.add('error');
            if (!formGroup.querySelector('.error-message')) {
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = getErrorMessage(input);
                formGroup.appendChild(error);
            }
        } else {
            formGroup.classList.remove('error');
            const error = formGroup.querySelector('.error-message');
            if (error) {
                error.remove();
            }
        }
    }

    function getErrorMessage(input) {
        switch(input.type) {
            case 'email':
                return 'Please enter a valid email address';
            case 'tel':
                return 'Please enter a valid 10-digit mobile number';
            case 'select-one':
                return 'Please select an option';
            default:
                return `Please enter your ${input.name.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        }
    }
});