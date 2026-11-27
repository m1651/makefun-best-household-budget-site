// Charts for Hearth & Ledger, drawn with the canvas 2D API and plain SVG-free
// code — no chart library, so the first load stays small.

function setupCanvas(canvas, heightCss) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = heightCss;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function drawBarChart(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const pad = { top: 14, right: 10, bottom: 26, left: 46 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spending))) * 1.08;
  const n = months.length;
  const slot = plotW / n;
  const barW = Math.min(22, slot * 0.28);

  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b6259';
  ctx.strokeStyle = '#e3dccf';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = (max / 1.08 / 4) * i;
    const y = pad.top + plotH - (v / max) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText('$' + Math.round(v / 1000) + 'k', pad.left - 6, y + 4);
  }
  months.forEach((m, i) => {
    const cx = pad.left + slot * i + slot / 2;
    const spendH = (m.spending / max) * plotH;
    const incH = (m.income / max) * plotH;
    ctx.fillStyle = '#2e6b4f';
    ctx.fillRect(cx - barW - 3, pad.top + plotH - incH, barW, incH);
    ctx.fillStyle = '#c96f3f';
    ctx.fillRect(cx + 3, pad.top + plotH - spendH, barW, spendH);
    ctx.fillStyle = '#4a4238';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, cx, height - 8);
  });
}

function drawDonut(canvas, slices) {
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 12;
  const inner = outer * 0.62;
  const total = slices.reduce((s, x) => s + x.spent, 0);
  let angle = -Math.PI / 2;
  slices.forEach((s) => {
    const sweep = total > 0 ? (s.spent / total) * Math.PI * 2 : 0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf8';
  ctx.fill();
  ctx.fillStyle = '#2b2620';
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(money0(total), cx, cy - 2);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b6259';
  ctx.fillText('spent in November', cx, cy + 16);
}

function drawCompareBars(container, rows) {
  // Horizontal paired bars: this household vs the national average.
  container.innerHTML = '';
  const max = Math.max(...rows.map((r) => Math.max(r.ours, r.average)));
  rows.forEach((r) => {
    const wrap = document.createElement('div');
    wrap.className = 'compare-row';
    const oursPct = max > 0 ? (r.ours / max) * 100 : 0;
    const avgPct = max > 0 ? (r.average / max) * 100 : 0;
    const diff = r.ours - r.average;
    const diffText = diff <= 0
      ? money0(-diff) + ' less than average'
      : money0(diff) + ' more than average';
    wrap.innerHTML =
      '<div class="compare-name">' + r.name + '</div>' +
      '<div class="compare-bar"><span class="compare-fill ours" style="width:' + oursPct.toFixed(1) + '%"></span>' +
      '<span class="compare-value">' + money0(r.ours) + '</span></div>' +
      '<div class="compare-bar"><span class="compare-fill avg" style="width:' + avgPct.toFixed(1) + '%"></span>' +
      '<span class="compare-value">' + money0(r.average) + '</span></div>' +
      '<div class="compare-note">' + diffText + ' per month</div>';
    container.appendChild(wrap);
  });
}
