// // script.js

// // Form Submission Handling
// document.getElementById('enquiryForm').addEventListener('submit', function (e) {
//     e.preventDefault(); // Prevent form submission
  
//     // Get form data
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData.entries());
  
//     // Display success message
//     alert(`Thank you, ${data.firstName}! Your enquiry has been submitted.`);
  
//     // Reset form
//     e.target.reset();
//   });
  
//   // Floating Labels for Form Inputs
//   const formGroups = document.querySelectorAll('.form-group');
  
//   formGroups.forEach((group) => {
//     const input = group.querySelector('input');
//     const label = group.querySelector('label');
  
//     input.addEventListener('focus', () => {
//       label.style.top = '0';
//       label.style.fontSize = '0.8rem';
//       label.style.color = 'var(--primary)';
//     });
  
//     input.addEventListener('blur', () => {
//       if (!input.value) {
//         label.style.top = '50%';
//         label.style.fontSize = '1rem';
//         label.style.color = 'var(--text-light)';
//       }
//     });
//   });


 // Back to Top Button
 const backToTop = document.getElementById('backToTop');
 window.addEventListener('scroll', () => {
   if (window.scrollY > 300) {
     backToTop.style.display = 'block';
   } else {
     backToTop.style.display = 'none';
   }
 });

 backToTop.addEventListener('click', () => {
   window.scrollTo({ top: 0, behavior: 'smooth' });
 });