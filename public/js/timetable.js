const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

(async function init() {
  if (!guardAuth()) return;
  renderShell('timetable.html', 'Timetable');

  document.getElementById('page-content').innerHTML = `
    <div class="section-head">
      <div class="toolbar" style="margin-bottom:0;">
        <input id="filter-dept" placeholder="Department">
        <input id="filter-year" type="number" placeholder="Year" style="width:90px;">
        <button class="btn btn-outline btn-sm" id="apply-filters">Filter</button>
      </div>
      <button class="btn btn-primary" id="add-slot-btn">+ Add Slot</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Dept / Year</th><th>Room</th><th></th></tr></thead>
      <tbody id="tt-body"><tr><td colspan="7" class="empty">Loading…</td></tr></tbody>
    </table></div>

    <div class="modal-backdrop hidden" id="slot-modal">
      <div class="modal">
        <h3>Add Timetable Slot</h3>
        <form id="slot-form">
          <div class="field"><label>Department</label><input required id="f-dept"></div>
          <div class="field"><label>Year</label><input required type="number" min="1" max="6" id="f-year"></div>
          <div class="field"><label>Day of Week</label>
            <select id="f-day">${DAYS.map((d, i) => `<option value="${i}">${d}</option>`).join('')}</select>
          </div>
          <div class="grid grid-2">
            <div class="field"><label>Start Time</label><input required type="time" id="f-start"></div>
            <div class="field"><label>End Time</label><input required type="time" id="f-end"></div>
          </div>
          <div class="field"><label>Subject</label><input required id="f-subject"></div>
          <div class="field"><label>Teacher</label><input required id="f-teacher"></div>
          <div class="field"><label>Room (optional)</label><input id="f-room"></div>
          <div class="error-text" id="form-error"></div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="btn btn-primary btn-block">Save</button>
            <button type="button" class="btn btn-outline btn-block" id="cancel-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('add-slot-btn').addEventListener('click', () => document.getElementById('slot-modal').classList.remove('hidden'));
  document.getElementById('cancel-modal').addEventListener('click', () => document.getElementById('slot-modal').classList.add('hidden'));
  document.getElementById('slot-form').addEventListener('submit', saveSlot);
  document.getElementById('apply-filters').addEventListener('click', loadTimetable);

  await loadTimetable();
})();

async function loadTimetable() {
  const body = document.getElementById('tt-body');
  body.innerHTML = `<tr><td colspan="7" class="empty">Loading…</td></tr>`;
  const dept = document.getElementById('filter-dept').value.trim();
  const year = document.getElementById('filter-year').value.trim();
  const params = new URLSearchParams();
  if (dept) params.set('department', dept);
  if (year) params.set('year', year);

  try {
    const rows = await Api.get(`/api/timetable?${params.toString()}`);
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7" class="empty">No timetable slots yet</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(r => `
      <tr>
        <td>${DAYS[r.day_of_week]}</td>
        <td>${r.start_time.slice(0,5)} – ${r.end_time.slice(0,5)}</td>
        <td>${escapeHtml(r.subject)}</td>
        <td>${escapeHtml(r.teacher)}</td>
        <td>${escapeHtml(r.department)} / Y${r.year}</td>
        <td>${escapeHtml(r.room || '—')}</td>
        <td class="actions"><button class="btn btn-danger btn-sm" onclick="deleteSlot('${r.id}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7" class="empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function saveSlot(e) {
  e.preventDefault();
  const payload = {
    department: document.getElementById('f-dept').value.trim(),
    year: parseInt(document.getElementById('f-year').value, 10),
    day_of_week: parseInt(document.getElementById('f-day').value, 10),
    start_time: document.getElementById('f-start').value,
    end_time: document.getElementById('f-end').value,
    subject: document.getElementById('f-subject').value.trim(),
    teacher: document.getElementById('f-teacher').value.trim(),
    room: document.getElementById('f-room').value.trim() || null,
  };
  try {
    await Api.post('/api/timetable', payload);
    toast('Slot added');
    document.getElementById('slot-modal').classList.add('hidden');
    document.getElementById('slot-form').reset();
    await loadTimetable();
  } catch (err) {
    document.getElementById('form-error').textContent = err.message;
  }
}

async function deleteSlot(id) {
  if (!confirm('Delete this timetable slot?')) return;
  try {
    await Api.del(`/api/timetable/${id}`);
    toast('Slot deleted');
    await loadTimetable();
  } catch (err) {
    toast(err.message, 'error');
  }
}
