document.addEventListener('DOMContentLoaded', () => {

    // --- Advanced Animations ---

    // 1. Reveal on Scroll (Intersection Observer)
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reveal');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, revealOptions);

    // Observe elements with reveal classes
    document.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right').forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Hero Parallax Effect
    const heroSection = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            const speed = 0.5;
            heroSection.style.backgroundPositionY = `${window.scrollY * speed}px`;
        }
    });

    // --- End Animations ---

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle (Simple implementation)
    // Note: Since I didn't create a full overlay menu in HTML, 
    // I'll add a simple alert or just console log for now as the CSS hides links.
    // In a real scenario, we'd toggle a class on the nav-links.

    // Let's make the mobile menu work by toggling a class
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    function closeMobileMenu() {
        if (navLinks) {
            navLinks.style.display = 'none';
            navbar.style.background = 'rgba(15, 15, 15, 0.8)';
        }
    }

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                closeMobileMenu();
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0f0f0f';
                navLinks.style.padding = '2rem';
                navbar.style.background = '#0f0f0f';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    closeMobileMenu();
                }
            });
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Fade in text-elements
    const animatedElements = document.querySelectorAll('h2, .feature-box, .card, .step, .benefit-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Booking Modal Logic
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');
    const bookingForm = document.getElementById('bookingForm');

    // Open Modal elements (Select all buttons that should trigger the modal)
    // We target links with href="#offer" AND the specific buttons
    const triggerButtons = document.querySelectorAll('a[href="#offer"], .btn-primary, .btn-outline');

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // If it's the specific specific "Reservar" action, open modal
            // Ideally we check if it is a booking intent
            if (btn.textContent.includes('RESERVA') || btn.textContent.includes('Reserva') || btn.getAttribute('href') === '#offer') {
                e.preventDefault();
                modal.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close if clicking outside
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    // Handle Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simulate processing
            const btn = bookingForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Procesando...';
            btn.disabled = true;

            setTimeout(() => {
                alert('¡Felicidades! Tu solicitud ha sido recibida. Te contactaremos en breve por WhatsApp para confirmar tu horario.');
                closeModal();
                bookingForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const logoImg = document.querySelector('.logo img');

    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.className = 'ph ph-moon';
        if (logoImg) logoImg.src = 'assets/images/logo-light.png';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');

            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.className = 'ph ph-sun';
                if (logoImg) logoImg.src = 'assets/images/logo.png';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.className = 'ph ph-moon';
                if (logoImg) logoImg.src = 'assets/images/logo-light.png';
            }
        });
    }

});
