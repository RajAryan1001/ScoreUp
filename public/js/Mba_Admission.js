// document.getElementById('enquiryForm').addEventListener('submit', function(e) {
//     e.preventDefault();
    
//     // Collect form data
//     const formData = {
//         firstName: document.getElementById('firstName').value,
//         lastName: document.getElementById('lastName').value,
//         email: document.getElementById('email').value,
//         mobile: document.getElementById('mobile').value,
//         program: document.getElementById('program').value,
//         mode: document.getElementById('mode').value,
//         city: document.getElementById('city').value,
//         authorized: document.getElementById('authorize').checked
//     };

//     // Here you would typically send the data to your server
//     console.log('Form submitted:', formData);
//     alert('Thank you for your inquiry. We will contact you soon!');
    
//     // Reset form
//     this.reset();
// });

// // Add floating label behavior
// document.querySelectorAll('.form-group input, .form-group select').forEach(element => {
//     element.addEventListener('focus', function() {
//         this.nextElementSibling.classList.add('active');
//     });

//     element.addEventListener('blur', function() {
//         if (!this.value) {
//             this.nextElementSibling.classList.remove('active');
//         }
//     });
// });