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
        if (navbar) {
            navbar.classList.remove('nav-open');
        }
    }

    function openMobileMenu() {
        if (navbar) {
            navbar.classList.add('nav-open');
        }
    }

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            if (navbar.classList.contains('nav-open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
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

    // --- Supabase Config ---
    // TODO: Reemplaza con tus claves reales de Supabase
    const SUPABASE_URL = 'https://yazwxmnunemzzmvgzvjj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_4kEZ9HxhkwdAtqcSQflNVQ_qr3aIF6q';

    // Inicializar cliente (verificamos si existe la librería para evitar errores si no cargó)
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // Handle Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = bookingForm.querySelector('button');
            const originalText = btn.textContent;

            // Get form values
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const goal = document.getElementById('goal').value;

            // Basic Validation
            if (!name || !phone || !goal) {
                alert('Por favor completa todos los campos.');
                return;
            }

            btn.textContent = 'Procesando...';
            btn.disabled = true;

            try {
                if (!supabase) throw new Error('Supabase client not initialized');

                // Insert into Supabase
                const { data, error } = await supabase
                    .from('leads')
                    .insert([
                        { name, phone, goal }
                    ]);

                if (error) throw error;

                // Success Feedback
                alert('¡Felicidades! Tu solicitud ha sido recibida correctamente. Te contactaremos pronto.');
                closeModal();
                bookingForm.reset();

            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp.');
                // Fallback for demo/testing without valid keys
                if (error.message.includes('Supabase')) {
                    console.log('Fallback: Datos que se hubieran enviado:', { name, phone, goal });
                }
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
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
