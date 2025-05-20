document.addEventListener("DOMContentLoaded", () => {
  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger)

  // Navbar functionality
  const navToggle = document.querySelector(".nav-toggle")
  const navMenu = document.querySelector(".nav-menu")
  const dropdowns = document.querySelectorAll(".dropdown")

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active")
      this.setAttribute("aria-expanded", this.getAttribute("aria-expanded") === "true" ? "false" : "true")

      const hamburger = this.querySelector(".hamburger")

      if (navMenu.classList.contains("active")) {
        hamburger.style.background = "transparent"
        hamburger.style.transform = "rotate(45deg)"
        hamburger.style.transition = "var(--transition)"

        // Use pseudo-elements properly
        document.documentElement.style.setProperty("--hamburger-before", "rotate(90deg)")
        document.documentElement.style.setProperty("--hamburger-after", "rotate(90deg)")
      } else {
        hamburger.style.background = "var(--text-color)"
        hamburger.style.transform = "rotate(0)"

        document.documentElement.style.setProperty("--hamburger-before", "rotate(0)")
        document.documentElement.style.setProperty("--hamburger-after", "rotate(0)")
      }
    })
  }

  // Mobile dropdown functionality
  dropdowns.forEach((dropdown) => {
    const link = dropdown.querySelector(".dropdown-toggle")

    if (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault()

        // Toggle current dropdown
        dropdown.classList.toggle("active")

        // Rotate chevron icon
        const icon = this.querySelector("i")
        if (icon) {
          icon.style.transform = dropdown.classList.contains("active") ? "rotate(180deg)" : "rotate(0)"
        }

        // Ensure all sections are visible in mobile view
        if (window.innerWidth <= 768 && dropdown.classList.contains("active")) {
          const sections = dropdown.querySelectorAll(".dropdown-section")
          sections.forEach((section) => {
            section.style.display = "block"
          })
        }
      })
    }
  })

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown") && window.innerWidth > 768) {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("active")
      })
    }
  })

  // Hero section animations
  const animateTexts = document.querySelectorAll(".animate-text")

  animateTexts.forEach((text) => {
    gsap.to(text, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: text,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })
  })

  // Image slider functionality - Fixed version
const slides = document.querySelectorAll(".slider-container .slide")
const dots = document.querySelectorAll(".slider-dots .dot")
let currentSlide = 0
let slideInterval

function showSlide(index) {
  // Check if elements exist
  if (!slides.length || !dots.length) return
  
  slides.forEach((slide) => slide.classList.remove("active"))
  dots.forEach((dot) => dot.classList.remove("active"))

  slides[index].classList.add("active")
  dots[index].classList.add("active")
}

function nextSlide() {
  if (!slides.length) return
  currentSlide = (currentSlide + 1) % slides.length
  showSlide(currentSlide)
}

function startSlideShow() {
  if (!slides.length) return
  clearInterval(slideInterval) // Clear any existing interval
  slideInterval = setInterval(nextSlide, 5000)
}

if (dots.length) {
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval)
      currentSlide = index
      showSlide(currentSlide)
      startSlideShow()
    })
  })
}

// Only start if we have slides
if (slides.length) {
  startSlideShow()
}

  // Course filtering functionality
  const courseCards = document.querySelectorAll(".course-card")
  const courseFilter = document.getElementById("course-filter")
  const courseSearch = document.getElementById("course-search")

  function filterCourses() {
    const filterValue = courseFilter.value
    const searchValue = courseSearch.value.toLowerCase()

    courseCards.forEach((card) => {
      const category = card.getAttribute("data-category")
      const title = card.querySelector("h3").textContent.toLowerCase()
      const description = card.querySelector("p").textContent.toLowerCase()

      const matchesFilter = filterValue === "all" || category === filterValue
      const matchesSearch = title.includes(searchValue) || description.includes(searchValue)

      if (matchesFilter && matchesSearch) {
        card.style.display = "flex"
        gsap.to(card, { opacity: 1, y: 0, duration: 0.5 })
      } else {
        gsap.to(card, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            card.style.display = "none"
          },
        })
      }
    })
  }

  if (courseFilter) {
    courseFilter.addEventListener("change", filterCourses)
  }

  if (courseSearch) {
    courseSearch.addEventListener("input", filterCourses)
  }

  // Testimonial slider functionality
  const testimonialCards = document.querySelectorAll(".testimonial-card")
  const testimonialDots = document.querySelectorAll(".testimonial-dots .dot")
  const prevBtn = document.querySelector(".prev-btn")
  const nextBtn = document.querySelector(".next-btn")
  let currentTestimonial = 0

  function showTestimonial(index) {
    testimonialCards.forEach((card) => card.classList.remove("active"))
    testimonialDots.forEach((dot) => dot.classList.remove("active"))

    testimonialCards[index].classList.add("active")
    testimonialDots[index].classList.add("active")
  }

  function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length
    showTestimonial(currentTestimonial)
  }

  function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length
    showTestimonial(currentTestimonial)
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevTestimonial)
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", nextTestimonial)
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentTestimonial = index
      showTestimonial(currentTestimonial)
    })
  })

  // Stats counter animation
  const statCounts = document.querySelectorAll(".stat-count")

  statCounts.forEach((stat) => {
    const target = Number.parseInt(stat.getAttribute("data-count"))

    gsap.to(stat, {
      innerHTML: target,
      duration: 2,
      ease: "power2.out",
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: stat,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })
  })

  // Scroll animations for sections
  gsap.utils.toArray(".section-header").forEach((header) => {
    gsap.from(header, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: header,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    })
  })

  gsap.utils.toArray(".course-card").forEach((card, i) => {
    gsap.from(card, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    })
  })

  // Sticky header
  const header = document.querySelector(".header")
  let lastScrollTop = 0

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > 100) {
      header.style.height = "70px"
      header.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.height = "80px"
      header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    }

    if (scrollTop > lastScrollTop && scrollTop > 300) {
      header.style.top = "-80px"
    } else {
      header.style.top = "0"
    }

    lastScrollTop = scrollTop
  })

  // Responsive adjustments
  function handleResize() {
    if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
      navToggle.setAttribute("aria-expanded", "false")
    }
  }

  window.addEventListener("resize", handleResize)

  // Add hover effects with GSAP
  const courseFeatures = document.querySelectorAll(".course-features span")

  courseFeatures.forEach((feature) => {
    feature.addEventListener("mouseenter", () => {
      gsap.to(feature, {
        scale: 1.05,
        duration: 0.3,
      })
    })

    feature.addEventListener("mouseleave", () => {
      gsap.to(feature, {
        scale: 1,
        duration: 0.3,
      })
    })
  })

  // Add parallax effect to hero section
  if (window.innerWidth > 768) {
    const heroSection = document.querySelector(".hero-section")

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      gsap.to(heroSection, {
        backgroundPosition: `${x * 20}% ${y * 20}%`,
        duration: 1,
      })
    })
  }

  // Add this function to ensure all dropdown sections are visible in mobile view
  function ensureAllSectionsVisible() {
    if (window.innerWidth <= 768) {
      const activeDropdowns = document.querySelectorAll(".dropdown.active")
      activeDropdowns.forEach((dropdown) => {
        const sections = dropdown.querySelectorAll(".dropdown-section")
        sections.forEach((section) => {
          section.style.display = "block"
        })
      })
    }
  }

  // Call this function on resize and on page load
  window.addEventListener("resize", ensureAllSectionsVisible)
  document.addEventListener("DOMContentLoaded", ensureAllSectionsVisible)
})