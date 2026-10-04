// ZIMOU Express — "Dark Kinetic Neon" restyle. Deterministic: render(t) draws frame at time t.
const W = 1080, H = 1920, DUR = 41.5667;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const C = {
  bg: '#07070A', bg2: '#101016', red: '#E3212D', red2: '#A50E19', red3: '#FF4B55',
  white: '#F6F6F8', gray: '#8C8C98', dim: '#3A3A44', glass: 'rgba(255,255,255,0.045)', pink: '#F06AA5'
};
const AR = 'Alexandria', LA = 'Montserrat';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const oC = t => 1 - Math.pow(1 - t, 3);
const oE = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const ioC = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const iC = t => t * t * t;
const oB = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- primitives ----------
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function glowStroke(drawPath, color, width, glow = 24) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha *= 0.35; ctx.lineWidth = width * 3.2; ctx.shadowColor = color; ctx.shadowBlur = glow;
  drawPath(); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = width;
  drawPath(); ctx.stroke();
  ctx.restore();
}
function glass(x, y, w, h, r, border = 'rgba(227,33,45,0.55)') {
  ctx.save();
  rrect(x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0.075)'); g.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = border; ctx.stroke();
  ctx.restore();
}
// ZIMOU mark: three slanted bars, light -> dark
function zIcon(x, y, s, a = 1) {
  const bw = s * 0.2, gap = s * 0.11, sk = s * 0.42;
  const cols = ['#F45D66', '#E3212D', '#B10F1B'];
  for (let i = 0; i < 3; i++) {
    const pp = clamp(a * 3 - i);
    if (pp <= 0) continue;
    const ox = x + (i - 1) * (bw + gap);
    ctx.save(); ctx.globalAlpha *= pp;
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.moveTo(ox - bw / 2 + sk / 2, y - s / 2); ctx.lineTo(ox + bw / 2 + sk / 2, y - s / 2);
    ctx.lineTo(ox + bw / 2 - sk / 2, y + s / 2); ctx.lineTo(ox - bw / 2 - sk / 2, y + s / 2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function pinPath(x, y, s) { // tip at (x,y)
  const r = s * 0.42;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - r * 0.35, y - s * 0.35, x - r, y - s * 0.55, x - r, y - s * 0.78);
  ctx.arc(x, y - s * 0.78, r, Math.PI, 0);
  ctx.bezierCurveTo(x + r, y - s * 0.55, x + r * 0.35, y - s * 0.35, x, y);
  ctx.closePath();
}
function pin(x, y, s, col = C.red, glow = true) {
  ctx.save();
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = s * 0.6; }
  ctx.fillStyle = col; pinPath(x, y, s); ctx.fill();
  ctx.shadowBlur = 0;
  // office glyph
  const cy = y - s * 0.78, r = s * 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(x - r * 1.1, cy - r * 0.15); ctx.lineTo(x, cy - r * 1.05); ctx.lineTo(x + r * 1.1, cy - r * 0.15); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - r * 0.8, cy, r * 1.6, r * 0.95);
  ctx.restore();
}
function person(x, y, s, col = C.white) {
  ctx.save(); ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - s * 0.18, s * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.32, s * 0.34, s * 0.24, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
}
function truck(x, y, s, col) {
  ctx.save(); ctx.fillStyle = col;
  rrect(x - s * 0.5, y - s * 0.32, s * 0.62, s * 0.46, s * 0.06); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + s * 0.16, y - s * 0.16); ctx.lineTo(x + s * 0.36, y - s * 0.16);
  ctx.lineTo(x + s * 0.5, y + 0.0); ctx.lineTo(x + s * 0.5, y + s * 0.14); ctx.lineTo(x + s * 0.16, y + s * 0.14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x - s * 0.3, y + s * 0.2, s * 0.1, 0, 7); ctx.arc(x + s * 0.3, y + s * 0.2, s * 0.1, 0, 7); ctx.fill();
  ctx.restore();
}
function checkMark(x, y, s, p, col = '#fff', w = 0.14) {
  if (p <= 0) return;
  const pts = [[-0.32, 0.02], [-0.08, 0.26], [0.36, -0.22]];
  const l1 = Math.hypot(0.24, 0.24), l2 = Math.hypot(0.44, 0.48), L = (l1 + l2) * p;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (L <= l1) { const k = L / l1; ctx.lineTo(x + lerp(pts[0][0], pts[1][0], k) * s, y + lerp(pts[0][1], pts[1][1], k) * s); }
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const k = (L - l1) / l2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], k) * s, y + lerp(pts[1][1], pts[2][1], k) * s); }
  ctx.stroke(); ctx.restore();
}
function badge(x, y, s, p) { // red circle w/ check
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(oB(clamp(p * 1.6)), oB(clamp(p * 1.6)));
  ctx.shadowColor = C.red; ctx.shadowBlur = s * 0.8;
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, 7); ctx.fill();
  ctx.restore();
  checkMark(x, y, s * 0.9, clamp(p * 2 - 0.5));
}
function quadPt(a, c, b, u) {
  return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
}
function quadPartial(a, c, b, u0, u1) {
  ctx.beginPath();
  const n = 40;
  for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); const p = quadPt(a, c, b, u); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
}

// ---------- typography ----------
const isLat = s => !/[؀-ۿ]/.test(s);
const fontFor = (s, size, wt) => (isLat(s) ? `${wt || 800} ${Math.round(size * 0.9)}px ${LA}` : `${wt || 800} ${size}px ${AR}`);
// words: [[text, at, color]] in logical (reading) order; laid out right->left, centred on cx
function words(T, list, cx, y, size, o = {}) {
  const sp = size * 0.26;
  const ws = list.map(([s]) => { ctx.font = fontFor(s, size, o.weight); return ctx.measureText(s).width; });
  const total = ws.reduce((a, b) => a + b, 0) + sp * (list.length - 1);
  let x = cx + total / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y - size * 1.25, W, size * 1.85); ctx.clip();
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right';
  list.forEach(([s, at, col], i) => {
    const a = P(T, at, at + 0.55);
    if (a > 0) {
      const e = oE(a);
      ctx.save();
      ctx.globalAlpha *= clamp(a * 2.5);
      ctx.font = fontFor(s, size, o.weight);
      ctx.direction = isLat(s) ? 'ltr' : 'rtl';
      ctx.fillStyle = col || o.color || C.white;
      if (col === C.red && o.glow !== false) { ctx.shadowColor = C.red; ctx.shadowBlur = size * 0.35; }
      ctx.fillText(s, x, y + (1 - e) * size * 1.0);
      ctx.restore();
    }
    x -= ws[i] + sp;
  });
  ctx.restore();
  return total;
}
function latinLetters(T, text, cx, y, size, t0, step, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 900} ${size}px ${LA}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ws = [...text].map(ch => ctx.measureText(ch).width);
  const total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  [...text].forEach((ch, i) => {
    const a = P(T, t0 + i * step, t0 + i * step + 0.5);
    if (a > 0) {
      const e = oE(a);
      ctx.save(); ctx.globalAlpha *= clamp(a * 2);
      const yy = y + (1 - e) * size * 0.7;
      if (o.echo) { ctx.fillStyle = 'rgba(227,33,45,0.55)'; ctx.fillText(ch, x + size * 0.05, yy + size * 0.05); }
      ctx.fillStyle = o.color || C.white; ctx.fillText(ch, x, yy);
      ctx.restore();
    }
    x += ws[i];
  });
  ctx.restore();
}
function pill(x, y, text, size, p, o = {}) { // centred pill
  if (p <= 0) return;
  ctx.save();
  ctx.font = fontFor(text, size, o.weight || 700);
  ctx.direction = isLat(text) ? 'ltr' : 'rtl';
  const tw = ctx.measureText(text).width, padX = size * 0.75, h = size * 1.75;
  const w = tw + padX * 2 + (o.check ? size * 1.3 : 0);
  const sc = oB(clamp(p * 1.4));
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(p * 3);
  rrect(-w / 2, -h / 2, w, h, h / 2);
  if (o.outline) { ctx.lineWidth = 3; ctx.strokeStyle = o.bg || C.red; ctx.fillStyle = 'rgba(10,10,14,0.85)'; ctx.fill(); ctx.stroke(); }
  else { ctx.shadowColor = o.bg || C.red; ctx.shadowBlur = size * 0.9; ctx.fillStyle = o.bg || C.red; ctx.fill(); ctx.shadowBlur = 0; }
  ctx.fillStyle = o.color || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tx = o.check ? -size * 0.65 : 0;
  ctx.fillText(text, tx, size * 0.06);
  if (o.check) checkMark(w / 2 - padX - size * 0.35, 0, size * 1.1, 1, '#fff', 0.16);
  ctx.restore();
}

// ---------- logo ----------
function logo(T, t0, cx, cy, sc) {
  const iconH = 150 * sc;
  ctx.save();
  ctx.font = `600 ${150 * sc}px ${LA}`; ctx.letterSpacing = `${6 * sc}px`;
  const zw = ctx.measureText('ZIMOU').width;
  const iconW = iconH * 1.05, gap = 26 * sc;
  const left = cx - (iconW + gap + zw) / 2;
  // halo
  const ph = P(T, t0, t0 + 1.2);
  const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 520 * sc);
  hg.addColorStop(0, `rgba(227,33,45,${0.28 * oC(ph)})`); hg.addColorStop(1, 'rgba(227,33,45,0)');
  ctx.fillStyle = hg; ctx.fillRect(cx - 600 * sc, cy - 600 * sc, 1200 * sc, 1200 * sc);
  // bars
  const pi = P(T, t0, t0 + 0.7);
  ctx.save(); ctx.translate(-(1 - oE(pi)) * 260 * sc, 0); zIcon(left + iconW / 2, cy, iconH, oC(pi)); ctx.restore();
  // ZIMOU
  const zx = left + iconW + gap, base = cy + 30 * sc;
  ctx.save();
  ctx.beginPath(); ctx.rect(zx - 20, cy - 120 * sc, zw + 80 * sc, 152 * sc); ctx.clip();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.white;
  let x = zx;
  [...'ZIMOU'].forEach((ch, i) => {
    const a = P(T, t0 + 0.3 + i * 0.07, t0 + 0.85 + i * 0.07);
    const w = ctx.measureText(ch).width;
    ctx.save(); ctx.globalAlpha *= clamp(a * 2); ctx.fillText(ch, x, base + (1 - oE(a)) * 150 * sc); ctx.restore();
    x += w;
  });
  ctx.restore();
  // Express
  const pe = P(T, t0 + 0.65, t0 + 1.3);
  ctx.font = `600 ${56 * sc}px ${LA}`; ctx.letterSpacing = '0px';
  const ew0 = ctx.measureText('Express').width;
  const lsT = (zw - 6 * sc - ew0) / 7;
  ctx.letterSpacing = `${lerp(lsT * 2.2, lsT, oE(pe))}px`;
  ctx.globalAlpha *= 1; ctx.save(); ctx.globalAlpha *= pe; ctx.fillStyle = '#FF3341'; ctx.shadowColor = C.red; ctx.shadowBlur = 18 * sc; ctx.textAlign = 'left';
  ctx.fillText('Express', zx + 4 * sc, cy + 76 * sc); ctx.restore();
  // pink ribbon on the U
  const pr = P(T, t0 + 1.0, t0 + 1.5);
  if (pr > 0) {
    const ux = zx + zw + 14 * sc, uy = cy - 78 * sc, s = 0.95 * sc;
    ctx.save(); ctx.translate(ux, uy); ctx.scale(oB(pr) * s, oB(pr) * s);
    ctx.strokeStyle = C.pink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, 46); ctx.bezierCurveTo(10, 10, 20, -32, 0, -32); ctx.bezierCurveTo(-20, -32, -10, 10, 18, 46); ctx.stroke();
    ctx.restore();
  }
  // light sweep
  const sw = P(T, t0 + 1.1, t0 + 1.9);
  if (sw > 0 && sw < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sx = lerp(left - 200 * sc, left + iconW + gap + zw + 200 * sc, ioC(sw));
    const g = ctx.createLinearGradient(sx - 90 * sc, 0, sx + 90 * sc, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.transform(1, 0, -0.35, 1, 0, 0);
    ctx.fillRect(sx - 120 * sc + (cy) * 0.35 - 60, cy - 120 * sc, 240 * sc, 240 * sc);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- background ----------
const R0 = rng(7);
const dust = Array.from({ length: 90 }, () => ({ x: R0() * W, y: R0() * H, s: 0.8 + R0() * 2.2, v: 10 + R0() * 40, a: 0.15 + R0() * 0.5 }));
const grains = [0, 1, 2].map(k => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640;
  const g = c.getContext('2d'); const id = g.createImageData(360, 640); const r = rng(100 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});
function background(T, o = {}) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // drifting red bloom
  const gx = 540 + Math.sin(T * 0.35) * 220, gy = (o.glowY || 1500) + Math.cos(T * 0.27) * 120;
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 1100);
  g.addColorStop(0, `rgba(190,20,32,${o.glow ?? 0.32})`); g.addColorStop(0.55, 'rgba(120,10,20,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // perspective floor grid
  ctx.save();
  const hy = 1180, vx = 540;
  ctx.beginPath(); ctx.rect(0, hy, W, H - hy); ctx.clip();
  const vg = ctx.createLinearGradient(0, hy, 0, H);
  vg.addColorStop(0, 'rgba(227,33,45,0)'); vg.addColorStop(0.35, 'rgba(227,33,45,0.08)'); vg.addColorStop(1, 'rgba(227,33,45,0.2)');
  ctx.strokeStyle = vg; ctx.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(vx, hy); ctx.lineTo(vx + i * 170, H); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(227,33,45,0.18)';
  const off = (T * 0.45) % 1;
  for (let k = 0; k < 14; k++) {
    const d = (k + off) / 14; const yy = hy + Math.pow(d, 2.2) * (H - hy);
    ctx.globalAlpha = Math.pow(d, 1.6) * 0.9;
    ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
  }
  ctx.restore();
  // dust
  ctx.save(); ctx.fillStyle = '#fff';
  dust.forEach(d => {
    const y = ((d.y - T * d.v) % H + H) % H;
    ctx.globalAlpha = d.a * (0.5 + 0.5 * Math.sin(T * 2 + d.x));
    ctx.beginPath(); ctx.arc(d.x, y, d.s, 0, 7); ctx.fill();
  });
  ctx.restore();
}
function finish(T, f) {
  // vignette
  const v = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // grain
  ctx.save(); ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grains[f % 3], 0, 0, W, H); ctx.restore();
}

// ---------- transitions: the logo's slanted bars sweep across ----------
function slantWipe(T, tc, d = 0.55) {
  const p = P(T, tc - d / 2, tc + d / 2);
  if (p <= 0 || p >= 1) return;
  const cols = ['#F45D66', C.red, '#B10F1B'];
  const hw = 1150, skew = 0.45;
  cols.forEach((col, i) => {
    const q = clamp((p - i * 0.07) / (1 - 0.14));
    const cx = lerp(-1900, 2980, ioC(q));
    const s0 = (0 - H / 2) * -skew, s1 = (H - H / 2) * -skew;
    ctx.save(); ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx - hw + s0, 0); ctx.lineTo(cx + hw + s0, 0); ctx.lineTo(cx + hw + s1, H); ctx.lineTo(cx - hw + s1, H); ctx.closePath();
    ctx.fill(); ctx.restore();
  });
}
function flash(T, tc, a = 0.5, d = 0.28) {
  const p = P(T, tc, tc + d);
  if (T < tc || p >= 1) return;
  ctx.save(); ctx.fillStyle = `rgba(255,235,236,${a * (1 - oC(p))})`; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function zoomAround(x, y, s) { ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); }

// ================= SCENES =================
// S1 0–5.5  "Imagine — 7 شركات توصيل، من مكان واحد."
const hub1 = [540, 1200];
const nodes1 = Array.from({ length: 7 }, (_, i) => {
  const a = -Math.PI / 2 + (i + 0.5) * (Math.PI * 2 / 7) + Math.PI / 7 * 0.5;
  return [hub1[0] + Math.cos(a) * 360, hub1[1] + Math.sin(a) * 330];
});
function s1(T) {
  background(T, { glowY: 1250 });
  const ex = P(T, 5.0, 5.5);
  ctx.save();
  if (ex > 0) { zoomAround(hub1[0], hub1[1], 1 + iC(ex) * 3); ctx.globalAlpha = 1 - ex; }
  latinLetters(T, 'Imagine', 540, 400, 170, 0.3, 0.05, { echo: true });
  words(T, [['7', 3.0], ['شركات', 3.15], ['توصيل،', 3.5]], 540, 560, 96);
  words(T, [['من', 4.0], ['مكان', 4.2], ['واحد.', 4.5, C.red]], 540, 690, 96);
  // trails
  nodes1.forEach((n, i) => {
    const t0 = 2.0 + i * 0.17, d = P(T, t0, t0 + 0.75);
    if (d <= 0) return;
    const mx = (n[0] + hub1[0]) / 2, my = (n[1] + hub1[1]) / 2;
    const dx = hub1[0] - n[0], dy = hub1[1] - n[1], L = Math.hypot(dx, dy);
    const c = [mx - dy / L * 90 * (i % 2 ? 1 : -1), my + dx / L * 90 * (i % 2 ? 1 : -1)];
    const e = ioC(d);
    glowStroke(() => quadPartial(n, c, hub1, 0, e), 'rgba(227,33,45,0.9)', 3, 18);
    if (d < 1) { const hp = quadPt(n, c, hub1, e); ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = C.red3; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(hp[0], hp[1], 8, 0, 7); ctx.fill(); ctx.restore(); }
    else {
      for (let j = 0; j < 2; j++) {
        const u = ((T - t0 - 0.75) * 0.9 + j / 2) % 1; const pp = quadPt(n, c, hub1, u);
        ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha *= 0.9; ctx.shadowColor = C.red3; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(pp[0], pp[1], 5, 0, 7); ctx.fill(); ctx.restore();
      }
    }
  });
  // nodes
  nodes1.forEach((n, i) => {
    const a = P(T, 0.9 + i * 0.13, 1.4 + i * 0.13);
    if (a <= 0) return;
    const s = oB(a);
    ctx.save(); ctx.translate(n[0], n[1]); ctx.scale(s, s);
    ctx.fillStyle = '#121218'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.red; ctx.shadowColor = C.red; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0;
    truck(0, -6, 52, C.white);
    ctx.font = `700 20px ${LA}`; ctx.fillStyle = C.gray; ctx.textAlign = 'center'; ctx.fillText('0' + (i + 1), 0, 38);
    ctx.restore();
  });
  // hub
  const hb = P(T, 1.9, 2.4), hf = P(T, 3.9, 4.4);
  if (hb > 0) {
    ctx.save(); ctx.translate(hub1[0], hub1[1]);
    const s = oB(hb) * (1 + 0.04 * Math.sin(T * 6) * hf);
    ctx.scale(s, s);
    rrect(-80, -80, 160, 160, 34);
    ctx.fillStyle = hf > 0 ? `rgba(227,33,45,${hf})` : '#0d0d12';
    ctx.shadowColor = C.red; ctx.shadowBlur = 30 + 40 * hf; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 4; ctx.strokeStyle = hf > 0 ? '#fff' : C.red; ctx.stroke();
    if (hf > 0) {
      ctx.save(); ctx.scale(oB(hf), oB(hf));
      ctx.fillStyle = '#fff'; zIconWhite(0, 0, 92, hf); ctx.restore();
      // ripple
      for (let k = 0; k < 2; k++) {
        const rp = ((T - 4.0) * 0.9 + k * 0.5) % 1;
        ctx.globalAlpha = (1 - rp) * 0.7; ctx.strokeStyle = C.red3; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 100 + rp * 160, 0, 7); ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}
function zIconWhite(x, y, s, a) {
  const bw = s * 0.2, gap = s * 0.11, sk = s * 0.42;
  for (let i = 0; i < 3; i++) {
    const ox = x + (i - 1) * (bw + gap);
    ctx.save(); ctx.globalAlpha *= clamp(a * 3 - i) * (1 - i * 0.18); ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(ox - bw / 2 + sk / 2, y - s / 2); ctx.lineTo(ox + bw / 2 + sk / 2, y - s / 2);
    ctx.lineTo(ox + bw / 2 - sk / 2, y + s / 2); ctx.lineTo(ox - bw / 2 - sk / 2, y + s / 2);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

// S2 5.5–13.6  map: "Accès لأكثر من +800 مكتب توصيل عبر كامل التراب الوطني." / "تجمعلك كل المكاتب."
const DZ = [[-2.2, 35.1], [-1.2, 35.7], [0.1, 35.9], [1.4, 36.55], [3.0, 36.8], [4.8, 36.9], [6.3, 37.08], [7.8, 36.95], [8.62, 36.9],
  [8.4, 36.4], [8.3, 35.5], [8.2, 34.6], [7.6, 34.1], [7.5, 33.2], [8.3, 32.5], [9.06, 32.1], [9.5, 30.2], [9.9, 29.0], [9.7, 27.3],
  [9.6, 26.6], [10.0, 25.3], [10.3, 24.4], [11.5, 24.3], [11.98, 23.5], [10.0, 22.4], [7.45, 20.85], [5.68, 19.6], [4.27, 19.15],
  [3.3, 19.0], [3.15, 19.7], [1.8, 20.6], [1.1, 20.9], [-1.5, 23.0], [-4.9, 25.0], [-8.67, 27.4], [-8.67, 28.7], [-7.0, 29.6],
  [-5.2, 30.0], [-3.6, 30.9], [-3.7, 31.6], [-1.2, 32.1], [-1.3, 32.8], [-1.7, 33.4], [-1.75, 34.7]];
function inPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
const R2 = rng(42);
const dots2 = [];
while (dots2.length < 520) {
  // bias toward the populated north
  const lat = 19 + Math.pow(R2(), 0.55) * 18.1, lon = -8.7 + R2() * 20.7;
  if (lat < 32 && R2() < 0.55) continue;
  if (inPoly(lon, lat, DZ)) dots2.push({ lon, lat, at: R2(), c: R2() });
}
const ALG = [3.06, 36.75];
const mapK = 44;
const toPlane = (lon, lat) => [(lon - 1.6) * 0.88 * mapK, -(lat - 28.0) * mapK];
function s2(T) {
  background(T, { glowY: 1300, glow: 0.38 });
  const en = P(T, 5.5, 6.9), ex = P(T, 13.15, 13.6);
  const tilt = lerp(0.25, 0.95, oC(en)) + 0.05 * Math.sin(T * 0.4);
  const rz = lerp(-0.35, -0.06, oC(en)) + (T - 7) * 0.012;
  const sc = lerp(0.55, 1, oE(en));
  const cx = 540, cy = 1300;
  const proj = (lon, lat, dz = 0) => {
    const [mx0, my0] = toPlane(lon, lat); const mx = mx0 * sc, my = my0 * sc;
    const x = mx * Math.cos(rz) - my * Math.sin(rz), y = mx * Math.sin(rz) + my * Math.cos(rz);
    const y3 = y * Math.cos(tilt), z = y * Math.sin(tilt), s = 1700 / (1700 + z);
    return [cx + x * s, cy + y3 * s + dz];
  };
  const hubP = proj(ALG[0], ALG[1]);
  ctx.save();
  if (ex > 0) { zoomAround(hubP[0], hubP[1], 1 + iC(ex) * 4); ctx.globalAlpha = Math.pow(1 - ex, 3); }
  // slab extrusion
  const poly = DZ.map(p => proj(p[0], p[1]));
  const depth = 30 * sc * Math.sin(tilt);
  ctx.save();
  ctx.beginPath(); DZ.forEach((p, i) => { const q = proj(p[0], p[1], depth); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
  ctx.fillStyle = `rgba(120,10,20,${0.9 * oC(en)})`; ctx.fill();
  ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
  const mg = ctx.createLinearGradient(0, cy - 400, 0, cy + 300);
  mg.addColorStop(0, '#1c1c24'); mg.addColorStop(1, '#0e0e13');
  ctx.globalAlpha *= oC(en); ctx.fillStyle = mg; ctx.fill();
  ctx.restore();
  // outline draw-on
  let per = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const dp = oC(P(T, 5.6, 7.0));
  ctx.save(); ctx.setLineDash([per * dp, per]);
  glowStroke(() => { ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); }, C.red, 3.5, 26);
  ctx.restore();
  // inner contour grid lines (latitude bands) for depth
  ctx.save(); ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = `rgba(255,255,255,${0.05 * oC(en)})`; ctx.lineWidth = 1;
  for (let la = 19; la <= 37; la += 1.5) { ctx.beginPath(); for (let lo = -9; lo <= 12.5; lo += 1) { const q = proj(lo, la); lo === -9 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke(); }
  for (let lo = -9; lo <= 12.5; lo += 1.5) { ctx.beginPath(); for (let la = 19; la <= 37.5; la += 1) { const q = proj(lo, la); la === 19 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke(); }
  ctx.restore();
  // links from hub (gather)
  const gather = P(T, 11.2, 12.6);
  if (gather > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    dots2.forEach((d, i) => {
      if (i % 6) return;
      const lp = P(T, 11.2 + d.c * 0.9, 11.75 + d.c * 0.9);
      if (lp <= 0) return;
      const q = proj(d.lon, d.lat);
      ctx.strokeStyle = `rgba(227,33,45,${0.55 * lp})`; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(hubP[0], hubP[1]); ctx.lineTo(lerp(hubP[0], q[0], oC(lp)), lerp(hubP[1], q[1], oC(lp))); ctx.stroke();
    });
    ctx.restore();
  }
  // dots
  dots2.forEach(d => {
    const a = P(T, 8.25 + d.at * 0.85, 8.45 + d.at * 0.85);
    if (a <= 0) return;
    const q = proj(d.lon, d.lat);
    const toRed = P(T, 11.3 + d.c * 1.1, 11.6 + d.c * 1.1);
    const r = (3.4 + 3 * (1 - a)) * sc;
    ctx.fillStyle = toRed > 0 ? `rgb(${Math.round(lerp(246, 255, toRed))},${Math.round(lerp(246, 60, toRed))},${Math.round(lerp(248, 70, toRed))})` : C.white;
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(q[0], q[1] - (1 - oB(a)) * 20, r, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = ex > 0 ? Math.pow(1 - ex, 3) : 1;
  // hub
  const hp = P(T, 11.0, 11.5);
  if (hp > 0) {
    ctx.save(); ctx.translate(hubP[0], hubP[1] - 10);
    for (let k = 0; k < 3; k++) { const rp = ((T - 11) * 0.8 + k / 3) % 1; ctx.save(); ctx.globalAlpha *= (1 - rp) * 0.8 * hp; ctx.strokeStyle = C.red3; ctx.lineWidth = 3; ctx.scale(1, Math.cos(tilt) * 0.9 + 0.1); ctx.beginPath(); ctx.arc(0, 0, 30 + rp * 170, 0, 7); ctx.stroke(); ctx.restore(); }
    ctx.scale(oB(hp), oB(hp));
    ctx.shadowColor = C.red; ctx.shadowBlur = 40; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
    zIconWhite(0, 0, 44, 1);
    ctx.restore();
  }
  // text A
  const ta = 1 - P(T, 10.85, 11.1);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha *= ta; ctx.translate(0, -(1 - ta) * 60);
    words(T, [['Accès', 7.45], ['لأكثر', 7.75], ['من', 8.0]], 540, 330, 80);
    const n = Math.round(800 * oC(P(T, 8.3, 9.05)));
    const cp = P(T, 8.25, 8.45);
    if (cp > 0) {
      ctx.save(); ctx.globalAlpha *= cp; ctx.font = `900 250px ${LA}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const s = String(n), tw = ctx.measureText('+' + s).width, pw = ctx.measureText('+').width;
      ctx.shadowColor = 'rgba(227,33,45,0.6)'; ctx.shadowBlur = 50;
      ctx.fillStyle = C.red; ctx.textAlign = 'left'; ctx.fillText('+', 540 - tw / 2, 590);
      ctx.fillStyle = C.white; ctx.fillText(s, 540 - tw / 2 + pw, 590);
      ctx.restore();
    }
    words(T, [['مكتب', 9.0, C.red], ['توصيل', 9.15, C.red]], 540, 720, 80);
    words(T, [['عبر', 10.0], ['كامل', 10.15], ['التراب', 10.35], ['الوطني.', 10.55]], 540, 830, 66, { weight: 600 });
    ctx.restore();
  }
  // text B
  words(T, [['تجمعلك', 11.0]], 540, 430, 130);
  words(T, [['كل', 11.45], ['المكاتب.', 11.75, C.red]], 540, 590, 130);
  ctx.restore();
}

// S3 13.6–16.0 "هذا واش تقدملك" + logo reveal
function s3(T) {
  background(T, { glowY: 1000, glow: 0.42 });
  const ex = P(T, 15.75, 16.0);
  ctx.save();
  // ring burst behind logo
  const rb = P(T, 14.55, 15.6);
  if (rb > 0 && rb < 1) {
    ctx.save(); ctx.strokeStyle = C.red3; ctx.globalAlpha *= (1 - rb) * 0.8; ctx.lineWidth = 6 * (1 - rb) + 1;
    ctx.beginPath(); ctx.arc(540, 1020, 120 + oC(rb) * 600, 0, 7); ctx.stroke(); ctx.restore();
  }
  words(T, [['هذا', 13.95], ['واش', 14.15], ['تقدملك', 14.45, C.red]], 540, 760, 92);
  logo(T, 14.55, 540, 1030, 1.05);
  ctx.restore();
}

// S4 16.0–20.0 platform: "منصة وحدة، أفضل 7 شركات توصيل في الجزائر."
const chips4 = [[175, 1000], [175, 1230], [175, 1460], [905, 920], [905, 1130], [905, 1340], [905, 1550]];
function s4(T) {
  background(T, { glowY: 1250, glow: 0.36 });
  const ex = P(T, 19.6, 20.0);
  ctx.save();
  if (ex > 0) { zoomAround(540, 1240, 1 - 0.15 * iC(ex)); ctx.globalAlpha = 1 - ex; }
  words(T, [['منصة', 16.0], ['وحدة،', 16.45, C.red]], 540, 330, 112);
  words(T, [['أفضل', 17.35], ['7', 17.75], ['شركات', 17.9], ['توصيل', 18.1]], 540, 470, 78);
  words(T, [['في', 18.45], ['الجزائر.', 18.65, C.red]], 540, 580, 78);
  // phone
  const pe = P(T, 16.05, 16.9);
  const px = 540, py = 1240 + (1 - oE(pe)) * 500 + Math.sin(T * 1.4) * 8, pw = 380, ph = 760;
  ctx.save(); ctx.globalAlpha *= clamp(pe * 2);
  ctx.translate(px, py); ctx.rotate((1 - oE(pe)) * 0.15 + Math.sin(T * 0.9) * 0.012);
  ctx.shadowColor = 'rgba(227,33,45,0.55)'; ctx.shadowBlur = 80;
  rrect(-pw / 2, -ph / 2, pw, ph, 56); ctx.fillStyle = '#0c0c11'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 5; ctx.strokeStyle = '#2b2b33'; ctx.stroke();
  rrect(-pw / 2 + 10, -ph / 2 + 10, pw - 20, ph - 20, 46); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(227,33,45,0.7)'; ctx.stroke();
  rrect(-50, -ph / 2 + 24, 100, 24, 12); ctx.fillStyle = '#000'; ctx.fill();
  // header
  zIcon(-pw / 2 + 62, -ph / 2 + 95, 40, 1);
  ctx.font = `600 34px ${LA}`; ctx.letterSpacing = '2px'; ctx.fillStyle = C.white; ctx.textAlign = 'left'; ctx.fillText('ZIMOU', -pw / 2 + 98, -ph / 2 + 107); ctx.letterSpacing = '0px';
  rrect(-pw / 2 + 30, -ph / 2 + 140, pw - 60, 56, 28); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
  ctx.fillStyle = C.gray; ctx.font = `500 22px ${LA}`; ctx.fillText('7 partenaires connectés', -pw / 2 + 56, -ph / 2 + 176);
  for (let i = 0; i < 7; i++) {
    const rp = P(T, 17.5 + i * 0.16, 17.9 + i * 0.16);
    const ry = -ph / 2 + 230 + i * 70;
    ctx.save(); ctx.globalAlpha *= rp; ctx.translate((1 - oE(rp)) * 60, 0);
    rrect(-pw / 2 + 30, ry, pw - 60, 56, 14); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    truck(-pw / 2 + 66, ry + 28, 34, C.red);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; rrect(-pw / 2 + 100, ry + 16, 120 + (i * 37 % 60), 10, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; rrect(-pw / 2 + 100, ry + 33, 70, 8, 4); ctx.fill();
    const ck = P(T, 18.55 + i * 0.15, 18.85 + i * 0.15);
    if (ck > 0) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(pw / 2 - 60, ry + 28, 15 * oB(ck), 0, 7); ctx.fill(); checkMark(pw / 2 - 60, ry + 28, 22, ck, '#fff', 0.18); }
    ctx.restore();
  }
  ctx.restore();
  // chips orbiting
  chips4.forEach((c, i) => {
    const a = P(T, 17.45 + i * 0.12, 18.0 + i * 0.12);
    if (a <= 0) return;
    const left = c[0] < 540;
    const x = c[0] + (1 - oE(a)) * (left ? -260 : 260), y = c[1] + Math.sin(T * 1.2 + i) * 6;
    ctx.save(); ctx.globalAlpha *= clamp(a * 2);
    // connector
    const ex2 = left ? x + 115 : x - 115, tx = left ? 352 : 728;
    ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(227,33,45,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex2, y); ctx.lineTo(lerp(ex2, tx, oC(a)), y); ctx.stroke(); ctx.setLineDash([]);
    glass(x - 115, y - 42, 230, 84, 22);
    truck(x - 62, y, 46, C.white);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; rrect(x - 22, y - 14, 90 - (i * 17 % 30), 10, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; rrect(x - 22, y + 6, 54, 8, 4); ctx.fill();
    ctx.restore();
    badge(left ? x + 105 : x - 105, y - 38, 40, P(T, 18.55 + i * 0.15, 19.0 + i * 0.15));
  });
  ctx.restore();
}

// S5 20.0–23.0 "Imagine بكل هاد المكاتب"
const hub5 = [540, 1560];
const R5 = rng(5);
const pins5 = Array.from({ length: 13 }, (_, i) => {
  const u = i / 12; const ang = lerp(-1.25, 1.25, u) + (R5() - 0.5) * 0.12;
  const rad = 560 + R5() * 260;
  return [hub5[0] + Math.sin(ang) * rad * 0.95, hub5[1] - Math.cos(ang) * rad, R5()];
});
function s5(T) {
  background(T, { glowY: 1650, glow: 0.5 });
  const ex = P(T, 22.75, 23.0);
  ctx.save();
  latinLetters(T, 'Imagine', 540, 380, 170, 20.95, 0.045, { echo: true });
  words(T, [['بكل', 21.95], ['هاد', 22.3, C.red], ['المكاتب', 22.5, C.red]], 540, 540, 110);
  pins5.forEach((p, i) => {
    const t0 = 21.15 + p[2] * 0.6 + i * 0.03, d = P(T, t0, t0 + 0.6);
    if (d <= 0) return;
    const c = [lerp(hub5[0], p[0], 0.15), lerp(hub5[1], p[1], 0.75)];
    const e = oC(d);
    glowStroke(() => quadPartial(hub5, c, [p[0], p[1]], 0, e), 'rgba(255,255,255,0.55)', 2, 12);
    const hpnt = quadPt(hub5, c, [p[0], p[1]], e);
    if (d < 1) { ctx.save(); ctx.fillStyle = C.red3; ctx.shadowColor = C.red3; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(hpnt[0], hpnt[1], 7, 0, 7); ctx.fill(); ctx.restore(); }
    const pp = P(T, t0 + 0.5, t0 + 0.85);
    if (pp > 0) { ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(oB(pp), oB(pp)); pin(0, 0, 70); ctx.restore(); }
    // sparks at arrival
    if (pp > 0 && pp < 1) {
      ctx.save(); ctx.strokeStyle = `rgba(255,120,128,${1 - pp})`; ctx.lineWidth = 3;
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const r1 = 20 + pp * 30, r2 = 30 + pp * 55; ctx.beginPath(); ctx.moveTo(p[0] + Math.cos(a) * r1, p[1] - 50 + Math.sin(a) * r1); ctx.lineTo(p[0] + Math.cos(a) * r2, p[1] - 50 + Math.sin(a) * r2); ctx.stroke(); }
      ctx.restore();
    }
  });
  // hub
  const hp = P(T, 20.15, 20.6);
  if (hp > 0) {
    ctx.save(); ctx.translate(hub5[0], hub5[1]);
    for (let k = 0; k < 3; k++) { const rp = ((T - 20.2) * 0.7 + k / 3) % 1; ctx.save(); ctx.globalAlpha *= (1 - rp) * 0.7; ctx.strokeStyle = C.red3; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 60 + rp * 220, 0, 7); ctx.stroke(); ctx.restore(); }
    ctx.scale(oB(hp), oB(hp));
    ctx.shadowColor = C.red; ctx.shadowBlur = 60; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    zIconWhite(0, 0, 60, 1);
    ctx.restore();
  }
  ctx.restore();
}

// S6 23.0–28.5 "كل زبون يطلب التوصيل للمكتب." / "bien sûr لازم يكون المكتب قريب."
function s6(T) {
  background(T, { glowY: 1400, glow: 0.3 });
  const ex = P(T, 28.25, 28.5);
  ctx.save();
  if (ex > 0) ctx.globalAlpha = 1 - ex;
  const t1 = 1 - P(T, 25.95, 26.2);
  if (t1 > 0) {
    ctx.save(); ctx.globalAlpha *= t1; ctx.translate(0, -(1 - t1) * 60);
    words(T, [['كل', 23.45], ['زبون', 23.75], ['يطلب', 24.4]], 540, 350, 104);
    words(T, [['التوصيل', 24.95, C.red], ['للمكتب.', 25.45, C.red]], 540, 490, 104);
    ctx.restore();
  }
  pill(540, 290, 'bien sûr', 40, P(T, 26.0, 26.45), { weight: 800 });
  words(T, [['لازم', 26.45], ['يكون', 26.85], ['المكتب', 27.15]], 540, 450, 94);
  // "قريب." punch
  const qp = P(T, 27.5, 28.0);
  if (qp > 0) {
    ctx.save(); ctx.translate(540, 640); const s = lerp(1.6, 1, oE(qp)); ctx.scale(s, s);
    ctx.globalAlpha *= clamp(qp * 3); ctx.font = `900 190px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.fillStyle = C.red; ctx.shadowColor = C.red; ctx.shadowBlur = 60; ctx.fillText('قريب.', 0, 0); ctx.restore();
  }
  // diagram card
  const cp = P(T, 23.15, 23.7);
  ctx.save(); ctx.globalAlpha *= cp; ctx.translate(0, (1 - oE(cp)) * 120);
  glass(70, 900, 940, 640, 44, 'rgba(255,255,255,0.12)');
  const cu = [230, 1380], far = [860, 1380], near = [500, 1380];
  // ground line
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.setLineDash([4, 10]);
  ctx.beginPath(); ctx.moveTo(130, 1400); ctx.lineTo(950, 1400); ctx.stroke(); ctx.setLineDash([]);
  const dim = 1 - 0.75 * P(T, 26.5, 27.0);
  // far arc (dashed)
  const fa = P(T, 24.55, 25.6);
  if (fa > 0) {
    ctx.save(); ctx.globalAlpha *= dim; ctx.setLineDash([16, 14]);
    glowStroke(() => quadPartial([cu[0], cu[1] - 30], [545, 860], [far[0], far[1] - 80], 0, oC(fa)), C.red, 5, 20);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= dim; pill(545, 1060, 'بعيد', 38, P(T, 25.5, 25.9), { outline: true }); ctx.restore();
  }
  // far pin
  const fp = P(T, 24.3, 24.7);
  if (fp > 0) { ctx.save(); ctx.globalAlpha *= dim; ctx.translate(far[0], far[1]); ctx.scale(oB(fp), oB(fp)); pin(0, 0, 110, dim < 0.6 ? '#55555f' : C.red, dim > 0.6); ctx.restore(); }
  // near pin + arc
  const np = P(T, 27.0, 27.4);
  if (np > 0) {
    const na = P(T, 27.1, 27.65);
    glowStroke(() => quadPartial([cu[0], cu[1] - 30], [365, 1150], [near[0], near[1] - 80], 0, oC(na)), '#fff', 5, 24);
    ctx.save(); ctx.translate(near[0], near[1]); ctx.scale(oB(np), oB(np)); pin(0, 0, 120); ctx.restore();
    pill(365, 1150, 'قريب', 38, P(T, 27.6, 28.0), { check: true });
  }
  // customer
  const cq = P(T, 23.4, 23.8);
  if (cq > 0) {
    ctx.save(); ctx.translate(cu[0], cu[1] - 30); ctx.scale(oB(cq), oB(cq));
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    person(0, 2, 62, C.red); ctx.restore();
    ctx.save(); ctx.globalAlpha *= cq; ctx.font = `600 34px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = C.gray; ctx.fillText('الزبون', cu[0], 1470); ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

// S7 28.5–33.0 "تلقى مكتب قريب، بسهولة."
function typed(T, s, t0, cps) { const n = Math.floor(clamp((T - t0) * cps, 0, s.length)); return s.slice(0, n); }
function s7(T) {
  background(T, { glowY: 1500, glow: 0.3 });
  const ex = P(T, 32.75, 33.0);
  ctx.save();
  if (ex > 0) { ctx.globalAlpha = 1 - ex; }
  words(T, [['تلقى', 29.95], ['مكتب', 30.2]], 540, 330, 112);
  words(T, [['قريب،', 30.5, C.red], ['بسهولة.', 31.45]], 540, 470, 112);
  const ul = P(T, 31.7, 32.2);
  if (ul > 0) { ctx.save(); ctx.fillStyle = C.red; ctx.shadowColor = C.red; ctx.shadowBlur = 20; const x1 = 540 - 30, w = 330 * oE(ul); ctx.fillRect(x1 - w + 165 * 0 - 0, 505, w, 10); ctx.restore(); }
  // card
  const cp = P(T, 28.55, 29.1);
  const X = 100, Y = 660, CW = 880;
  ctx.save(); ctx.globalAlpha *= cp; ctx.translate(0, (1 - oE(cp)) * 140);
  glass(X, Y, CW, 640, 40, 'rgba(255,255,255,0.14)');
  truck(X + 70, Y + 70, 50, C.red);
  ctx.font = `700 36px ${LA}`; ctx.fillStyle = C.white; ctx.textAlign = 'left'; ctx.fillText('Informations de Livraison', X + 115, Y + 83);
  const field = (fy, label, val, active, done) => {
    ctx.font = `500 26px ${LA}`; ctx.fillStyle = C.gray; ctx.textAlign = 'left'; ctx.fillText(label, X + 50, fy);
    rrect(X + 50, fy + 18, CW - 100, 84, 18); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    ctx.lineWidth = active ? 3 : 2; ctx.strokeStyle = active ? C.red : 'rgba(255,255,255,0.15)';
    if (active) { ctx.shadowColor = C.red; ctx.shadowBlur = 20; }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.font = `600 32px ${LA}`; ctx.fillStyle = C.white; ctx.fillText(val, X + 80, fy + 72);
    if (active && !done && Math.floor(T * 3) % 2 === 0) { const w = ctx.measureText(val).width; ctx.fillRect(X + 84 + w, fy + 44, 3, 36); }
    // chevron
    ctx.strokeStyle = C.gray; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X + CW - 100, fy + 54); ctx.lineTo(X + CW - 88, fy + 66); ctx.lineTo(X + CW - 76, fy + 54); ctx.stroke();
  };
  const v1 = typed(T, 'Alger', 28.9, 14), v2 = typed(T, 'Bab Ezzouar', 29.4, 16);
  field(Y + 160, 'Wilaya', v1, T > 28.9 && T < 29.4, T >= 29.4);
  field(Y + 300, 'Commune', v2, T >= 29.4 && T < 30.25, T >= 30.25);
  const picked = T >= 31.45;
  field(Y + 440, 'Point Relais', picked ? 'Zimou · Bab Ezzouar — 1.2 km' : (T >= 30.25 ? 'Sélectionner…' : ''), T >= 30.25, true);
  ctx.restore();
  // dropdown
  const dd = P(T, 30.3, 30.6) * (1 - P(T, 31.45, 31.65));
  const rows = [['Zimou · Bab Ezzouar', '1.2 km'], ['Point relais · Dar El Beida', '3.8 km'], ['Point relais · El Harrach', '6.1 km'], ['Point relais · Rouiba', '9.4 km']];
  if (dd > 0) {
    const dy = Y + 560;
    ctx.save(); ctx.globalAlpha *= clamp(dd * 2);
    ctx.beginPath(); ctx.rect(X + 50, dy, CW - 100, 360 * oC(dd)); ctx.clip();
    rrect(X + 50, dy, CW - 100, 350, 20); ctx.fillStyle = '#15151c'; ctx.fill(); ctx.strokeStyle = 'rgba(227,33,45,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    const hov = T >= 30.95;
    rows.forEach((r, i) => {
      const ry = dy + 14 + i * 82;
      if (i === 0 && hov) { rrect(X + 62, ry, CW - 124, 74, 14); ctx.fillStyle = 'rgba(227,33,45,0.22)'; ctx.fill(); }
      pin(X + 100, ry + 60, 40, i === 0 ? C.red : '#5a5a66', false);
      ctx.font = `600 30px ${LA}`; ctx.fillStyle = i === 0 ? C.white : 'rgba(255,255,255,0.6)'; ctx.textAlign = 'left'; ctx.fillText(r[0], X + 140, ry + 48);
      ctx.textAlign = 'right'; ctx.fillStyle = i === 0 ? C.red3 : C.gray; ctx.fillText(r[1], X + CW - 90, ry + 48);
    });
    ctx.restore();
  }
  // cursor
  const cpth = [[760, 1500, 29.0], [620, 1150, 30.15], [700, 1290, 30.9], [560, 1255, 31.2], [560, 1255, 31.6], [640, 1500, 32.4]];
  if (T > 29.0 && T < 32.6) {
    let cx = cpth[0][0], cy = cpth[0][1];
    for (let i = 0; i < cpth.length - 1; i++) { const a = cpth[i], b = cpth[i + 1]; if (T >= a[2] && T <= b[2]) { const u = ioC((T - a[2]) / (b[2] - a[2])); cx = lerp(a[0], b[0], u); cy = lerp(a[1], b[1], u); } else if (T > b[2]) { cx = b[0]; cy = b[1]; } }
    const click = (T > 30.2 && T < 30.35) || (T > 31.35 && T < 31.5);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(click ? 0.85 : 1, click ? 0.85 : 1);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.lineTo(12, 35); ctx.lineTo(21, 54); ctx.lineTo(29, 50); ctx.lineTo(20, 32); ctx.lineTo(36, 32); ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.restore();
    if (click) { ctx.save(); ctx.strokeStyle = C.red3; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  pill(540, 1440, 'مكتب قريب من زبونك', 42, P(T, 31.9, 32.35), { check: true });
  ctx.restore();
}

// S8 33.0–37.0 "واحد من أكبر المشاكل... لي تحلهم المنصة."
function problemCard() {
  glass(130, 1060, 820, 300, 40, 'rgba(255,255,255,0.15)');
  pin(270, 1200, 90);
  ctx.save(); ctx.setLineDash([12, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(330, 1160); ctx.lineTo(740, 1160); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(810, 1160, 44, 0, 7); ctx.fill(); person(810, 1162, 54, '#121218'); ctx.restore();
  ctx.save(); ctx.font = `700 42px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = C.white; ctx.fillText('المكتب بعيد على الزبون', 540, 1300); ctx.restore();
}
function s8(T) {
  background(T, { glowY: 1300, glow: 0.3 });
  ctx.save();
  words(T, [['واحد', 33.45], ['من', 33.7], ['أكبر', 33.95]], 540, 330, 104);
  words(T, [['المشاكل...', 34.45, C.red]], 540, 480, 120);
  words(T, [['لي', 35.45], ['تحلهم', 35.65], ['المنصة.', 35.95, C.red]], 540, 620, 92);
  const cp = P(T, 33.1, 33.6);
  const cut = P(T, 35.45, 35.7), fall = P(T, 35.7, 36.4);
  const shake = T > 34.9 && T < 35.45 ? Math.sin(T * 70) * 8 * P(T, 34.9, 35.2) : 0;
  if (cp > 0 && fall < 1) {
    if (fall <= 0) {
      ctx.save(); ctx.globalAlpha *= cp; ctx.translate(shake, (1 - oE(cp)) * 120); problemCard(); ctx.restore();
    } else {
      // split along the slash, halves drift apart
      [[-1], [1]].forEach(([sd]) => {
        ctx.save(); ctx.globalAlpha *= 1 - fall;
        ctx.beginPath();
        if (sd < 0) { ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(440, H); ctx.lineTo(0, H); }
        else { ctx.moveTo(640, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(440, H); }
        ctx.closePath(); ctx.clip();
        ctx.translate(540, 1210); ctx.rotate(sd * 0.25 * oC(fall)); ctx.translate(-540 + sd * 220 * oC(fall), -1210 + 260 * iC(fall));
        problemCard(); ctx.restore();
      });
    }
  }
  // slash bar
  if (cut > 0 && fall < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - fall;
    const L = oE(cut);
    ctx.translate(540, 1210); ctx.rotate(-1.37 + Math.PI / 2 - Math.PI / 2 + 0.2);
    ctx.fillStyle = C.red; ctx.shadowColor = C.red; ctx.shadowBlur = 50;
    ctx.fillRect(-12, -260, 24, 520 * L);
    ctx.restore();
  }
  // check burst
  const ck = P(T, 35.95, 36.5);
  if (ck > 0) {
    const rb = P(T, 36.0, 36.8);
    ctx.save(); ctx.strokeStyle = C.red3; ctx.globalAlpha *= (1 - rb); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(540, 1210, 120 + oC(rb) * 300, 0, 7); ctx.stroke(); ctx.restore();
    badge(540, 1210, 250, ck);
  }
  ctx.restore();
}

// S9 37.0–39.0 CTA on red: "واش راك تستنى؟ باش تبدا تخدم"
function s9(T) {
  ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H);
  // moving slanted stripes (logo motif)
  ctx.save(); ctx.fillStyle = 'rgba(120,8,18,0.35)';
  const off = (T * 260) % 300;
  for (let x = -1400; x < 1600; x += 300) { const xx = x + off; ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx + 110, 0); ctx.lineTo(xx + 110 - 820, H); ctx.lineTo(xx - 820, H); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const g = ctx.createRadialGradient(540, 960, 200, 540, 960, 1100); g.addColorStop(0, 'rgba(255,90,100,0.35)'); g.addColorStop(1, 'rgba(60,0,6,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const punch = 1 + 0.05 * (1 - oC(P(T, 37.85, 38.15))) * (T > 37.85 ? 1 : 0);
  ctx.save(); zoomAround(540, 980, punch);
  words(T, [['واش', 37.0], ['راك', 37.35]], 540, 820, 170, { color: C.white });
  ctx.save();
  const tp = P(T, 37.8, 38.2);
  if (tp > 0) {
    ctx.translate(540, 1080); const s = lerp(1.8, 1, oE(tp)); ctx.scale(s, s); ctx.globalAlpha *= clamp(tp * 3);
    ctx.font = `900 250px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillText('تستنى؟', 10, 14);
    ctx.fillStyle = '#0B0B0F'; ctx.fillText('تستنى؟', 0, 0);
  }
  ctx.restore();
  words(T, [['باش', 38.3], ['تبدا', 38.45], ['تخدم', 38.62]], 540, 1260, 92, { color: C.white });
  ctx.restore();
}

// S10 39.0–end logo end card
function s10(T) {
  background(T, { glowY: 1000, glow: 0.45 });
  logo(T, 39.15, 540, 880, 1.2);
  const up = P(T, 40.45, 40.9);
  pill(540, 1140, 'zimouexpress.com', 46, up, { weight: 700 });
  ctx.save(); ctx.globalAlpha *= 0.85;
  words(T, [['+800', 40.8, C.red], ['مكتب', 40.9], ['عبر', 41.0], ['الوطن', 41.1]], 540, 1290, 50, { weight: 600, color: C.gray, glow: false });
  ctx.restore();
}

// ================= timeline =================
const SCENES = [[0, 5.5, s1], [5.5, 13.6, s2], [13.6, 16.0, s3], [16.0, 20.0, s4], [20.0, 23.0, s5], [23.0, 28.5, s6], [28.5, 33.0, s7], [33.0, 37.0, s8], [37.0, 39.0, s9], [39.0, 99, s10]];
function render(T) {
  const f = Math.round(T * 30);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.letterSpacing = '0px'; ctx.shadowBlur = 0; ctx.setLineDash([]);
  const sc = SCENES.find(s => T >= s[0] && T < s[1]) || SCENES[SCENES.length - 1];
  ctx.save(); sc[2](T); ctx.restore();
  ctx.globalAlpha = 1;
  if (T < 39) finish(T, f); else finish(T, f);
  slantWipe(T, 5.5); slantWipe(T, 16.0); slantWipe(T, 23.0); slantWipe(T, 33.0); slantWipe(T, 37.0); slantWipe(T, 39.0);
  flash(T, 13.6, 0.55); flash(T, 20.0, 0.45); flash(T, 28.5, 0.35);
  // global fade in / out
  const fo = P(T, DUR - 0.25, DUR) , fi = 1 - P(T, 0, 0.25);
  if (fo > 0 || fi > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.max(fo, fi)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
document.fonts.load(`800 40px ${AR}`, 'عربي').then(() => Promise.all([
  document.fonts.load(`900 40px ${AR}`, 'عربي'), document.fonts.load(`600 40px ${AR}`, 'عربي'), document.fonts.load(`700 40px ${AR}`, 'عربي'),
  document.fonts.load(`900 40px ${LA}`, 'Ab'), document.fonts.load(`800 40px ${LA}`, 'Ab'), document.fonts.load(`700 40px ${LA}`, 'Ab'),
  document.fonts.load(`600 40px ${LA}`, 'Ab'), document.fonts.load(`500 40px ${LA}`, 'Ab'),
])).then(() => { render(0); window.ready = true; });
