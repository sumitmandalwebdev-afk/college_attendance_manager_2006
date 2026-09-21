let editingId = null;

(async function init() {
  if (!guardAuth()) return;
  renderShell('students.html', 'Students');

  document.getElementById('page-content').innerHTML = `
    <div class="section-head">
      <div class="toolbar" style="margin-bottom:0;">
        <input type="text" id="search" placeholder="Search name or roll number…">
        <input type="text" id="filter-dept" placeholder="Department">
        <input type="number" id="filter-year" placeholder="Year" min="1" max="6" style="width:90px;">
        <button class="btn btn-outline btn-sm" id="apply-filters">Filter</button>
      </div>
      <button class="btn btn-primary" id="add-student-btn">+ Add Student</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Roll No.</th><th>Department</th><th>Year</th><th>QR Code</th><th></th></tr></thead>
      <tbody id="students-body"><tr><td colspan="6" class="empty">Loading…</td></tr></tbody>
    </table></div>

    <div class="modal-backdrop hidden" id="student-modal">
      <div class="modal">
        <h3 id="modal-title">Add Student</h3>
        <form id="student-form">
          <div class="field"><label>Full Name</label><input required id="f-name"></div>
          <div class="field"><label>Roll Number</label><input required id="f-roll"></div>
          <div class="field"><label>Department</label><input required id="f-dept"></div>
          <div class="field"><label>Year</label><input required type="number" min="1" max="6" id="f-year"></div>
          <div class="field"><label>Email (optional)</label><input type="email" id="f-email"></div>
          <div class="field"><label>Phone (optional)</label><input id="f-phone"></div>
          <div class="error-text" id="form-error"></div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="btn btn-primary btn-block">Save</button>
            <button type="button" class="btn btn-outline btn-block" id="cancel-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('add-student-btn').addEventListener('click', () => openModal());
  document.getElementById('cancel-modal').addEventListener('click', closeModal);
  document.getElementById('student-form').addEventListener('submit', saveStudent);
  document.getElementById('apply-filters').addEventListener('click', loadStudents);

  await loadStudents();
})();

async function loadStudents() {
  const body = document.getElementById('students-body');
  body.innerHTML = `<tr><td colspan="6" class="empty">Loading…</td></tr>`;
  const search = document.getElementById('search').value.trim();
  const dept = document.getElementById('filter-dept').value.trim();
  const year = document.getElementById('filter-year').value.trim();

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (dept) params.set('department', dept);
  if (year) params.set('year', year);

  try {
    const students = await Api.get(`/api/students?${params.toString()}`);
    if (!students.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty">No students yet — add your first one.</td></tr>`;
      return;
    }
    body.innerHTML = students.map(s => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.roll_number)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${s.year}</td>
        <td><code style="font-size:11.5px;">${escapeHtml(s.qr_code)}</code></td>
        <td class="actions">
          <button class="btn btn-outline btn-sm" onclick='editStudent(${JSON.stringify(s)})'>Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Student';
  document.getElementById('student-form').reset();
  document.getElementById('form-error').textContent = '';
  document.getElementById('student-modal').classList.remove('hidden');
}

function editStudent(s) {
  editingId = s.id;
  document.getElementById('modal-title').textContent = 'Edit Student';
  document.getElementById('f-name').value = s.name;
  document.getElementById('f-roll').value = s.roll_number;
  document.getElementById('f-dept').value = s.department;
  document.getElementById('f-year').value = s.year;
  document.getElementById('f-email').value = s.email || '';
  document.getElementById('f-phone').value = s.phone || '';
  document.getElementById('form-error').textContent = '';
  document.getElementById('student-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('student-modal').classList.add('hidden');
}

async function saveStudent(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('f-name').value.trim(),
    roll_number: document.getElementById('f-roll').value.trim(),
    department: document.getElementById('f-dept').value.trim(),
    year: parseInt(document.getElementById('f-year').value, 10),
    email: document.getElementById('f-email').value.trim() || null,
    phone: document.getElementById('f-phone').value.trim() || null,
  };
  try {
    if (editingId) {
      await Api.put(`/api/students/${editingId}`, payload);
      toast('Student updated');
    } else {
      await Api.post('/api/students', payload);
      toast('Student added');
    }
    closeModal();
    await loadStudents();
  } catch (err) {
    document.getElementById('form-error').textContent = err.message;
  }
}

async function deleteStudent(id) {
  if (!confirm('Remove this student? This also deletes their attendance history.')) return;
  try {
    await Api.del(`/api/students/${id}`);
    toast('Student removed');
    await loadStudents();
  } catch (err) {
    toast(err.message, 'error');
  }
}
