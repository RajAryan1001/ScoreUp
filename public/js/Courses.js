// Initialize GSAP
document.addEventListener('DOMContentLoaded', function() {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Header animations
  gsap.from(".logo", {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
  });

  gsap.from(".nav-item", {
      y: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
  });

  // Hero section animations
  gsap.from(".hero-text h1", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
  });

  gsap.from(".hero-text h2", {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out"
  });

  gsap.from(".hero-text p", {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.6,
      ease: "power3.out"
  });

  gsap.from(".hero-buttons .btn", {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.9,
      stagger: 0.2,
      ease: "power3.out"
  });

  // Search and filter animations
  gsap.from(".search-filter-container", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
          trigger: ".courses-section",
          start: "top 80%",
          toggleActions: "play none none none"
      }
  });

  // Section headers animation
  gsap.utils.toArray(".section-header").forEach(header => {
      gsap.from(header, {
          y: 50,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
              trigger: header,
              start: "top 80%",
              toggleActions: "play none none none"
          }
      });
  });

  // Course cards animation
  gsap.utils.toArray(".course-card").forEach((card, i) => {
      gsap.from(card, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1,
          scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
          }
      });
  });

  // Course card hover animations
  const courseCardsHover = document.querySelectorAll('.course-card');
  
  courseCardsHover.forEach(card => {
      card.addEventListener('mouseenter', () => {
          gsap.to(card, {
              y: -10,
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
              duration: 0.3
          });
          
          // Animate the course image
          const image = card.querySelector('.course-image img');
          gsap.to(image, {
              scale: 1.05,
              duration: 0.5
          });
          
          // Animate the course title underline
          const titleUnderline = card.querySelector('.course-content h3::after');
          if (titleUnderline) {
              gsap.to(titleUnderline, {
                  width: "60px",
                  duration: 0.3
              });
          }
      });
      
      card.addEventListener('mouseleave', () => {
          gsap.to(card, {
              y: 0,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              duration: 0.3
          });
          
          // Reset the course image
          const image = card.querySelector('.course-image img');
          gsap.to(image, {
              scale: 1,
              duration: 0.5
          });
          
          // Reset the course title underline
          const titleUnderline = card.querySelector('.course-content h3::after');
          if (titleUnderline) {
              gsap.to(titleUnderline, {
                  width: "40px",
                  duration: 0.3
              });
          }
      });
  });

  // Feature cards animation
  gsap.utils.toArray(".feature-card").forEach((card, i) => {
      gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.2,
          scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
          }
      });
  });

  // Feature card hover animations
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
          gsap.to(card, {
              y: -10,
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
              duration: 0.3
          });
          
          // Animate the feature icon
          const icon = card.querySelector('.feature-icon');
          gsap.to(icon, {
              backgroundColor: "var(--primary-color)",
              duration: 0.3
          });
          
          // Animate the icon color
          const iconElement = card.querySelector('.feature-icon i');
          gsap.to(iconElement, {
              color: "white",
              duration: 0.3
          });
      });
      
      card.addEventListener('mouseleave', () => {
          gsap.to(card, {
              y: 0,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              duration: 0.3
          });
          
          // Reset the feature icon
          const icon = card.querySelector('.feature-icon');
          gsap.to(icon, {
              backgroundColor: "rgba(67, 97, 238, 0.1)",
              duration: 0.3
          });
          
          // Reset the icon color
          const iconElement = card.querySelector('.feature-icon i');
          gsap.to(iconElement, {
              color: "var(--primary-color)",
              duration: 0.3
          });
      });
  });

  // CTA section animation
  gsap.from(".cta-container", {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none none"
      }
  });

  gsap.from(".cta-container h2", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none none"
      }
  });

  gsap.from(".cta-container p", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none none"
      }
  });

  gsap.from(".cta-buttons .btn", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.6,
      stagger: 0.2,
      scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none none"
      }
  });

  // Footer animation
  gsap.from(".footer-column", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
          trigger: ".footer",
          start: "top 90%",
          toggleActions: "play none none none"
      }
  });

  // Social icons hover animation
  const socialIcons = document.querySelectorAll('.social-icons a');
  
  socialIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
          gsap.to(icon, {
              y: -5,
              duration: 0.3
          });
      });
      
      icon.addEventListener('mouseleave', () => {
          gsap.to(icon, {
              y: 0,
              duration: 0.3
          });
      });
  });

  // Parallax effect for hero section
  if (window.innerWidth > 768) {
      const heroSection = document.querySelector('.hero-section');
      
      window.addEventListener('mousemove', e => {
          const x = e.clientX / window.innerWidth;
          const y = e.clientY / window.innerHeight;
          
          gsap.to(heroSection, {
              backgroundPosition: `${x * 20}% ${y * 20}%`,
              duration: 1
          });
      });
  }

  // Animate course benefits on hover
  const courseBenefits = document.querySelectorAll('.course-benefits li');
  
  courseBenefits.forEach(benefit => {
      benefit.addEventListener('mouseenter', () => {
          gsap.to(benefit, {
              x: 5,
              duration: 0.3
          });
          
          const icon = benefit.querySelector('i');
          gsap.to(icon, {
              scale: 1.2,
              duration: 0.3
          });
      });
      
      benefit.addEventListener('mouseleave', () => {
          gsap.to(benefit, {
              x: 0,
              duration: 0.3
          });
          
          const icon = benefit.querySelector('i');
          gsap.to(icon, {
              scale: 1,
              duration: 0.3
          });
      });
  });

  // Animate feature benefits on hover
  const featureBenefits = document.querySelectorAll('.feature-benefits li');
  
  featureBenefits.forEach(benefit => {
      benefit.addEventListener('mouseenter', () => {
          gsap.to(benefit, {
              x: 5,
              duration: 0.3
          });
          
          const icon = benefit.querySelector('i');
          gsap.to(icon, {
              scale: 1.2,
              duration: 0.3
          });
      });
      
      benefit.addEventListener('mouseleave', () => {
          gsap.to(benefit, {
              x: 0,
              duration: 0.3
          });
          
          const icon = benefit.querySelector('i');
          gsap.to(icon, {
              scale: 1,
              duration: 0.3
          });
      });
  });

  // Animate buttons on hover
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
          gsap.to(button, {
              scale: 1.05,
              duration: 0.3
          });
      });
      
      button.addEventListener('mouseleave', () => {
          gsap.to(button, {
              scale: 1,
              duration: 0.3
          });
      });
  });

  // Sticky header with GSAP
  let lastScrollTop = 0;
  
  ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onUpdate: (self) => {
          const scrollTop = self.scroll();
          
          if (scrollTop > 100) {
              gsap.to(".header", {
                  height: "70px",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                  duration: 0.3
              });
          } else {
              gsap.to(".header", {
                  height: "80px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  duration: 0.3
              });
          }
          
          if (scrollTop > lastScrollTop && scrollTop > 300) {
              gsap.to(".header", {
                  top: "-80px",
                  duration: 0.5
              });
          } else {
              gsap.to(".header", {
                  top: "0",
                  duration: 0.5
              });
          }
          
          lastScrollTop = scrollTop;
      }
  });

  // Text reveal animation for paragraphs
  gsap.utils.toArray("p:not(.hero-text p):not(.cta-container p)").forEach(paragraph => {
      gsap.from(paragraph, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
              trigger: paragraph,
              start: "top 90%",
              toggleActions: "play none none none"
          }
      });
  });

  // Navbar functionality
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const dropdowns = document.querySelectorAll(".dropdown");

  if (navToggle) {
      navToggle.addEventListener("click", function () {
          navMenu.classList.toggle("active");
          this.setAttribute("aria-expanded", this.getAttribute("aria-expanded") === "true" ? "false" : "true");

          const hamburger = this.querySelector(".hamburger");

          if (navMenu.classList.contains("active")) {
              hamburger.style.background = "transparent";
              hamburger.style.transform = "rotate(45deg)";
              hamburger.style.transition = "var(--transition)";

              // Use pseudo-elements properly
              document.documentElement.style.setProperty("--hamburger-before", "rotate(90deg)");
              document.documentElement.style.setProperty("--hamburger-after", "rotate(90deg)");
          } else {
              hamburger.style.background = "var(--text-color)";
              hamburger.style.transform = "rotate(0)";

              document.documentElement.style.setProperty("--hamburger-before", "rotate(0)");
              document.documentElement.style.setProperty("--hamburger-after", "rotate(0)");
          }
      });
  }

  // Mobile dropdown functionality
  dropdowns.forEach((dropdown) => {
      const link = dropdown.querySelector(".dropdown-toggle");

      if (link) {
          link.addEventListener("click", function (e) {
              e.preventDefault();

              // Toggle current dropdown
              dropdown.classList.toggle("active");

              // Rotate chevron icon
              const icon = this.querySelector("i");
              if (icon) {
                  icon.style.transform = dropdown.classList.contains("active") ? "rotate(180deg)" : "rotate(0)";
              }

              // Ensure all sections are visible in mobile view
              if (window.innerWidth <= 768 && dropdown.classList.contains("active")) {
                  const sections = dropdown.querySelectorAll(".dropdown-section");
                  sections.forEach((section) => {
                      section.style.display = "block";
                  });
              }
          });
      }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown") && window.innerWidth > 768) {
          dropdowns.forEach((dropdown) => {
              dropdown.classList.remove("active");
          });
      }
  });

  // Search and filter functionality
  const courseSearch = document.getElementById('course-search');
  const courseFilter = document.getElementById('course-filter');
  const searchBtn = document.getElementById('search-btn');
  const courseCardsSearch = document.querySelectorAll('.course-card');
  const noResults = document.getElementById('no-results');

  // Function to filter courses
  function filterCourses() {
      const searchTerm = courseSearch.value.toLowerCase();
      const filterValue = courseFilter.value;
      
      let visibleCount = 0;
      
      courseCardsSearch.forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase();
          const description = card.querySelector('p').textContent.toLowerCase();
          const category = card.getAttribute('data-category');
          
          const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
          const matchesFilter = filterValue === 'all' || category === filterValue;
          
          if (matchesSearch && matchesFilter) {
              gsap.to(card, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.5,
                  display: 'flex'
              });
              visibleCount++;
          } else {
              gsap.to(card, {
                  opacity: 0,
                  y: 20,
                  scale: 0.95,
                  duration: 0.5,
                  onComplete: () => {
                      card.style.display = 'none';
                  }
              });
          }
      });
      
      // Show or hide no results message
      if (visibleCount === 0) {
          gsap.to(noResults, {
              display: 'block',
              opacity: 1,
              y: 0,
              duration: 0.5
          });
      } else {
          gsap.to(noResults, {
              opacity: 0,
              y: 20,
              duration: 0.3,
              onComplete: () => {
                  noResults.style.display = 'none';
              }
          });
      }
  }
  
  // Event listeners for search and filter
  if (courseSearch) {
      courseSearch.addEventListener('input', filterCourses);
  }
  
  if (courseFilter) {
      courseFilter.addEventListener('change', filterCourses);
  }
  
  if (searchBtn) {
      searchBtn.addEventListener('click', filterCourses);
  }
});