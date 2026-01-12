import { createClient } from '@supabase/supabase-js'

// --- Supabase Config ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// --- Toast Notifications ---
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:3000;display:flex;flex-direction:column;gap:0.5rem;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `padding:1rem 1.5rem;border-radius:8px;color:white;font-weight:500;opacity:0;transform:translateX(100%);transition:all 0.3s ease;background:${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Custom Confirm Modal ---
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        modal.classList.add('active');

        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');

        function cleanup() {
            modal.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        }

        function handleOk() {
            cleanup();
            resolve(true);
        }

        function handleCancel() {
            cleanup();
            resolve(false);
        }

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL: Supabase keys missing in Admin.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Auth Check ---
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/admin/login.html';
    }
    return session;
}

// --- Logout ---
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login.html';
});

// --- State ---
let allMembers = [];
let allPlans = [];

// --- Load Data ---
async function loadMembers() {
    const tableBody = document.getElementById('membersTableBody');
    tableBody.innerHTML = '<tr><td colspan="8" class="loading-state">Cargando miembros...</td></tr>';

    try {
        // Fetch members with plan info
        const { data: members, error } = await supabase
            .from('members')
            .select('*, plans(name, duration_type)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allMembers = members;
        updateMetrics();
        renderMembers(allMembers);

    } catch (error) {
        console.error('Error loading members:', error);
        tableBody.innerHTML = `<tr><td colspan="8" class="loading-state" style="color:#ef4444;">Error: ${error.message}</td></tr>`;
    }
}

async function loadPlans() {
    const { data } = await supabase.from('plans').select('id, name, duration_type');
    allPlans = data || [];
}

async function loadSettings() {
    const { data } = await supabase.from('settings').select('value').eq('key', 'expiration_days').single();
    if (data) {
        document.getElementById('expirationDays').value = data.value;
    }
}

// --- Metrics ---
function updateMetrics() {
    const total = allMembers.length;
    const pending = allMembers.filter(m => m.status === 'pending').length;
    const active = allMembers.filter(m => m.status === 'active').length;
    const expired = allMembers.filter(m => m.status === 'expired').length;
    const inactive = allMembers.filter(m => m.status === 'inactive').length;

    document.getElementById('metricTotal').textContent = total;
    document.getElementById('metricPending').textContent = pending;
    document.getElementById('metricActive').textContent = active;
    document.getElementById('metricExpired').textContent = expired + inactive; // Expired + Inactive shown together
}

// --- Render Table ---
function renderMembers(members) {
    const tableBody = document.getElementById('membersTableBody');

    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="ph ph-users"></i>
                    <p>No se encontraron miembros</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = members.map(member => {
        const planName = member.plans ? `${member.plans.name} (${member.plans.duration_type})` : '-';
        const statusClass = `status-${member.status}`;
        const statusText = { pending: 'Pendiente', active: 'Activo', expired: 'Vencido', inactive: 'Desactivado' }[member.status] || member.status;

        const createdAt = new Date(member.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
        const dateInfo = member.status === 'active' && member.paid_at
            ? new Date(member.paid_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
            : member.expires_at
                ? new Date(member.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
                : '-';

        const avatar = member.selfie_url
            ? `<img src="${member.selfie_url}" class="member-avatar" alt="${member.full_name}">`
            : `<div class="member-avatar-placeholder"><i class="ph ph-user"></i></div>`;

        return `
            <tr data-id="${member.id}">
                <td>${avatar}</td>
                <td style="font-weight:600;">${member.full_name}</td>
                <td>${member.cedula}</td>
                <td>${planName}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${createdAt}</td>
                <td>${dateInfo}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" title="Ver detalle" onclick="viewMember('${member.id}')">
                            <i class="ph ph-eye"></i>
                        </button>
                        ${member.status === 'pending' ? `
                            <button class="action-btn success" title="Marcar como pagado" onclick="markAsPaid('${member.id}')">
                                <i class="ph ph-check"></i>
                            </button>
                            <button class="action-btn danger" title="Eliminar" onclick="deleteMember('${member.id}')">
                                <i class="ph ph-trash"></i>
                            </button>
                        ` : member.status === 'active' ? `
                            <button class="action-btn danger" title="Desactivar" onclick="deactivateMember('${member.id}')">
                                <i class="ph ph-user-minus"></i>
                            </button>
                        ` : member.status === 'expired' ? `
                            <button class="action-btn success" title="Marcar como pagado" onclick="markAsPaid('${member.id}')">
                                <i class="ph ph-check"></i>
                            </button>
                            <button class="action-btn danger" title="Eliminar" onclick="deleteMember('${member.id}')">
                                <i class="ph ph-trash"></i>
                            </button>
                        ` : member.status === 'inactive' ? `
                            <button class="action-btn success" title="Reactivar" onclick="reactivateMember('${member.id}')">
                                <i class="ph ph-user-plus"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Filtering ---
function filterMembers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = allMembers.filter(member => {
        const matchesSearch =
            (member.full_name && member.full_name.toLowerCase().includes(searchTerm)) ||
            (member.cedula && member.cedula.toLowerCase().includes(searchTerm));

        const matchesStatus = statusFilter ? member.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    renderMembers(filtered);
}

document.getElementById('searchInput')?.addEventListener('input', filterMembers);
document.getElementById('statusFilter')?.addEventListener('change', filterMembers);
document.getElementById('refreshBtn')?.addEventListener('click', loadMembers);

// --- Actions ---
window.viewMember = function (id) {
    const member = allMembers.find(m => m.id === id);
    if (!member) return;

    document.getElementById('detailMemberName').textContent = member.full_name;

    const detailContent = document.getElementById('memberDetailContent');
    detailContent.innerHTML = `
        <div class="member-detail-item">
            <div class="member-detail-label">Cédula</div>
            <div class="member-detail-value">${member.cedula}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Teléfono</div>
            <div class="member-detail-value">${member.phone}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Emergencia</div>
            <div class="member-detail-value">${member.emergency_phone}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Edad</div>
            <div class="member-detail-value">${member.age || '-'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Estatura</div>
            <div class="member-detail-value">${member.height_cm ? member.height_cm + ' cm' : '-'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Peso</div>
            <div class="member-detail-value">${member.weight_kg ? member.weight_kg + ' kg' : '-'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Profesión</div>
            <div class="member-detail-value">${member.profession || '-'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Dirección</div>
            <div class="member-detail-value">${member.address || '-'}</div>
        </div>
        <div class="member-detail-item" style="grid-column: 1/-1;">
            <div class="member-detail-label">Seguro Médico</div>
            <div class="member-detail-value">${member.has_insurance ? 'Sí' : 'No'}</div>
        </div>
        <div class="member-detail-item" style="grid-column: 1/-1;">
            <div class="member-detail-label">Alergias</div>
            <div class="member-detail-value">${member.allergies || 'Ninguna'}</div>
        </div>
        <div class="member-detail-item" style="grid-column: 1/-1;">
            <div class="member-detail-label">Condiciones Médicas</div>
            <div class="member-detail-value">${member.medical_conditions || 'Ninguna'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Biopolímeros</div>
            <div class="member-detail-value">${member.has_biopolymers ? 'Sí' : 'No'}</div>
        </div>
        <div class="member-detail-item">
            <div class="member-detail-label">Método de Pago</div>
            <div class="member-detail-value">${member.payment_method === 'cash' ? 'Contado' : 'Cuotas'}</div>
        </div>
    `;

    // Member Photo
    const photoHtml = member.selfie_url
        ? `<div style="text-align:center; margin-bottom:1rem;"><img src="${member.selfie_url}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid var(--color-primary);" alt="Foto"></div>`
        : '';
    detailContent.insertAdjacentHTML('beforebegin', photoHtml);

    // QR Code
    const qrSection = document.getElementById('memberQrSection');
    if (member.qr_code) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(member.qr_code)}`;
        document.getElementById('memberQrImage').src = qrUrl;
        document.getElementById('memberQrCode').textContent = member.qr_code;
        qrSection.style.display = 'block';
    } else {
        qrSection.style.display = 'none';
    }

    document.getElementById('memberDetailModal').classList.add('active');
};

window.markAsPaid = async function (id) {
    const confirmed = await showConfirm('Marcar como Pagado', '¿Marcar este miembro como PAGADO?');
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('members')
            .update({ status: 'active', paid_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        // Update local state
        const member = allMembers.find(m => m.id === id);
        if (member) {
            member.status = 'active';
            member.paid_at = new Date().toISOString();
        }

        updateMetrics();
        filterMembers();

    } catch (error) {
        showToast('Error al actualizar: ' + error.message, 'error');
    }
};

window.deleteMember = async function (id) {
    const member = allMembers.find(m => m.id === id);
    if (!member) return;

    // Solo se pueden eliminar miembros pendientes o vencidos
    if (member.status !== 'pending' && member.status !== 'expired') {
        showToast('Solo se pueden eliminar miembros pendientes o vencidos', 'error');
        return;
    }

    const confirmed = await showConfirm('Eliminar Miembro', '¿Eliminar este miembro pendiente? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) throw error;

        allMembers = allMembers.filter(m => m.id !== id);
        updateMetrics();
        filterMembers();
        showToast('Miembro eliminado');

    } catch (error) {
        showToast('Error al eliminar: ' + error.message, 'error');
    }
};

// Deactivate active member -> changes to 'inactive'
window.deactivateMember = async function (id) {
    const confirmed = await showConfirm('Desactivar Miembro', '¿Desactivar este miembro? Podrá reactivarse más adelante.');
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('members')
            .update({ status: 'inactive' })
            .eq('id', id);

        if (error) throw error;

        const member = allMembers.find(m => m.id === id);
        if (member) {
            member.status = 'inactive';
        }

        updateMetrics();
        filterMembers();
        showToast('Miembro desactivado');

    } catch (error) {
        showToast('Error al desactivar: ' + error.message, 'error');
    }
};

// Reactivate inactive member -> changes to 'active'
window.reactivateMember = async function (id) {
    const confirmed = await showConfirm('Reactivar Miembro', '¿Reactivar este miembro? Volverá al estado activo.');
    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('members')
            .update({ status: 'active', paid_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        const member = allMembers.find(m => m.id === id);
        if (member) {
            member.status = 'active';
            member.paid_at = new Date().toISOString();
        }

        updateMetrics();
        filterMembers();
        showToast('Miembro reactivado');

    } catch (error) {
        showToast('Error al reactivar: ' + error.message, 'error');
    }
};

// --- Close Modal ---
document.getElementById('closeDetailModal')?.addEventListener('click', () => {
    document.getElementById('memberDetailModal').classList.remove('active');
});

document.getElementById('memberDetailModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'memberDetailModal') {
        document.getElementById('memberDetailModal').classList.remove('active');
    }
});

// --- Settings ---
document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
    const days = document.getElementById('expirationDays').value;

    try {
        const { error } = await supabase
            .from('settings')
            .update({ value: days })
            .eq('key', 'expiration_days');

        if (error) throw error;
        showToast('Configuración guardada');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
});

// --- Excel Export ---
document.getElementById('exportBtn')?.addEventListener('click', () => {
    if (allMembers.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }

    // Prepare data for Excel
    const exportData = allMembers.map(m => ({
        'Nombre': m.full_name,
        'Cédula': m.cedula,
        'Teléfono': m.phone,
        'Tel. Emergencia': m.emergency_phone,
        'Edad': m.age || '',
        'Profesión': m.profession || '',
        'Dirección': m.address || '',
        'Plan': m.plans ? `${m.plans.name} (${m.plans.duration_type})` : '',
        'Estado': { pending: 'Pendiente', active: 'Activo', expired: 'Vencido' }[m.status] || m.status,
        'Fecha Inscripción': new Date(m.created_at).toLocaleDateString('es-CO'),
        'Seguro Médico': m.has_insurance ? 'Sí' : 'No',
        'Alergias': m.allergies || '',
        'Condiciones': m.medical_conditions || '',
        'Biopolímeros': m.has_biopolymers ? 'Sí' : 'No',
        'Método Pago': m.payment_method === 'cash' ? 'Contado' : 'Cuotas',
        'Código QR': m.qr_code || ''
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Miembros');

    // Download
    const fileName = `678FIT_Miembros_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
});

// --- Theme Toggle ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'light' ? 'ph ph-moon' : 'ph ph-sun';
    }
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

// --- Init ---
async function init() {
    initTheme();
    await checkSession();
    await loadPlans();
    await loadSettings();
    await loadMembers();
}

init();
