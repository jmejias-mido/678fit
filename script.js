import { createClient } from '@supabase/supabase-js'

// --- Supabase Config ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Validar configuración
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_KEY');
    // We can't use showToast here yet as it's not defined in this scope, but console error is enough for dev.
}

// Inicializar cliente
// Inicializar cliente de forma segura
let supabase = null;
try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Variables de entorno faltantes');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.warn('Supabase no se pudo inicializar. El formulario de reserva no funcionará.', error);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Toast Notifications ---
    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';

        toast.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

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
    if (heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                const speed = 0.5;
                heroSection.style.backgroundPositionY = `${window.scrollY * speed}px`;
            }
        });
    }

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

    // Mobile Menu Toggle
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

    // Intersection Observer for scroll animations (Legacy/Secondary)
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

    const triggerButtons = document.querySelectorAll('a[href="#offer"], .btn-primary, .btn-outline');

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.type === 'submit') return;

            if (btn.textContent.includes('RESERVA') || btn.textContent.includes('Reserva') || btn.getAttribute('href') === '#offer') {
                e.preventDefault();
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    // Handle Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = bookingForm.querySelector('button');
            const originalText = btn.textContent;

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const goal = document.getElementById('goal').value;

            if (!name || !phone || !goal) {
                showToast('Por favor completa todos los campos.', 'error');
                return;
            }

            btn.textContent = 'Procesando...';
            btn.disabled = true;

            try {
                if (!supabase) {
                    throw new Error('El sistema de reservas no está configurado correctamente. Contacta al administrador.');
                }

                // Insert into Supabase
                const { data, error } = await supabase
                    .from('leads')
                    .insert([
                        { name, phone, goal }
                    ]);

                if (error) throw error;

                showToast('¡Felicidades! Tu solicitud ha sido recibida correctamente.', 'success');
                closeModal();
                bookingForm.reset();

            } catch (error) {
                console.error('Error:', error);
                showToast('Error: ' + (error.message || 'Intenta de nuevo'), 'error');
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
