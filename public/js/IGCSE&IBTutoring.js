// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('enquiryForm');
    
//     form.addEventListener('submit', function(e) {
//         e.preventDefault();
//         // Get form data
//         const formData = {
//             firstName: document.getElementById('firstName').value,
//             lastName: document.getElementById('lastName').value,
//             email: document.getElementById('email').value,
//             mobile: document.getElementById('mobile').value,
//             program: document.getElementById('program').value,
//             authorize: document.getElementById('authorize').checked
//         };
        
//         // Log form data (replace with your form submission logic)
//         console.log('Form submitted:', formData);
        
//         // You can add AJAX request here to submit the form data to your server
//         // Example:
//         // fetch('/submit-enquiry', {
//         //     method: 'POST',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify(formData),
//         // })
//         // .then(response => response.json())
//         // .then(data => {
//         //     console.log('Success:', data);
//         //     // Show success message
//         // })
//         // .catch((error) => {
//         //     console.error('Error:', error);
//         //     // Show error message
//         // });
        
//         // For demo purposes, show an alert
//         alert('Form submitted successfully!');
//         form.reset();
//     });
    
//     // Fix for floating labels with select elements
//     const selects = document.querySelectorAll('select');
//     selects.forEach(select => {
//         select.addEventListener('change', function() {
//             if (this.value !== '') {
//                 this.classList.add('has-value');
//             } else {
//                 this.classList.remove('has-value');
//             }
//         });
//     });
// });