let scanning = false;
let videoStream = null;

(async function init() {
  if (!guardAuth()) return;
  renderShell('attendance.html', 'Attendance / QR Scan');

  document.getElementById('page-content').innerHTML = `
    <div class="grid grid-2">
      <div class="card">
        <h3 class="mt-2">Scan Student QR</h3>
        <p class="text-muted" style="font-size:12.5px;margin-bottom:14px;">Point a student's QR code at the camera to mark them present.</p>
        <div class="scanner-frame">
          <video id="scan-video" playsinline muted></video>
          <canvas id="scan-canvas" class="hidden"></canvas>
        </div>
        <div class="flex gap-2 mt-3" style="justify-content:center;">
          <button class="btn btn-accent" id="start-scan">Start Camera</button>
          <button class="btn btn-outline hidden" id="stop-scan">Stop</button>
        </div>
        <p class="hint-text" style="text-align:center;">Requires camera permission. Works over HTTPS.</p>
      </div>

      <div class="card">
        <h3 class="mt-2">Manual Override</h3>
        <p class="text-muted" style="font-size:12.5px;margin-bottom:14px;">No camera? Mark attendance manually by student.</p>
        <div class="field"><label>Student</label><select id="manual-student"><option value="">Loading students…</option></select></div>
        <div class="field"><label>Status</label>
          <select id="manual-status">
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <button class="btn btn-primary btn-block" id="manual-submit">Mark Attendance</button>
        <div class="error-text" id="manual-error"></div>
      </div>
    </div>

    <div class="section mt-4">
      <div class="section-head"><h3>Today's Attendance</h3></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Roll No.</th><th>Status</th><th>Marked Via</th><th>Time</th></tr></thead>
        <tbody id="today-body"><tr><td colspan="5" class="empty">Loading…</td></tr></tbody>
      </table></div>
    </div>
  `;

  document.getElementById('start-scan').addEventListener('click', startScan);
  document.getElementById('stop-scan').addEventListener('click', stopScan);
  document.getElementById('manual-submit').addEventListener('click', submitManual);

  await Promise.all([loadStudentOptions(), loadToday()]);
})();

async function loadStudentOptions() {
  const sel = document.getElementById('manual-student');
  try {
    const students = await Api.get('/api/students');
    if (!students.length) {
      sel.innerHTML = `<option value="">No students yet</option>`;
      return;
    }
    sel.innerHTML = students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.roll_number)})</option>`).join('');
  } catch (err) {
    sel.innerHTML = `<option value="">Failed to load</option>`;
  }
}

async function loadToday() {
  const body = document.getElementById('today-body');
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await Api.get(`/api/attendance?date=${today}`);
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty">Nobody marked yet today</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.student_name)}</td>
        <td>${escapeHtml(r.roll_number)}</td>
        <td><span class="badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : 'badge-error'}">${r.status}</span></td>
        <td>${r.marked_via}</td>
        <td>${new Date(r.created_at).toLocaleTimeString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function startScan() {
  const video = document.getElementById('scan-video');
  const canvas = document.getElementById('scan-canvas');
  const ctx = canvas.getContext('2d');

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (err) {
    toast('Camera access denied or unavailable', 'error');
    return;
  }
  video.srcObject = videoStream;
  await video.play();
  scanning = true;
  document.getElementById('start-scan').classList.add('hidden');
  document.getElementById('stop-scan').classList.remove('hidden');

  requestAnimationFrame(function tick() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        handleScanResult(code.data);
        return; // pause loop briefly via handleScanResult's cooldown
      }
    }
    requestAnimationFrame(tick);
  });
}

function stopScan() {
  scanning = false;
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
  document.getElementById('start-scan').classList.remove('hidden');
  document.getElementById('stop-scan').classList.add('hidden');
}

let lastScanTime = 0;
async function handleScanResult(qrCode) {
  const now = Date.now();
  if (now - lastScanTime < 2500) {
    requestAnimationFrame(function tick() { if (scanning) resumeTick(); });
    return;
  }
  lastScanTime = now;

  try {
    const res = await Api.post('/api/attendance/scan', { qr_code: qrCode });
    if (res.status === 'duplicate') {
      toast(res.message, 'error');
    } else {
      toast(`Marked present: ${res.student.name}`, 'success');
    }
    await loadToday();
  } catch (err) {
    toast(err.message, 'error');
  }

  resumeTick();
}

function resumeTick() {
  const video = document.getElementById('scan-video');
  const canvas = document.getElementById('scan-canvas');
  const ctx = canvas.getContext('2d');
  requestAnimationFrame(function tick() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        handleScanResult(code.data);
        return;
      }
    }
    requestAnimationFrame(tick);
  });
}

async function submitManual() {
  const errorEl = document.getElementById('manual-error');
  errorEl.textContent = '';
  const studentId = document.getElementById('manual-student').value;
  const status = document.getElementById('manual-status').value;
  if (!studentId) { errorEl.textContent = 'Select a student first'; return; }

  try {
    await Api.post('/api/attendance/manual', { student_id: studentId, status });
    toast('Attendance recorded');
    await loadToday();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}
