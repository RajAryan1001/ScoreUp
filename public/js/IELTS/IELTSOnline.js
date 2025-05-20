// script.js

// Back to Top Button
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// Form Submission Handling
document.getElementById('enquiryForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form submission

  // Get form data
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // Display success message
  alert(`Thank you, ${data.firstName}! Your enquiry has been submitted.`);

  // Reset form
  e.target.reset();
});


// script.js
// script.js

// Testimonials Scroll Functionality
let currentTestimonial = 0;
const testimonialsGrid = document.querySelector('.testimonials-grid');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const totalTestimonials = testimonialCards.length;

function scrollTestimonials(direction) {
  currentTestimonial += direction;

  // Handle edge cases
  if (currentTestimonial < 0) {
    currentTestimonial = totalTestimonials - 1;
  } else if (currentTestimonial >= totalTestimonials) {
    currentTestimonial = 0;
  }

  // Calculate scroll position
  const scrollAmount = testimonialCards[0].clientWidth * currentTestimonial;
  testimonialsGrid.scrollTo({
    left: scrollAmount,
    behavior: 'smooth',
  });
}