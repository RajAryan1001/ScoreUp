document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('nav').classList.toggle('active');
        });
    }
    
    // FAQ Toggle - Improved Version
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-toggle i') || this.querySelector('i');
            
            // Toggle active class
            faqItem.classList.toggle('active');
            
            // Toggle icon if exists
            if (icon) {
                if (faqItem.classList.contains('active')) {
                    icon.classList.replace('fa-plus', 'fa-minus');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    icon.classList.replace('fa-minus', 'fa-plus');
                    answer.style.maxHeight = null;
                }
            } else {
                // Fallback if no icon found
                if (faqItem.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            }
        });
    });
    
    // Testimonial Slider - Improved Version
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const prevTestimonialBtn = document.querySelector('.prev-testimonial');
    const nextTestimonialBtn = document.querySelector('.next-testimonial');
    let currentSlide = 0;
    let slideInterval;
    
    if (testimonialSlides.length > 0) {
        function showSlide(n) {
            // Hide all slides
            testimonialSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all dots
            testimonialDots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Show the selected slide and dot
            testimonialSlides[n].classList.add('active');
            testimonialDots[n].classList.add('active');
            currentSlide = n;
        }
        
        // Next button
        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', function() {
                currentSlide = (currentSlide + 1) % testimonialSlides.length;
                showSlide(currentSlide);
                resetInterval();
            });
        }
        
        // Previous button
        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', function() {
                currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
                showSlide(currentSlide);
                resetInterval();
            });
        }
        
        // Dot navigation
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showSlide(index);
                resetInterval();
            });
        });
        
        // Auto slide
        function startSlider() {
            slideInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % testimonialSlides.length;
                showSlide(currentSlide);
            }, 5000);
        }
        
        function resetInterval() {
            clearInterval(slideInterval);
            startSlider();
        }
        
        // Initialize
        showSlide(0);
        startSlider();
    }
    
    // Location Tabs
    const locationTabs = document.querySelectorAll('.location-tab');
    if (locationTabs.length > 0) {
        locationTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.location-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Hide all location content
                document.querySelectorAll('.location-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding location content
                const location = this.getAttribute('data-location');
                const locationContent = document.getElementById(location + '-location');
                if (locationContent) {
                    locationContent.classList.add('active');
                }
            });
        });
    }
    
    // Form Submission
    const enquiryForm = document.getElementById('course-enquiry-form');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                successModal.style.display = 'flex';
            }
        });
    }
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                successModal.style.display = 'flex';
            }
        });
    }
    
    // Close Modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                successModal.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const successModal = document.getElementById('success-modal');
        if (successModal && e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});