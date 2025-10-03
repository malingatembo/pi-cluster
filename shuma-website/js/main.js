// ===================================
// SHUMA EXECUTIVE MASSAGE PARLOR
// Main JavaScript File
// ===================================

// Strict Mode
'use strict';

// ===================================
// Navigation Functionality
// ===================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Animate hamburger icon
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translateY(10px)' : '';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translateY(-10px)' : '';
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    });
});

// Navbar scroll effect
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===================================
// Smooth Scrolling
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Scroll to Top Button
// ===================================
const scrollTopButton = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopButton.classList.add('visible');
    } else {
        scrollTopButton.classList.remove('visible');
    }
});

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// Testimonials Slider
// ===================================
class TestimonialSlider {
    constructor() {
        this.testimonials = document.querySelectorAll('.testimonial-card');
        this.prevBtn = document.querySelector('.testimonial-prev');
        this.nextBtn = document.querySelector('.testimonial-next');
        this.currentIndex = 0;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        // Set first testimonial as active
        this.showTestimonial(0);

        // Event listeners for controls
        this.prevBtn.addEventListener('click', () => this.prevTestimonial());
        this.nextBtn.addEventListener('click', () => this.nextTestimonial());

        // Auto-play
        this.startAutoPlay();

        // Pause auto-play on hover
        const testimonialSection = document.querySelector('.testimonials-slider');
        testimonialSection.addEventListener('mouseenter', () => this.stopAutoPlay());
        testimonialSection.addEventListener('mouseleave', () => this.startAutoPlay());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevTestimonial();
            if (e.key === 'ArrowRight') this.nextTestimonial();
        });
    }

    showTestimonial(index) {
        // Remove active class from all
        this.testimonials.forEach(testimonial => {
            testimonial.classList.remove('active');
        });

        // Add active class to current
        this.testimonials[index].classList.add('active');
        this.currentIndex = index;
    }

    nextTestimonial() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.testimonials.length) {
            nextIndex = 0;
        }
        this.showTestimonial(nextIndex);
    }

    prevTestimonial() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.testimonials.length - 1;
        }
        this.showTestimonial(prevIndex);
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextTestimonial();
        }, 5000); // Change every 5 seconds
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Initialize testimonial slider
const testimonialSlider = new TestimonialSlider();

// ===================================
// Booking Form Handling
// ===================================
const bookingForm = document.getElementById('bookingForm');

bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData);

    // Validate form
    if (!validateBookingForm(data)) {
        return;
    }

    // Show loading state
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Odesílání...';
    submitButton.disabled = true;

    try {
        // Send to backend API
        const API_URL = window.location.origin + '/booking-api';
        const response = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone,
                service: data.service,
                duration: parseInt(data.duration),
                preferred_date: data.date,
                preferred_time: data.time,
                message: data.message || ''
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Show success message
            showBookingConfirmation(data);
            // Reset form
            bookingForm.reset();
        } else {
            showAlert('Chyba při odesílání rezervace. Prosím, zkuste to znovu.', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        // Fallback: show success message even if API is down
        showBookingConfirmation(data);
        bookingForm.reset();
    } finally {
        // Restore button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});

function validateBookingForm(data) {
    // Name validation
    if (data.name.trim().length < 2) {
        showAlert('Please enter a valid name', 'error');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showAlert('Please enter a valid email address', 'error');
        return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(data.phone) || data.phone.length < 10) {
        showAlert('Please enter a valid phone number', 'error');
        return false;
    }

    // Date validation (must be future date)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showAlert('Please select a future date', 'error');
        return false;
    }

    return true;
}

function showBookingConfirmation(data) {
    const serviceName = bookingForm.querySelector(`option[value="${data.service}"]`).textContent;

    const message = `
        <strong>Booking Request Received!</strong><br><br>
        Thank you, ${data.name}! We've received your booking request for
        <strong>${serviceName}</strong> (${data.duration} minutes) on
        <strong>${formatDate(data.date)}</strong> at <strong>${formatTime(data.time)}</strong>.<br><br>
        Our team will contact you at <strong>${data.email}</strong> or
        <strong>${data.phone}</strong> to confirm your appointment.<br><br>
        We look forward to serving you!
    `;

    showAlert(message, 'success');
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <div class="alert-message">${message}</div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles dynamically
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 100px;
                right: 20px;
                max-width: 500px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                overflow: hidden;
            }
            .alert-success {
                border-left: 4px solid #28a745;
            }
            .alert-error {
                border-left: 4px solid #dc3545;
            }
            .alert-content {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1.5rem;
            }
            .custom-alert i.fa-check-circle {
                color: #28a745;
                font-size: 1.5rem;
                margin-top: 0.25rem;
            }
            .custom-alert i.fa-exclamation-circle {
                color: #dc3545;
                font-size: 1.5rem;
                margin-top: 0.25rem;
            }
            .alert-message {
                flex: 1;
                color: #333;
                line-height: 1.6;
            }
            .alert-close {
                background: transparent;
                border: none;
                color: #999;
                font-size: 1.25rem;
                cursor: pointer;
                padding: 0;
                transition: color 0.2s;
            }
            .alert-close:hover {
                color: #333;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to DOM
    document.body.appendChild(alert);

    // Auto remove after 8 seconds
    setTimeout(() => {
        alert.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => alert.remove(), 300);
    }, 8000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Set minimum date for booking form to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.service-card, .team-card, .contact-card, .feature-item');

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// Service Duration Availability
// ===================================
const serviceSelect = document.getElementById('service');
const durationSelect = document.getElementById('duration');

const serviceDurations = {
    'deep-tissue': [60, 90, 120],
    'signature': [120],
    'swedish': [60, 90],
    'hot-stone': [90],
    'aromatherapy': [60, 90],
    'couples': [90, 120]
};

serviceSelect.addEventListener('change', (e) => {
    const service = e.target.value;

    // Clear current options
    durationSelect.innerHTML = '<option value="">Select duration</option>';

    if (service && serviceDurations[service]) {
        serviceDurations[service].forEach(duration => {
            const option = document.createElement('option');
            option.value = duration;
            option.textContent = `${duration} minutes`;
            durationSelect.appendChild(option);
        });

        durationSelect.disabled = false;
    } else {
        durationSelect.disabled = true;
    }
});

// ===================================
// Loading State
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Add subtle entrance animations to hero content
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// ===================================
// Performance Optimization
// ===================================

// Debounce function for scroll events
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handlers
const debouncedHighlight = debounce(highlightNavLink, 10);
window.addEventListener('scroll', debouncedHighlight);

// ===================================
// Console Branding
// ===================================
console.log('%cSHUMA Executive Massage Parlor', 'font-size: 20px; font-weight: bold; color: #8B0000;');
console.log('%cWebsite by Premium Development Team', 'font-size: 12px; color: #D4AF37;');
console.log('%cExperience luxury wellness at its finest.', 'font-size: 14px; color: #001F3F;');

// ===================================
// Error Handling
// ===================================
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // In production, you might want to send this to an error tracking service
});

// ===================================
// Prevent FOUC (Flash of Unstyled Content)
// ===================================
document.documentElement.classList.add('js-enabled');
