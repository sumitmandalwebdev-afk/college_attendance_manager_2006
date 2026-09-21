(async function init() {
  if (!guardAuth()) return;
  renderShell('notifications.html', 'Notifications');

  document.getElementById('page-content').innerHTML = `
    <div class="section-head">
      <h3>All Notifications</h3>
      <button class="btn btn-primary" id="new-notif-btn">+ New</button>
    </div>
    <div id="notif-list"><div class="empty">Loading…</div></div>

    <div class="modal-backdrop hidden" id="notif-modal">
      <div class="modal">
        <h3>New Notification</h3>
        <form id="notif-form">
          <div class="field"><label>Title</label><input required id="f-title"></div>
          <div class="field"><label>Message</label><textarea required id="f-message" rows="3"></textarea></div>
          <div class="field"><label>Type</label>
            <select id="f-type">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div class="error-text" id="form-error"></div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="btn btn-primary btn-block">Create</button>
            <button type="button" class="btn btn-outline btn-block" id="cancel-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('new-notif-btn').addEventListener('click', () => document.getElementById('notif-modal').classList.remove('hidden'));
  document.getElementById('cancel-modal').addEventListener('click', () => document.getElementById('notif-modal').classList.add('hidden'));
  document.getElementById('notif-form').addEventListener('submit', createNotif);

  await loadNotifications();
})();

function badgeFor(type) {
  return { info: 'badge-muted', success: 'badge-success', warning: 'badge-warning', error: 'badge-error' }[type] || 'badge-muted';
}

async function loadNotifications() {
  const list = document.getElementById('notif-list');
  try {
    const notifs = await Api.get('/api/notifications');
    if (!notifs.length) {
      list.innerHTML = `<div class="empty">No notifications yet</div>`;
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="card mt-3">
        <div class="flex justify-between items-center">
          <strong>${escapeHtml(n.title)}</strong>
          <span class="badge ${badgeFor(n.type)}">${n.type}</span>
        </div>
        <p class="text-muted mt-2" style="font-size:13px;">${escapeHtml(n.message)}</p>
        <div class="flex justify-between items-center mt-3">
          <span class="hint-text">${new Date(n.created_at).toLocaleString()}</span>
          <div class="flex gap-2">
            ${!n.is_read ? `<button class="btn btn-outline btn-sm" onclick="markRead('${n.id}')">Mark read</button>` : `<span class="badge badge-success">Read</span>`}
            <button class="btn btn-danger btn-sm" onclick="deleteNotif('${n.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty">${escapeHtml(err.message)}</div>`;
  }
}

async function createNotif(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('f-title').value.trim(),
    message: document.getElementById('f-message').value.trim(),
    type: document.getElementById('f-type').value,
  };
  try {
    await Api.post('/api/notifications', payload);
    document.getElementById('notif-modal').classList.add('hidden');
    document.getElementById('notif-form').reset();
    toast('Notification created');
    await loadNotifications();
  } catch (err) {
    document.getElementById('form-error').textContent = err.message;
  }
}

async function markRead(id) {
  try {
    await Api.patch(`/api/notifications/${id}/read`);
    await loadNotifications();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function deleteNotif(id) {
  if (!confirm('Delete this notification?')) return;
  try {
    await Api.del(`/api/notifications/${id}`);
    toast('Notification deleted');
    await loadNotifications();
  } catch (err) {
    toast(err.message, 'error');
  }
}
