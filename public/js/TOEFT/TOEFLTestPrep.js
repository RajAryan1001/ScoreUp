 // Back to Top Button Script
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
         behavior: 'smooth'
     });
 }
