(async function init() {
  if (!guardAuth()) return;
  renderShell('analytics.html', 'Analytics');

  const content = document.getElementById('page-content');
  content.innerHTML = `<div class="empty">Loading analytics…</div>`;

  try {
    const s = await Api.get('/api/analytics/summary');

    content.innerHTML = `
      <div class="section grid grid-4">
        ${statCard('Total Students', s.total_students)}
        ${statCard('Present Today', s.today_present)}
        ${statCard('Timetable Slots', s.total_classes)}
        ${statCard('Unread Alerts', s.unread_notifications)}
      </div>

      <div class="section grid grid-2">
        <div class="card">
          <h3 class="mt-2" style="margin-bottom:14px;">Attendance — Last 7 Days</h3>
          <canvas id="chart-week" width="480" height="240"></canvas>
        </div>
        <div class="card">
          <h3 class="mt-2" style="margin-bottom:14px;">Present Today by Department</h3>
          <canvas id="chart-dept" width="480" height="240"></canvas>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h3>Top Attendees</h3></div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Name</th><th>Roll No.</th><th>Department</th><th>Present Days</th></tr></thead>
          <tbody>
            ${s.top_students.length ? s.top_students.map((t, i) => `
              <tr><td>${i + 1}</td><td>${escapeHtml(t.name)}</td><td>${escapeHtml(t.roll_number)}</td><td>${escapeHtml(t.department)}</td><td>${t.present_count}</td></tr>
            `).join('') : `<tr><td colspan="5" class="empty">No attendance recorded yet</td></tr>`}
          </tbody>
        </table></div>
      </div>
    `;

    drawBarChart('chart-week', s.last_7_days.map(d => d.date.slice(5)), s.last_7_days.map(d => d.present), '#3B82F6');
    drawBarChart('chart-dept', s.by_department.map(d => d.department), s.by_department.map(d => d.present), '#10B981');
  } catch (err) {
    content.innerHTML = `<div class="empty">${err.message}</div>`;
  }
})();

function statCard(title, value) {
  return `<div class="card"><div class="card-title">${title}</div><div class="card-value">${value}</div></div>`;
}

function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (!labels.length) {
    ctx.fillStyle = '#6B7280';
    ctx.font = '13px Inter';
    ctx.fillText('No data yet', w / 2 - 30, h / 2);
    return;
  }

  const max = Math.max(...values, 1);
  const padding = 30;
  const chartH = h - padding - 20;
  const barW = (w - padding * 2) / labels.length * 0.6;
  const gap = (w - padding * 2) / labels.length;

  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.moveTo(padding, h - padding);
  ctx.lineTo(w - 10, h - padding);
  ctx.stroke();

  labels.forEach((label, i) => {
    const val = values[i];
    const barH = (val / max) * chartH;
    const x = padding + i * gap + (gap - barW) / 2;
    const y = h - padding - barH;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = '#111827';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(String(val), x + barW / 2, y - 6);

    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Inter';
    ctx.fillText(String(label).slice(0, 8), x + barW / 2, h - padding + 14);
  });
  ctx.textAlign = 'left';
}
