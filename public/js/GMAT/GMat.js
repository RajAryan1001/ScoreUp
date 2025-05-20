
// // Form validation and animation
// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('enquiry-form');
//     const inputs = form.querySelectorAll('input, select');
    
//     // Add focus and blur event listeners to all inputs
//     inputs.forEach(input => {
//         // Check if input has value on load
//         if (input.value) {
//             input.nextElementSibling.classList.add('active');
//         }
        
//         // Focus event
//         input.addEventListener('focus', function() {
//             this.nextElementSibling.classList.add('active');
//         });
        
//         // Blur event
//         input.addEventListener('blur', function() {
//             if (!this.value) {
//                 this.nextElementSibling.classList.remove('active');
//             }
//         });
//     });
    
//     // Form submission
//     form.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         // Basic validation
//         let isValid = true;
//         inputs.forEach(input => {
//             if (input.required && !input.value) {
//                 isValid = false;
//                 input.classList.add('error');
//             } else {
//                 input.classList.remove('error');
//             }
//         });
        
//         if (isValid) {
//             // Here you would normally send the form data to a server
//             alert('Thank you for your interest! We will contact you shortly.');
//             form.reset();
            
//             // Reset label positions
//             inputs.forEach(input => {
//                 input.nextElementSibling.classList.remove('active');
//             });
//         } else {
//             alert('Please fill in all required fields.');
//         }
//     });

//     // FAQ toggle functionality
//     const faqItems = document.querySelectorAll('.faq-item');
    
//     faqItems.forEach(item => {
//         const question = item.querySelector('.faq-question');
        
//         question.addEventListener('click', () => {
//             // Close all other items
//             faqItems.forEach(otherItem => {
//                 if (otherItem !== item && otherItem.classList.contains('active')) {
//                     otherItem.classList.remove('active');
//                 }
//             });
            
//             // Toggle current item
//             item.classList.toggle('active');
//         });
//     });

    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
// });