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

// Redirect /admin to /admin/ (trailing slash fix for local dev)
if (window.location.pathname === '/admin') {
    window.location.href = '/admin/';
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
        if (logoImg) logoImg.src = '/assets/images/logo-light.png';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');

            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.className = 'ph ph-sun';
                if (logoImg) logoImg.src = '/assets/images/logo.png';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.className = 'ph ph-moon';
                if (logoImg) logoImg.src = '/assets/images/logo-light.png';
            }
        });
    }

    // =============================================
    // PLANS SECTION
    // =============================================

    let allPlans = [];
    let selectedPlan = null;
    let currentDuration = 'mensual';
    let selfieFile = null;

    // Fetch plans from Supabase
    async function loadPlans() {
        if (!supabase) {
            console.warn('Supabase no disponible para cargar planes');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            allPlans = data;
            renderPlans(currentDuration);
        } catch (error) {
            console.error('Error loading plans:', error);
            const grid = document.getElementById('plansGrid');
            if (grid) {
                grid.innerHTML = '<p class="text-center text-muted">Error al cargar los planes.</p>';
            }
        }
    }

    // Render plans for selected duration
    function renderPlans(duration) {
        const grid = document.getElementById('plansGrid');
        if (!grid) return;

        const filteredPlans = allPlans.filter(p => p.duration_type === duration);

        if (filteredPlans.length === 0) {
            grid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">No hay planes disponibles para esta duración.</p>';
            return;
        }

        grid.innerHTML = filteredPlans.map(plan => {
            const tierClass = getTierClass(plan.name);
            const icon = getTierIcon(plan.name);

            return `
                <div class="plan-card ${tierClass}">
                    <div class="plan-icon">${icon}</div>
                    <h3 class="plan-name">${plan.name}</h3>
                    <p class="plan-schedule">${plan.schedule || ''}</p>
                    <p class="plan-includes">${plan.includes || ''}</p>
                    <div class="plan-pricing">
                        ${plan.price_cash ? `
                            <div class="price-option">
                                <div class="price-label">Contado</div>
                                <div class="price-value">Ref ${plan.price_cash}</div>
                            </div>
                        ` : ''}
                        ${plan.price_installments ? `
                            <div class="price-option">
                                <div class="price-label">Cuotas</div>
                                <div class="price-value">Ref ${plan.price_installments}</div>
                            </div>
                        ` : ''}
                        ${!plan.price_cash && !plan.price_installments ? `
                            <div class="price-option" style="flex:1;">
                                <div class="price-value">Consultar</div>
                            </div>
                        ` : ''}
                    </div>
                    <button class="plan-cta" data-plan-id="${plan.id}" data-plan-name="${plan.name}" data-plan-price="${plan.price_cash || plan.price_installments || 0}">
                        INSCRIBIRME
                    </button>
                </div>
            `;
        }).join('');

        // Attach click events to CTA buttons
        grid.querySelectorAll('.plan-cta').forEach(btn => {
            btn.addEventListener('click', () => openRegistrationModal(btn.dataset.planId, btn.dataset.planName, btn.dataset.planPrice));
        });
    }

    function getTierClass(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('oro')) return 'tier-oro';
        if (lowerName.includes('plata')) return 'tier-plata';
        if (lowerName.includes('bronce')) return 'tier-bronce';
        return 'tier-especial';
    }

    function getTierIcon(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('oro')) return '🥇';
        if (lowerName.includes('plata')) return '🥈';
        if (lowerName.includes('bronce')) return '🥉';
        if (lowerName.includes('-18') || lowerName.includes('+60')) return '📚';
        if (lowerName.includes('inscripción')) return '📝';
        return '⚡';
    }

    // Tab switching
    const planTabs = document.querySelectorAll('.plan-tab');
    planTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            planTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentDuration = tab.dataset.duration;
            renderPlans(currentDuration);
        });
    });

    // =============================================
    // REGISTRATION MODAL
    // =============================================

    const registrationModal = document.getElementById('registrationModal');
    const closeRegistrationBtn = document.getElementById('closeRegistration');
    const registrationForm = document.getElementById('registrationForm');
    let currentStep = 1;

    function openRegistrationModal(planId, planName, planPrice) {
        selectedPlan = { id: planId, name: planName, price: planPrice };

        document.getElementById('selectedPlanName').textContent = `${planName} (${currentDuration})`;
        document.getElementById('selectedPlanPrice').textContent = planPrice ? `Ref ${planPrice}` : 'Consultar';

        // Reset form
        if (registrationForm) registrationForm.reset();
        currentStep = 1;
        updateFormStep(1);
        selfieFile = null;
        const selfieUpload = document.getElementById('selfieUpload');
        if (selfieUpload) selfieUpload.classList.remove('has-image');

        if (registrationModal) registrationModal.classList.add('active');
    }

    function closeRegistrationModal() {
        if (registrationModal) registrationModal.classList.remove('active');
    }

    if (closeRegistrationBtn) closeRegistrationBtn.addEventListener('click', closeRegistrationModal);
    if (registrationModal) {
        registrationModal.addEventListener('click', (e) => {
            if (e.target === registrationModal) closeRegistrationModal();
        });
    }

    // Multi-step navigation
    function updateFormStep(step) {
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.progress-step').forEach(s => {
            s.classList.remove('active', 'completed');
            const stepNum = parseInt(s.dataset.step);
            if (stepNum < step) s.classList.add('completed');
            if (stepNum === step) s.classList.add('active');
        });

        const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
        if (targetStep) targetStep.classList.add('active');
    }

    // Step Navigation Buttons
    document.getElementById('toStep2')?.addEventListener('click', () => {
        if (validateStep1()) {
            currentStep = 2;
            updateFormStep(2);
        }
    });

    document.getElementById('backToStep1')?.addEventListener('click', () => {
        currentStep = 1;
        updateFormStep(1);
    });

    document.getElementById('toStep3')?.addEventListener('click', () => {
        if (validateStep2()) {
            currentStep = 3;
            updateFormStep(3);
        }
    });

    document.getElementById('backToStep2')?.addEventListener('click', () => {
        currentStep = 2;
        updateFormStep(2);
    });

    document.getElementById('closeSuccess')?.addEventListener('click', closeRegistrationModal);

    // Step Validations
    function validateStep1() {
        const fullname = document.getElementById('reg_fullname').value.trim();
        const idType = document.getElementById('reg_id_type').value;
        const cedula = document.getElementById('reg_cedula').value.trim();
        const birthdate = document.getElementById('reg_birthdate').value;

        if (!fullname || !cedula || !birthdate) {
            showToast('Por favor completa los campos obligatorios', 'error');
            return false;
        }

        // Validate cedula format (only numbers, 6-10 digits)
        if (!/^[0-9]{6,10}$/.test(cedula)) {
            showToast('La cédula debe tener entre 6 y 10 dígitos numéricos', 'error');
            return false;
        }

        // Validate min age (5 years)
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 14) {
            showToast('La edad mínima es 14 años', 'error');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const phone = document.getElementById('reg_phone').value.trim();
        const emergency = document.getElementById('reg_emergency').value.trim();

        if (!phone || !emergency) {
            showToast('Por favor completa los teléfonos', 'error');
            return false;
        }

        // Validate phone format (10-11 digits)
        if (!/^[0-9]{10,11}$/.test(phone)) {
            showToast('El teléfono debe tener 10-11 dígitos', 'error');
            return false;
        }

        if (!/^[0-9]{10,11}$/.test(emergency)) {
            showToast('El teléfono de emergencia debe tener 10-11 dígitos', 'error');
            return false;
        }

        return true;
    }

    // Auto-calculate age from birthdate
    document.getElementById('reg_birthdate')?.addEventListener('change', (e) => {
        const birthDate = new Date(e.target.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        document.getElementById('reg_age').value = age;
    });

    // Selfie Upload Preview
    document.getElementById('reg_selfie')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selfieFile = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('selfiePreview').src = event.target.result;
                document.getElementById('selfieUpload').classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });

    // Form Submission
    registrationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabase) {
            showToast('Error de conexión', 'error');
            return;
        }

        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;

        try {
            // Get expiration days from settings
            const { data: settings } = await supabase.from('settings').select('value').eq('key', 'expiration_days').single();
            const expirationDays = parseInt(settings?.value || '7');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expirationDays);

            // Generate unique QR code
            const qrCode = `678FIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

            // Upload selfie if exists
            let selfieUrl = null;
            if (selfieFile) {
                const fileName = `${qrCode}-${selfieFile.name}`;
                console.log('Uploading selfie:', fileName, selfieFile.type, selfieFile.size);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('member-selfies')
                    .upload(fileName, selfieFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Selfie upload error:', uploadError);
                    showToast('Error al subir foto: ' + uploadError.message, 'warning');
                } else if (uploadData) {
                    const { data: urlData } = supabase.storage.from('member-selfies').getPublicUrl(fileName);
                    selfieUrl = urlData.publicUrl;
                    console.log('Selfie uploaded:', selfieUrl);
                }
            }

            // Insert member
            const idType = document.getElementById('reg_id_type').value;
            const phoneCountry = document.getElementById('reg_phone_country').value;
            const emergencyCountry = document.getElementById('reg_emergency_country').value;

            const memberData = {
                full_name: document.getElementById('reg_fullname').value.trim(),
                cedula: `${idType}-${document.getElementById('reg_cedula').value.trim()}`,
                birth_date: document.getElementById('reg_birthdate').value,
                age: parseInt(document.getElementById('reg_age').value) || null,
                height_cm: parseInt(document.getElementById('reg_height').value) || null,
                weight_kg: parseFloat(document.getElementById('reg_weight').value) || null,
                profession: document.getElementById('reg_profession').value.trim() || null,
                address: document.getElementById('reg_address').value.trim() || null,
                phone: `${phoneCountry} ${document.getElementById('reg_phone').value.trim()}`,
                emergency_phone: `${emergencyCountry} ${document.getElementById('reg_emergency').value.trim()}`,
                has_insurance: document.getElementById('reg_insurance').checked,
                allergies: document.getElementById('reg_allergies').value.trim() || null,
                medical_conditions: document.getElementById('reg_conditions').value.trim() || null,
                has_biopolymers: document.querySelector('input[name="biopolymers"]:checked').value === 'true',
                selfie_url: selfieUrl,
                plan_id: selectedPlan.id,
                payment_method: document.querySelector('input[name="payment"]:checked').value,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
                qr_code: qrCode
            };

            const { error } = await supabase.from('members').insert([memberData]);

            if (error) throw error;

            // Generate QR code image
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
            document.getElementById('qrCodeImage').src = qrImageUrl;

            // Show success step
            updateFormStep('success');
            document.querySelector('.form-step[data-step="success"]').classList.add('active');

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message || 'Error al procesar la inscripción', 'error');
            submitBtn.textContent = 'CONFIRMAR INSCRIPCIÓN';
            submitBtn.disabled = false;
        }
    });

    // Load plans on page load
    loadPlans();

});
