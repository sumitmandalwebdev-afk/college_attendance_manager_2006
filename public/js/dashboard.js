(async function init() {
  if (!guardAuth()) return;
  renderShell('dashboard.html', 'Dashboard');

  const content = document.getElementById('page-content');
  content.innerHTML = `<div class="empty">Loading overview…</div>`;

  try {
    const [summary, recent, notifications] = await Promise.all([
      Api.get('/api/analytics/summary'),
      Api.get('/api/attendance'),
      Api.get('/api/notifications'),
    ]);

    const recentRows = recent.slice(0, 8).map(r => `
      <tr>
        <td>${escapeHtml(r.student_name)}</td>
        <td>${escapeHtml(r.roll_number)}</td>
        <td><span class="badge ${badgeClass(r.status)}">${r.status}</span></td>
        <td>${r.date}</td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="empty">No attendance marked yet</td></tr>`;

    const notifRows = notifications.slice(0, 5).map(n => `
      <div class="card" style="margin-bottom:8px;">
        <div class="flex justify-between items-center">
          <strong style="font-size:13px;">${escapeHtml(n.title)}</strong>
          <span class="badge badge-muted">${n.type}</span>
        </div>
        <p class="text-muted mt-2" style="font-size:12.5px;">${escapeHtml(n.message)}</p>
      </div>
    `).join('') || `<div class="empty">No notifications</div>`;

    content.innerHTML = `
      <div class="section grid grid-4">
        ${statCard('Total Students', summary.total_students)}
        ${statCard('Present Today', summary.today_present)}
        ${statCard('Timetable Slots', summary.total_classes)}
        ${statCard('Unread Alerts', summary.unread_notifications)}
      </div>

      <div class="section grid grid-2">
        <div>
          <div class="section-head"><h3>Recent Attendance</h3><a class="btn btn-outline btn-sm" href="attendance.html">Mark Attendance</a></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Roll No.</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>${recentRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="section-head"><h3>Notifications</h3><a class="btn btn-outline btn-sm" href="notifications.html">View all</a></div>
          ${notifRows}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="empty">Couldn't load dashboard: ${escapeHtml(err.message)}</div>`;
  }
})();

function statCard(title, value) {
  return `<div class="card"><div class="card-title">${title}</div><div class="card-value">${value}</div></div>`;
}

function badgeClass(status) {
  if (status === 'present') return 'badge-success';
  if (status === 'late') return 'badge-warning';
  return 'badge-error';
}
