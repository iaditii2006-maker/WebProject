// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const moonIcon = '\u{1F319}';
const sunIcon = '\u2600\uFE0F';

// Check for saved dark mode preference
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (darkModeToggle && isDarkMode) {
  htmlElement.classList.add('dark-mode');
  darkModeToggle.textContent = sunIcon;
  darkModeToggle.setAttribute('aria-pressed', 'true');
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark-mode');
    const isNowDark = htmlElement.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isNowDark);
    darkModeToggle.textContent = isNowDark ? sunIcon : moonIcon;
    darkModeToggle.setAttribute('aria-pressed', isNowDark ? 'true' : 'false');
  });
}

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active') ? 'true' : 'false');
  });
  
  // Close menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// FAQ Toggle Functionality
function toggleFAQ(button) {
  const faqItem = button.closest('.faq-item');
  const isActive = faqItem.classList.contains('active');
  
  // Close other FAQ items
  document.querySelectorAll('.faq-item.active').forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('active');
    }
  });
  
  // Toggle current FAQ item
  if (isActive) {
    faqItem.classList.remove('active');
  } else {
    faqItem.classList.add('active');
  }
}

// Animate metric numbers on scroll
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.ceil(current);
    }
  }, 30);
}

// Observe metrics section
const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.metric-value').forEach(metric => {
        const target = parseInt(metric.getAttribute('data-target'));
        if (target) {
          animateCounter(metric, target);
        }
      });
      metricsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const metricsSection = document.querySelector('.metrics-section');
if (metricsSection) {
  metricsObserver.observe(metricsSection);
}

// Back to Top Button Functionality
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Animate elements on scroll into view
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.card, .testimonial-card, section').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Card click animation
document.querySelectorAll('.card-link').forEach(link => {
  link.addEventListener('mousedown', function(e) {
    if (e.button === 0) { // Left click only
      this.style.transform = 'scale(0.98)';
    }
  });
  
  link.addEventListener('mouseup', function() {
    this.style.transform = 'scale(1)';
  });
  
  link.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

// Contact Form Validation and Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const hotelNameInput = document.getElementById('hotelName');
  const hotelTypeSelect = document.getElementById('hotelType');

  // Real-time validation
  const validateField = (field) => {
    const fieldName = field.id;
    const errorElement = document.getElementById(fieldName + 'Error');
    const formGroup = field.parentElement;
    let isValid = true;
    let errorMsg = '';

    if (field.value.trim() === '') {
      isValid = false;
      errorMsg = 'This field is required';
    } else if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMsg = 'Please enter a valid email address';
      }
    } else if (fieldName === 'name') {
      if (field.value.length < 2) {
        isValid = false;
        errorMsg = 'Name must be at least 2 characters';
      }
    }

    if (isValid) {
      formGroup.classList.remove('error');
      if (errorElement) errorElement.textContent = '';
    } else {
      formGroup.classList.add('error');
      if (errorElement) errorElement.textContent = errorMsg;
    }

    return isValid;
  };

  // Validate on blur
  [nameInput, emailInput, hotelNameInput, hotelTypeSelect].forEach(field => {
    if (field) {
      field.addEventListener('blur', () => validateField(field));
    }
  });

  // Form submission
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate all fields
    const allValid = [nameInput, emailInput, hotelNameInput, hotelTypeSelect].every(field => {
      return field ? validateField(field) : true;
    });

    if (!allValid) {
      return;
    }

    // Submit form
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const successMsg = document.getElementById('successMessage');

    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      submitBtn.textContent = '\u2713 Submitted!';
      successMsg.style.display = 'block';
      
      // Reset form after 2 seconds
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
        successMsg.style.display = 'none';
        [nameInput, emailInput, hotelNameInput, hotelTypeSelect].forEach(field => {
          if (field) field.parentElement.classList.remove('error');
        });
      }, 2000);
    }, 1000);
  });
}

// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Newsletter Form Handling
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('input[type="email"]');
    const button = this.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    // Simulate subscription
    setTimeout(() => {
      button.textContent = '\u2713 Subscribed!';
      button.style.background = 'white';
      button.style.color = '#22c55e';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
        button.style.color = '';
        emailInput.value = '';
      }, 2000);
    }, 800);
  });
}

// Page load animation
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});







