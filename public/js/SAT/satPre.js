// Back to Top Button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// FAQ Toggle
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

// Testimonials Slider
const testimonialsContainer = document.querySelector('.testimonials-container');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let scrollAmount = 0;

prevBtn.addEventListener('click', () => {
  scrollAmount -= testimonialsContainer.clientWidth;
  if (scrollAmount < 0) scrollAmount = 0;
  testimonialsContainer.scrollTo({
    left: scrollAmount,
    behavior: 'smooth'
  });
});

nextBtn.addEventListener('click', () => {
  scrollAmount += testimonialsContainer.clientWidth;
  if (scrollAmount > testimonialsContainer.scrollWidth) scrollAmount = testimonialsContainer.scrollWidth;
  testimonialsContainer.scrollTo({
    left: scrollAmount,
    behavior: 'smooth'
  });
});