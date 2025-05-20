  // Form validation and submission
  document.getElementById('gre-enquiry-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const program = document.getElementById('program').value;

    // Simple validation
    if (!firstName || !lastName || !email || !mobile || !program) {
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
    element.addEventListener('input', function() {
        if (this.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
    
    if (element.tagName === 'SELECT') {
        element.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    }
    
    if (element.value) {
        element.classList.add('has-value');
    }
});

// Testimonial Slider
const slides = document.querySelectorAll('.testimonial-slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;

function showSlide(n) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

// FAQ Toggle Functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        faqItem.classList.toggle('active');
    });
});