/**
 * Electrorec Admin Dashboard Logic - Restricted Organizer Gateway
 */

const API_BASE = window.location.origin.includes('http') ? '' : 'http://localhost:5000';
let authToken = localStorage.getItem('electrorec_admin_token') || null;
let currentAdminProfile = null;
try {
  const storedProfile = localStorage.getItem('electrorec_admin_profile');
  if (storedProfile) currentAdminProfile = JSON.parse(storedProfile);
} catch (e) {}

let currentEventFilter = 'all';
let allLoadedRegistrations = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

async function initAdmin() {
  bindThemeToggle();
  bindRoleChips();
  bindLoginEvents();
  bindDashboardEvents();
  bindCreateEventModal();

  if (authToken) {
    await verifyAndOpenDashboard();
  } else {
    showLogin();
  }
}

/**
 * Verify active restricted token against backend
 */
async function verifyAndOpenDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/verify`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      currentAdminProfile = data.admin;
      localStorage.setItem('electrorec_admin_profile', JSON.stringify(data.admin));
      showDashboard();
    } else {
      handleUnauthorized('Session expired or access unauthorized. Please re-authenticate.');
    }
  } catch (err) {
    // If backend is unreachable or offline, show dashboard if token exists
    showDashboard();
  }
}

/**
 * Switch view to login
 */
function showLogin() {
  document.getElementById('admin-login-view').style.display = 'flex';
  document.getElementById('admin-dashboard-view').style.display = 'none';
}

/**
 * Switch view to dashboard and populate operator badge
 */
function showDashboard() {
  document.getElementById('admin-login-view').style.display = 'none';
  document.getElementById('admin-dashboard-view').style.display = 'block';

  // Populate operator profile in top navigation
  if (currentAdminProfile) {
    const nameEl = document.getElementById('display-admin-name');
    const roleEl = document.getElementById('display-admin-role');
    if (nameEl) nameEl.textContent = currentAdminProfile.name || currentAdminProfile.email || 'Administrator';
    if (roleEl) roleEl.textContent = currentAdminProfile.role || 'Restricted Operator';
  }

  loadDashboardData();
}

/**
 * Bind Role Switcher Chips on Login View
 */
function bindRoleChips() {
  const chips = document.querySelectorAll('.role-chip');
  const emailInput = document.getElementById('admin-email');
  const passInput = document.getElementById('admin-password');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const email = chip.getAttribute('data-email');
      const pass = chip.getAttribute('data-pass');

      if (emailInput && email) emailInput.value = email;
      if (passInput && pass) passInput.value = pass;

      const alertBox = document.getElementById('login-alert');
      if (alertBox) alertBox.style.display = 'none';
    });
  });
}

/**
 * Bind Login Form Actions with Restricted Account Verification
 */
function bindLoginEvents() {
  const form = document.getElementById('admin-login-form');
  const alertBox = document.getElementById('login-alert');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;

      alertBox.style.display = 'none';

      try {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          alertBox.textContent = data.message || 'Restricted Access Denied: Invalid Credentials';
          alertBox.className = 'alert-box error';
          alertBox.style.display = 'block';
          return;
        }

        authToken = data.token;
        currentAdminProfile = data.admin;
        localStorage.setItem('electrorec_admin_token', data.token);
        localStorage.setItem('electrorec_admin_profile', JSON.stringify(data.admin));

        showDashboard();
      } catch (err) {
        alertBox.textContent = 'Server connection failed. Ensure backend service is running.';
        alertBox.className = 'alert-box error';
        alertBox.style.display = 'block';
      }
    });
  }
}

/**
 * Bind Dashboard Top Bar Actions
 */
function bindDashboardEvents() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authToken = null;
      currentAdminProfile = null;
      localStorage.removeItem('electrorec_admin_token');
      localStorage.removeItem('electrorec_admin_profile');
      showLogin();
    });
  }

  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      triggerCsvExport(currentEventFilter);
    });
  }

  const searchInput = document.getElementById('table-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filterRegistrationRows(q);
    });
  }
}

/**
 * Load stats, events, and registrations
 */
async function loadDashboardData() {
  await Promise.all([
    fetchStats(),
    fetchAdminEvents(),
    fetchRegistrations('all')
  ]);
}

/**
 * Fetch Stats Counters
 */
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status === 401) return handleUnauthorized();

    const data = await res.json();
    if (data.success) {
      document.getElementById('stat-total-events').textContent = data.stats.totalEvents;
      document.getElementById('stat-total-regs').textContent = data.stats.totalRegistrations;
      document.getElementById('stat-active-events').textContent = data.stats.activeEvents;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

/**
 * Fetch and render admin events
 */
async function fetchAdminEvents() {
  const container = document.getElementById('admin-events-grid');
  try {
    const res = await fetch(`${API_BASE}/api/admin/events`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status === 401) return handleUnauthorized();

    const data = await res.json();
    const events = data.events || [];

    container.innerHTML = events.map(ev => `
      <div class="admin-event-card ${ev.registrationOpen ? 'active-event' : ''}">
        <div class="admin-event-header">
          <span class="category-badge">${ev.category}</span>
          <span style="font-size:0.75rem; color:${ev.registrationOpen ? 'var(--gold)' : '#777'};">
            ${ev.registrationOpen ? '● Registration Open' : '○ Closed'}
          </span>
        </div>
        <h4 class="admin-event-title">${ev.title}</h4>
        <div class="admin-event-meta">
          <div>📅 ${ev.date} • 🕐 ${ev.time}</div>
          <div>📍 ${ev.venue}</div>
        </div>

        <div class="admin-event-capacity">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Enrolled Students</span>
            <strong>${ev.registrationCount || 0} / ${ev.capacity}</strong>
          </div>
          <div style="width:100%; height:4px; background:#222; border-radius:2px; overflow:hidden;">
            <div style="width:${Math.min(100, Math.round(((ev.registrationCount || 0) / ev.capacity) * 100))}%; height:100%; background:var(--gold);"></div>
          </div>
        </div>

        <div class="admin-event-actions">
          <button class="btn-secondary" style="font-size:0.78rem; padding:6px 10px;" onclick="viewEventRegistrations('${ev._id}', '${ev.title.replace(/'/g, "\\'")}')">
            View Registrations
          </button>
          <button class="btn-secondary" style="font-size:0.78rem; padding:6px 10px;" onclick="toggleEventStatus('${ev._id}', ${!ev.registrationOpen})">
            ${ev.registrationOpen ? 'Close' : 'Open'}
          </button>
          <button class="btn-danger" style="margin-left:auto;" onclick="deleteEventPrompt('${ev._id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load admin events:', err);
  }
}

/**
 * Fetch registrations (all or specific event)
 */
async function fetchRegistrations(eventId = 'all', eventTitle = 'All Events') {
  currentEventFilter = eventId;
  const titleLabel = document.getElementById('table-selected-event-title');
  if (titleLabel) titleLabel.textContent = `Showing Attendees: ${eventTitle}`;

  const endpoint = eventId === 'all' 
    ? `${API_BASE}/api/admin/registrations`
    : `${API_BASE}/api/admin/events/${eventId}/registrations`;

  const tbody = document.getElementById('registrations-tbody');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Loading attendee records...</td></tr>`;

  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status === 401) return handleUnauthorized();

    const data = await res.json();
    allLoadedRegistrations = data.registrations || [];
    renderRegistrationTable(allLoadedRegistrations);
  } catch (err) {
    console.error('Failed to load registrations:', err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--danger);">Error loading attendee records.</td></tr>`;
  }
}

/**
 * Render registration table rows
 */
function renderRegistrationTable(list) {
  const tbody = document.getElementById('registrations-tbody');
  const countBadge = document.getElementById('table-records-count');
  if (countBadge) countBadge.textContent = `${list.length} Records`;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">No student registrations found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((reg, idx) => {
    const eventName = (typeof reg.eventId === 'object' && reg.eventId?.title) ? reg.eventId.title : (reg.eventTitle || 'Event');
    const dateStr = reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return `
      <tr>
        <td style="color:var(--text-muted); font-size:0.8rem;">${idx + 1}</td>
        <td><span class="reg-badge-id">${reg.registrationId}</span></td>
        <td><strong>${reg.name}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${reg.email}</span></td>
        <td>${reg.rollNumber}</td>
        <td>${reg.branch} <span style="color:var(--gold); font-size:0.75rem;">(${reg.year})</span></td>
        <td>${reg.phone}</td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${eventName}</td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter rows by search term
 */
function filterRegistrationRows(query) {
  if (!query) {
    renderRegistrationTable(allLoadedRegistrations);
    return;
  }
  const filtered = allLoadedRegistrations.filter(r => {
    const nameMatch = r.name?.toLowerCase().includes(query);
    const emailMatch = r.email?.toLowerCase().includes(query);
    const rollMatch = r.rollNumber?.toLowerCase().includes(query);
    const idMatch = r.registrationId?.toLowerCase().includes(query);
    return nameMatch || emailMatch || rollMatch || idMatch;
  });
  renderRegistrationTable(filtered);
}

/**
 * View specific event registrations
 */
window.viewEventRegistrations = (eventId, title) => {
  fetchRegistrations(eventId, title);
  document.getElementById('registrations-section').scrollIntoView({ behavior: 'smooth' });
};

/**
 * Toggle event registration status
 */
window.toggleEventStatus = async (eventId, newStatus) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ registrationOpen: newStatus })
    });
    if (res.ok) {
      loadDashboardData();
    }
  } catch (err) {
    alert('Failed to update event status');
  }
};

/**
 * Delete event prompt
 */
window.deleteEventPrompt = async (eventId) => {
  if (!confirm('Are you sure you want to delete this event and its registrations?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      loadDashboardData();
    }
  } catch (err) {
    alert('Failed to delete event');
  }
};

/**
 * Trigger CSV export download
 */
function triggerCsvExport(eventId) {
  const url = `${API_BASE}/api/admin/events/${eventId}/export-csv`;
  fetch(url, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
  .then(res => res.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `electrorec-registrations-${eventId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch(err => {
    alert('Failed to export CSV');
  });
}

/**
 * Bind Create Event Modal
 */
function bindCreateEventModal() {
  const modal = document.getElementById('create-event-modal');
  const openBtn = document.getElementById('btn-open-create-event');
  const closeBtn = document.getElementById('modal-create-close');
  const form = document.getElementById('create-event-form');

  if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('evt-title').value.trim(),
        category: document.getElementById('evt-category').value,
        tagline: document.getElementById('evt-tagline').value.trim(),
        date: document.getElementById('evt-date').value.trim(),
        time: document.getElementById('evt-time').value.trim(),
        venue: document.getElementById('evt-venue').value.trim(),
        capacity: Number(document.getElementById('evt-capacity').value) || 100,
        description: document.getElementById('evt-desc').value.trim(),
      };

      try {
        const res = await fetch(`${API_BASE}/api/admin/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          modal.classList.remove('active');
          form.reset();
          loadDashboardData();
        } else {
          alert(data.message || 'Error creating event');
        }
      } catch (err) {
        alert('Server communication error');
      }
    });
  }
}

function handleUnauthorized(message) {
  authToken = null;
  currentAdminProfile = null;
  localStorage.removeItem('electrorec_admin_token');
  localStorage.removeItem('electrorec_admin_profile');
  showLogin();

  const alertBox = document.getElementById('login-alert');
  if (alertBox && message) {
    alertBox.textContent = message;
    alertBox.className = 'alert-box error';
    alertBox.style.display = 'block';
  }
}

/**
 * Dark / Light Theme Toggle for Admin Portal
 */
function bindThemeToggle() {
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('electrorec_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Strict default: dark theme
  };

  const updateButtons = (theme) => {
    const isLight = theme === 'light';
    const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
  };

  const applyTheme = (theme, persist = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      localStorage.setItem('electrorec_theme', theme);
    }
    updateButtons(theme);
  };

  const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  applyTheme(currentTheme, false);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const nextTheme = active === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme, true);
    });
  });
}

