const NAV_ITEMS = [
  { href: 'dashboard.html', label: 'Dashboard' },
  { href: 'students.html', label: 'Students' },
  { href: 'attendance.html', label: 'Attendance / QR Scan' },
  { href: 'timetable.html', label: 'Timetable' },
  { href: 'analytics.html', label: 'Analytics' },
  { href: 'notifications.html', label: 'Notifications' },
];

function guardAuth() {
  if (!Api.token()) {
    location.href = 'index.html';
    return false;
  }
  return true;
}

function renderShell(activeHref, pageTitle) {
  const admin = Api.admin();
  const current = location.pathname.split('/').pop();

  const navHtml = NAV_ITEMS.map(item => `
    <a class="nav-link ${item.href === (activeHref || current) ? 'active' : ''}" href="${item.href}">
      <span class="dot"></span>${item.label}
    </a>
  `).join('');

  const initials = admin && admin.name ? admin.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'AD';

  document.getElementById('app-shell').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand"><span class="mark">CA</span> College Attendance</div>
      ${navHtml}
      <a class="nav-link" href="#" id="logout-link" style="margin-top:16px;border-top:1px solid var(--color-border);padding-top:14px;">
        <span class="dot"></span>Log out
      </a>
    </aside>
    <div class="main">
      <div class="topbar">
        <h2>${pageTitle || ''}</h2>
        <div class="admin-chip">
          <div class="admin-avatar">${initials}</div>
          <span>${admin ? admin.name : ''}</span>
        </div>
      </div>
      <div class="page" id="page-content"></div>
    </div>
  `;

  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    Api.clearToken();
    location.href = 'index.html';
  });
}

function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `scan-toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
