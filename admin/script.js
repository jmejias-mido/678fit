import { createClient } from '@supabase/supabase-js'

// --- Supabase Config ---
// Note: We use the same environment variables as the main app
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL: Supabase keys missing in Admin.');
    alert('Error de configuración: Faltan llaves de API.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- State Management ---
const isLoginPage = window.location.pathname.includes('login.html');
const isDashboard = !isLoginPage; // Assumes index.html or /admin/

// --- Auth Section ---

// 1. Check Session on Load
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (isDashboard && !session) {
        // Not logged in, trying to access dashboard -> Redirect to Login
        window.location.href = '/admin/login.html';
    }

    if (isLoginPage && session) {
        // Logged in, trying to access login -> Go to Dashboard
        window.location.href = '/admin/index.html';
    }

    if (isDashboard && session) {
        loadLeads();
    }
}

// 2. Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');
        const btn = loginForm.querySelector('button');

        // Reset UI
        errorMsg.style.display = 'none';
        btn.textContent = 'Verificando...';
        btn.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorMsg.textContent = 'Credenciales incorrectas. Intenta de nuevo.';
            errorMsg.style.display = 'block';
            btn.textContent = 'Iniciar Sesión';
            btn.disabled = false;
        } else {
            // Success - Redirect handled by onAuthStateChange or manual
            window.location.href = '/admin/index.html';
        }
    });
}

// 3. Logout Logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/admin/login.html';
    });
}

// --- Data Section (Dashboard) ---

// --- Data Section (Dashboard) ---

let allLeads = []; // Store leads for client-side filtering

async function loadLeads() {
    const tableBody = document.getElementById('leadsTableBody');
    if (!tableBody) return;

    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allLeads = data; // Save to state
        renderTable(allLeads);

    } catch (error) {
        console.error('Error loading leads:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error cargando datos: ${error.message}</td></tr>`;
    }
}

function filterLeads() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const goalFilter = document.getElementById('goalFilter').value;

    const filtered = allLeads.filter(lead => {
        const matchesSearch =
            (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
            (lead.phone && lead.phone.includes(searchTerm));

        const matchesGoal = goalFilter ? lead.goal === goalFilter : true;

        return matchesSearch && matchesGoal;
    });

    renderTable(filtered);
}

function renderTable(leads) {
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = '';

    if (leads.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No se encontraron registros.</td></tr>`;
        return;
    }

    leads.forEach(lead => {
        const date = new Date(lead.created_at).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td style="font-weight:600; color:white;">${lead.name}</td>
            <td>${lead.phone}</td>
            <td>${formatGoal(lead.goal)}</td>
            <td><span class="status-badge status-new">Nuevo</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function formatGoal(goalKey) {
    const map = {
        'lose_weight': 'Perder Grasa',
        'gain_muscle': 'Ganar Músculo',
        'health': 'Salud/Movilidad',
        'stress': 'Reducir Estrés'
    };
    return map[goalKey] || goalKey;
}

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', loadLeads);
}

// Filter Event Listeners
const searchInput = document.getElementById('searchInput');
const goalFilter = document.getElementById('goalFilter');

if (searchInput) searchInput.addEventListener('input', filterLeads);
if (goalFilter) goalFilter.addEventListener('change', filterLeads);

// Init
checkSession();
