// فواخر — "Golden Storybook" motion graphic. render(t) is deterministic. 1080x1920, synced to the voiceover.
const W = 1080, H = 1920, DUR = 68.39;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
// Brand palette (swap here if the official identity differs)
const C = {
  bg0: '#2A170F', bg1: '#0D0705', gold: '#D9B26A', gold2: '#F3DDA6', goldD: '#9C7438', cream: '#F4EAD8',
  date: '#5A2A14', date2: '#8A4A22', dateHi: '#C7864A', ember: '#FF9A3D'
};
const NASKH = 'Amiri', RUQAA = 'Aref Ruqaa', KUFI = 'Reem Kufi';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const oC = t => 1 - Math.pow(1 - t, 3);
const oE = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const ioC = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ioS = t => 0.5 - 0.5 * Math.cos(Math.PI * t);
const iC = t => t * t * t;
const oB = t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = 0.4, fo = 0.4) => clamp(P(t, a, a + fi)) * (1 - P(t, b - fo, b)); // visibility window
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- geometry ----------
function bez(p0, c1, c2, p3, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]]);
  }
  return out;
}
function quad(a, c, b, n = 24) { return bez(a, [a[0] + (c[0] - a[0]) * 2 / 3, a[1] + (c[1] - a[1]) * 2 / 3], [b[0] + (c[0] - b[0]) * 2 / 3, b[1] + (c[1] - b[1]) * 2 / 3], b, n); }
function ellipsePts(cx, cy, rx, ry, rot = 0, n = 48, a0 = 0, a1 = Math.PI * 2) {
  const out = [];
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); const x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return out;
}
function starPts(cx, cy, R, r, n = 8, rot = 0) {
  const out = [];
  for (let i = 0; i <= n * 2; i++) { const a = rot - Math.PI / 2 + i * Math.PI / n; const rr = i % 2 ? r : R; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return out;
}
function squarePts(cx, cy, s, rot) { // for 8-point (two squares) star
  const out = [];
  for (let i = 0; i <= 4; i++) { const a = rot + Math.PI / 4 + i * Math.PI / 2; out.push([cx + Math.cos(a) * s, cy + Math.sin(a) * s]); }
  return out;
}
function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function pathPartial(pts, p) { // builds path for first p of length
  if (p <= 0) return false;
  const L = plen(pts) * clamp(p);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) { const k = (L - acc) / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); return true; }
    ctx.lineTo(pts[i][0], pts[i][1]); acc += d;
  }
  return true;
}
function gline(pts, p, w = 3.5, col = C.gold, glow = 14) {
  if (!pathPartial(pts, p)) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = 'rgba(240,200,120,0.75)'; ctx.shadowBlur = glow;
  ctx.stroke(); ctx.restore();
}
function goldGrad(y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#FBEBC0'); g.addColorStop(0.45, '#E2BC72'); g.addColorStop(1, '#9C7438');
  return g;
}

// ---------- illustrated elements ----------
function dateFruit(x, y, s, rot = -0.35, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-s * 0.25, -s * 0.35, s * 0.05, 0, 0, s * 1.1);
  g.addColorStop(0, C.dateHi); g.addColorStop(0.35, C.date2); g.addColorStop(1, '#2A1008');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(30,10,4,0.45)'; ctx.lineWidth = Math.max(1, s * 0.025);
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-s * 0.4 + k * s * 0.2, -s * 0.7); ctx.quadraticCurveTo(-s * 0.3 + k * s * 0.22, 0, -s * 0.38 + k * s * 0.2, s * 0.75); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,230,190,0.35)'; ctx.beginPath(); ctx.ellipse(-s * 0.22, -s * 0.45, s * 0.12, s * 0.3, -0.2, 0, 7); ctx.fill();
  ctx.fillStyle = '#C9A35C'; ctx.beginPath(); ctx.ellipse(0, -s * 0.98, s * 0.16, s * 0.08, 0, 0, 7); ctx.fill();
  ctx.restore();
}
// palm tree line art; p in 0..1 (trunk first, then fronds); dates 0..1 fills bunches
function palm(x, by, h, p, o = {}) {
  const lean = o.lean ?? h * 0.08, top = [x + lean, by - h];
  const trunk = quad([x, by], [x - lean * 0.6, by - h * 0.55], top, 30);
  const tp = clamp(p / 0.45), fp = clamp((p - 0.35) / 0.65);
  const w = o.w ?? Math.max(2.5, h / 160);
  if (o.fill) { // silhouette mode
    ctx.save(); ctx.globalAlpha *= tp; ctx.strokeStyle = o.fill; ctx.lineWidth = h * 0.05; ctx.lineCap = 'round'; pathPartial(trunk, 1); ctx.stroke(); ctx.restore();
  }
  gline(trunk, tp, w * 1.3, o.col || C.gold, o.glow ?? 12);
  if (tp > 0.2) { // trunk rings
    ctx.save(); ctx.strokeStyle = o.col || C.gold; ctx.lineWidth = w * 0.7; ctx.globalAlpha *= 0.7;
    const n = Math.floor(16 * tp);
    for (let i = 1; i < n; i++) { const q = trunk[Math.floor(i / 16 * 30)]; const ww = h * 0.028; ctx.beginPath(); ctx.moveTo(q[0] - ww, q[1] + 3); ctx.lineTo(q[0] + ww, q[1] - 3); ctx.stroke(); }
    ctx.restore();
  }
  const N = o.fronds ?? 11, L = h * 0.48;
  for (let i = 0; i < N; i++) {
    const a = lerp(-Math.PI * 0.98, -Math.PI * 0.02, i / (N - 1)) + Math.sin(i * 7.3) * 0.08 + (o.sway ? Math.sin(o.sway + i) * 0.03 : 0);
    const up = Math.sin(-a);
    const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.55 + L * 0.55 * (1 - up) + L * 0.12];
    const ctrl = [top[0] + Math.cos(a) * L * 0.5, top[1] - L * 0.32 * up - L * 0.08];
    const fr = quad(top, ctrl, tip, 20);
    const fpp = clamp(fp * 1.6 - i * 0.05);
    if (o.fill) { ctx.save(); ctx.globalAlpha *= fpp; ctx.strokeStyle = o.fill; ctx.lineWidth = h * 0.03; ctx.lineCap = 'round'; pathPartial(fr, fpp); ctx.stroke(); ctx.restore(); }
    gline(fr, fpp, w, o.col || C.gold, o.glow ?? 10);
    if (fpp > 0.3) { // leaflets
      ctx.save(); ctx.strokeStyle = o.col || C.gold; ctx.lineWidth = w * 0.55; ctx.globalAlpha *= 0.8 * clamp((fpp - 0.3) / 0.5);
      for (let k = 3; k < Math.floor(20 * fpp); k += 2) {
        const q = fr[k], q2 = fr[k + 1] || q; const dx = q2[0] - q[0], dy = q2[1] - q[1], d = Math.hypot(dx, dy) || 1;
        const nx = -dy / d, ny = dx / d, ll = h * 0.05 * (1 - k / 24);
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + nx * ll + dx / d * ll * 0.8, q[1] + ny * ll + dy / d * ll * 0.8 + ll * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - nx * ll + dx / d * ll * 0.8, q[1] - ny * ll + dy / d * ll * 0.8 + ll * 0.5); ctx.stroke();
      }
      ctx.restore();
    }
  }
  const dts = o.dates || 0;
  if (dts > 0) {
    const R = rng(Math.round(x * 7 + h));
    [[-1], [1]].forEach(([sd], b) => {
      const bx = top[0] + sd * h * 0.07, byy = top[1] + h * 0.07;
      for (let k = 0; k < 22; k++) {
        const kk = k / 22; if (kk > dts) break;
        const ang = R() * Math.PI * 2, rr = R() * h * 0.05;
        dateFruit(bx + Math.cos(ang) * rr + sd * kk * h * 0.03, byy + kk * h * 0.12 + Math.sin(ang) * rr * 0.6, h * 0.018, sd * 0.2);
      }
    });
  }
  return top;
}
function man(x, fy, s, a) { // seated silhouette in ghutra & bisht, gold rim
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, fy); ctx.lineTo(x - s * 0.36, fy - s * 1.1); ctx.quadraticCurveTo(x - s * 0.3, fy - s * 1.3, x - s * 0.16, fy - s * 1.33);
  ctx.lineTo(x - s * 0.2, fy - s * 1.55); ctx.quadraticCurveTo(x, fy - s * 1.95, x + s * 0.2, fy - s * 1.55);
  ctx.lineTo(x + s * 0.16, fy - s * 1.33); ctx.quadraticCurveTo(x + s * 0.3, fy - s * 1.3, x + s * 0.36, fy - s * 1.1);
  ctx.lineTo(x + s * 0.5, fy); ctx.closePath();
  ctx.fillStyle = '#1A0E09'; ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(240,200,120,0.7)'; ctx.shadowBlur = 14; ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = C.goldD; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - s * 0.2, fy - s * 1.62); ctx.quadraticCurveTo(x, fy - s * 1.7, x + s * 0.2, fy - s * 1.62); ctx.stroke(); // agal
  ctx.beginPath(); ctx.moveTo(x, fy - s * 1.25); ctx.lineTo(x, fy); ctx.stroke();
  ctx.restore();
}
function crate(x, y, w, h, a, fill) {
  ctx.save(); ctx.globalAlpha *= a;
  // dates heap
  const R = rng(Math.round(x + y));
  for (let i = 0; i < 9; i++) dateFruit(x + w * 0.12 + R() * w * 0.76, y - h * 0.02 - R() * h * 0.22, h * 0.13, (R() - 0.5) * 1.6);
  ctx.fillStyle = fill || 'rgba(60,32,18,0.95)'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(240,200,120,0.6)'; ctx.shadowBlur = 10; ctx.strokeRect(x, y, w, h);
  ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.globalAlpha *= 0.7;
  for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x, y + h * k / 3); ctx.lineTo(x + w, y + h * k / 3); ctx.stroke(); }
  ctx.restore();
}
function ornament(cx, y, w, p) { // divider with diamond
  if (p <= 0) return;
  const hw = w / 2 * oC(p);
  ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.globalAlpha *= p;
  ctx.beginPath(); ctx.moveTo(cx - hw, y); ctx.lineTo(cx - 18, y); ctx.moveTo(cx + 18, y); ctx.lineTo(cx + hw, y); ctx.stroke();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(cx, y - 10); ctx.lineTo(cx + 10, y); ctx.lineTo(cx, y + 10); ctx.lineTo(cx - 10, y); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function star8(cx, cy, R, p, rot = 0, w = 3) { // classic 8-point star (two squares) + circle
  gline(squarePts(cx, cy, R, rot), p, w);
  gline(squarePts(cx, cy, R, rot + Math.PI / 4), clamp(p * 1.1 - 0.1), w);
  gline(ellipsePts(cx, cy, R * 0.72, R * 0.72, rot, 64), clamp(p * 1.2 - 0.2), w * 0.7);
}

// ---------- background ----------
const R0 = rng(11);
const dust = Array.from({ length: 110 }, () => ({ x: R0() * W, y: R0() * H, s: 0.8 + R0() * 2.6, v: 8 + R0() * 26, a: 0.2 + R0() * 0.6, ph: R0() * 6 }));
const grains = [0, 1, 2].map(k => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640;
  const g = c.getContext('2d'); const id = g.createImageData(360, 640); const r = rng(500 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});
// faint girih lattice tile
const tile = (() => {
  const c = document.createElement('canvas'); c.width = 180; c.height = 180; const g = c.getContext('2d');
  g.strokeStyle = 'rgba(217,178,106,1)'; g.lineWidth = 1.4;
  const sq = (rot) => { g.beginPath(); for (let i = 0; i <= 4; i++) { const a = rot + Math.PI / 4 + i * Math.PI / 2; const x = 90 + Math.cos(a) * 52, y = 90 + Math.sin(a) * 52; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
  sq(0); sq(Math.PI / 4);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(52, 52); g.moveTo(180, 0); g.lineTo(128, 52); g.moveTo(0, 180); g.lineTo(52, 128); g.moveTo(180, 180); g.lineTo(128, 128); g.stroke();
  return c;
})();
function background(T, warm = 0) {
  const g = ctx.createRadialGradient(540, 820, 80, 540, 900, 1250);
  g.addColorStop(0, C.bg0); g.addColorStop(1, C.bg1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (warm > 0) { // dawn warmth
    const w2 = ctx.createLinearGradient(0, 0, 0, H);
    w2.addColorStop(0, `rgba(70,40,70,${0.35 * warm})`); w2.addColorStop(0.5, `rgba(214,120,50,${0.35 * warm})`); w2.addColorStop(0.62, `rgba(255,190,110,${0.28 * warm})`); w2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = w2; ctx.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.globalAlpha = 0.045; ctx.translate(-(T * 6) % 180, -(T * 4) % 180);
  ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, W + 360, H + 360); ctx.restore();
  ctx.save(); ctx.fillStyle = '#F6D79A';
  dust.forEach(d => {
    const y = ((d.y - T * d.v) % H + H) % H, x = d.x + Math.sin(T * 0.6 + d.ph) * 18;
    ctx.globalAlpha = d.a * (0.45 + 0.55 * Math.sin(T * 1.7 + d.ph));
    ctx.beginPath(); ctx.arc(x, y, d.s, 0, 7); ctx.fill();
  });
  ctx.restore();
}
function frame(T) {
  const p = P(T, 0.2, 1.4);
  ctx.save(); ctx.strokeStyle = 'rgba(217,178,106,0.55)'; ctx.lineWidth = 2; ctx.globalAlpha = p;
  const m = 34;
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  ctx.strokeStyle = 'rgba(217,178,106,0.25)'; ctx.strokeRect(m + 10, m + 10, W - 2 * m - 20, H - 2 * m - 20);
  ctx.fillStyle = C.gold;
  [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.fill(); });
  ctx.restore();
}
function finish(f) {
  const v = ctx.createRadialGradient(540, 900, 520, 540, 900, 1300);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(grains[f % 3], 0, 0, W, H); ctx.restore();
}

// ---------- captions (synced to the voiceover) ----------
// each: lines [[text, start, end]], hl = words to gild, y, size, out (fade time)
const CAPS = [
  { lines: [['تبون تعرفون السر', 0.71, 2.1], ['ورى تمور فواخر؟', 2.1, 3.41]], hl: ['السر', 'فواخر؟'], y: 1470, size: 96, out: 3.75 },
  { lines: [['خلكم معاي', 3.81, 4.6], ['وسمعوا القصة!', 4.6, 5.48]], hl: ['القصة!'], y: 1470, size: 96, out: 5.75 },
  { lines: [['كان في هاوي', 7.35, 8.1], ['لعالم التمور', 8.1, 8.94]], hl: ['التمور'], y: 1480, size: 84, out: 9.5 },
  { lines: [['طريقة زراعتها.. أنواعها..', 9.66, 11.9], ['ورعايتها على مدار العام..', 12.05, 13.63]], hl: ['زراعتها..', 'أنواعها..', 'ورعايتها'], y: 1480, size: 74, out: 14.6 },
  { lines: [['كبر الشغف', 15.11, 16.0], ['وزاد الفضول..', 16.0, 16.9]], hl: ['الشغف', 'الفضول..'], y: 1480, size: 88, out: 17.15 },
  { lines: [['وابتدت عملية', 17.19, 18.3], ['البحث والاستكشاف..', 18.3, 19.74]], hl: ['البحث', 'والاستكشاف..'], y: 1480, size: 84, out: 19.9 },
  { lines: [['عن نخلة غنية منتجه', 19.92, 21.7], ['لثمار ذات جودة عالية في الخليج...', 21.85, 23.92]], hl: ['نخلة', 'جودة', 'عالية', 'الخليج...'], y: 1480, size: 70, out: 24.6 },
  { lines: [['لين ما لقاها', 24.66, 25.5], ['في السعودية..', 25.5, 26.42]], hl: ['السعودية..'], y: 1480, size: 90, out: 26.8 },
  { lines: [['وصار من رواد مهرجان بريدة', 26.86, 29.1], ['في "مزارع القصيم"..', 29.2, 30.36]], hl: ['بريدة', '"مزارع', 'القصيم"..'], y: 1480, size: 72, out: 30.85 },
  { lines: [['أكبر مهرجان سنوي في العالم..', 30.91, 33.1], ['الي ينتج أطيب ثمار الأرض', 33.3, 35.0], ['في موسم الحصاد!', 35.0, 36.51]], hl: ['أكبر', 'أطيب', 'الحصاد!'], y: 1440, size: 66, out: 37.1 },
  { lines: [['هني...', 37.17, 37.6], ['ينقولون المحاصيل..', 37.9, 39.32]], hl: ['المحاصيل..'], y: 1480, size: 88, out: 39.68 },
  { lines: [['ويفرزون التمر حسب', 39.72, 41.1], ['الحجم والنوع والجودة..', 41.2, 42.85]], hl: ['الحجم', 'والنوع', 'والجودة..'], y: 1480, size: 80, out: 43.5 },
  { lines: [['ومع شق النور..', 43.61, 44.66], ['يجهز نفسه لوقت المزاد..', 45.02, 46.79]], hl: ['النور..', 'المزاد..'], y: 1480, size: 80, out: 47.2 },
  { lines: [['ومن قلب الحدث..', 47.27, 48.25], ['يدخل التنافس الشرس..', 48.45, 50.2]], hl: ['الشرس..'], y: 1480, size: 84, out: 50.45 },
  { lines: [['ويختار لكم "نخبة"', 50.5, 51.6], ['من المحاصيل..', 51.6, 52.69]], hl: ['"نخبة"'], y: 1480, size: 88, out: 52.75 },
  { lines: [['ومن هذا الشغف', 54.5, 55.7], ['ومن بعد التوافيق من رب العالمين..', 56.0, 58.4]], hl: ['الشغف', 'التوافيق'], y: 1480, size: 70, out: 58.6 },
  { lines: [['تم تأسيس', 58.7, 59.4]], hl: [], y: 470, size: 70, out: 61.7 },
  { lines: [['قصة نجاح وفخر..', 61.96, 63.5], ['ابتدت من سنين...', 63.69, 64.77]], hl: ['نجاح', 'وفخر..'], y: 1480, size: 84, out: 65.05 },
  { lines: [['وباقية معاكم', 65.12, 66.1], ['إن شاء الله للأبد..', 66.1, 67.56]], hl: ['للأبد..'], y: 1480, size: 88, out: 99 },
];
function captions(T) {
  CAPS.forEach(c => {
    const t0 = c.lines[0][1];
    if (T < t0 - 0.1 || T > c.out + 0.4) return;
    const fo = 1 - P(T, c.out, c.out + 0.35);
    ctx.save(); ctx.globalAlpha *= fo; ctx.translate(0, -(1 - fo) * 30);
    const lh = c.size * 1.32;
    if (c.y > 1000) ornament(540, c.y - c.size * 1.05, 360, P(T, t0 - 0.1, t0 + 0.5));
    c.lines.forEach(([txt, a, b], li) => {
      const y = c.y + li * lh;
      const ws = txt.split(' ');
      ctx.font = `700 ${c.size}px ${NASKH}`; ctx.direction = 'rtl';
      const sp = ctx.measureText(' ').width;
      const wd = ws.map(w => ctx.measureText(w).width);
      let total = wd.reduce((s, v) => s + v, 0) + sp * (ws.length - 1), sc = 1;
      if (total > 960) sc = 960 / total;
      const chars = ws.reduce((s, w) => s + w.length, 0);
      let x = 540 + total * sc / 2, acc = 0;
      ws.forEach((w, i) => {
        const wt = lerp(a, b, acc / chars) - 0.08; acc += w.length;
        const k = P(T, wt, wt + 0.45);
        if (k > 0) {
          const isH = c.hl.includes(w);
          ctx.save();
          ctx.translate(x - wd[i] * sc / 2, y + (1 - oE(k)) * 26);
          ctx.scale(sc, sc);
          ctx.globalAlpha *= clamp(k * 2.2);
          ctx.font = `700 ${c.size}px ${NASKH}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18;
          if (isH) { ctx.fillStyle = goldGrad(-c.size * 0.8, c.size * 0.2); ctx.shadowColor = 'rgba(240,190,100,0.55)'; ctx.shadowBlur = 24; }
          else ctx.fillStyle = C.cream;
          ctx.fillText(w, 0, 0);
          ctx.restore();
        }
        x -= (wd[i] + sp) * sc;
      });
    });
    ctx.restore();
  });
}
function calli(text, x, y, size, p, font = RUQAA, o = {}) { // calligraphic write-on (clip from right)
  if (p <= 0) return;
  ctx.save();
  ctx.font = `700 ${size}px ${font}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(text).width + 40;
  ctx.beginPath(); ctx.rect(x + w / 2 - w * oC(p), y - size * 1.4, w * oC(p), size * 2.2); ctx.clip();
  ctx.shadowColor = 'rgba(240,190,100,0.6)'; ctx.shadowBlur = o.glow ?? 30;
  ctx.fillStyle = goldGrad(y - size * 0.9, y + size * 0.3);
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ================= SCENES =================
// 0.0–6.0  hook: the secret behind a single date
function sHook(T) {
  const a = win(T, 0.4, 6.4, 0.6, 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const rot = T * 0.12 + P(T, 3.8, 5.6) * 1.2;
  // rays
  ctx.save(); ctx.translate(540, 800); ctx.rotate(T * 0.05); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); const g = ctx.createLinearGradient(0, 0, 0, -900); g.addColorStop(0, 'rgba(240,190,110,0.10)'); g.addColorStop(1, 'rgba(240,190,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(90, -900); ctx.lineTo(-90, -900); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  star8(540, 800, 400, oC(P(T, 0.6, 2.4)), rot, 3);
  star8(540, 800, 300, oC(P(T, 1.0, 2.8)), -rot * 1.3, 2);
  gline(ellipsePts(540, 800, 470, 470, rot, 90), oC(P(T, 0.8, 2.8)), 1.5);
  // the date
  const dp = P(T, 0.7, 1.5);
  const pulse = 1 + 0.06 * Math.exp(-Math.max(0, T - 2.7) * 4) * (T > 2.7 ? 1 : 0) + 0.015 * Math.sin(T * 2.4);
  if (dp > 0) {
    const g = ctx.createRadialGradient(540, 800, 10, 540, 800, 320);
    g.addColorStop(0, `rgba(255,190,100,${0.35 * dp})`); g.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = g; ctx.fillRect(140, 400, 800, 800);
    dateFruit(540, 800, 230 * lerp(0.7, 1, oB(dp)) * pulse, -0.4 + Math.sin(T * 0.8) * 0.05, dp);
  }
  // shine sweep on "فواخر"
  const sh = P(T, 2.6, 3.3);
  if (sh > 0 && sh < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= Math.sin(Math.PI * sh) * 0.5; const g = ctx.createRadialGradient(540, 800, 0, 540, 800, 520 * sh + 100); g.addColorStop(0, 'rgba(255,220,150,0.6)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, 200, W, 1200); ctx.restore(); }
  // big faint question mark
  const qp = win(T, 1.4, 3.7, 0.5, 0.4);
  if (qp > 0) { ctx.save(); ctx.globalAlpha *= qp * 0.12; ctx.font = `700 900px ${NASKH}`; ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.fillText('؟', 540, 1180); ctx.restore(); }
  ctx.restore();
}
// arabesque doors transition 5.35–6.35
function doors(T, t0) {
  const p = P(T, t0, t0 + 0.45) * (1 - P(T, t0 + 0.6, t0 + 1.05));
  if (p <= 0) return;
  const e = ioC(p);
  [[-1], [1]].forEach(([sd]) => {
    ctx.save();
    const x0 = sd < 0 ? -540 + 540 * e : W - 540 * e;
    ctx.translate(x0, 0);
    ctx.fillStyle = '#1B0F0A'; ctx.fillRect(0, 0, 540, H);
    ctx.globalAlpha = 0.5; ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, 540, H); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 500, H - 40);
    const ex = sd < 0 ? 540 : 0;
    ctx.fillStyle = C.gold; ctx.fillRect(ex - 4, 0, 8, H);
    ctx.save(); ctx.translate(sd < 0 ? 540 : 0, 960); star8(0, 0, 120, 1, 0, 3); ctx.restore();
    ctx.restore();
  });
}
// 6.3–9.6  once upon a time
function sOnce(T) {
  const a = win(T, 6.1, 9.7, 0.3, 0.45);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  calli('كان يا ماكان..', 540, 480, 150, P(T, 6.3, 7.4));
  ornament(540, 560, 520, P(T, 6.8, 7.6));
  // horizon + palm + the enthusiast
  const hp = oC(P(T, 7.2, 8.0));
  gline([[540 - 420 * hp, 1250], [540 + 420 * hp, 1250]], 1, 2.5);
  palm(720, 1250, 560, P(T, 7.4, 9.0), { sway: T * 1.2 });
  man(370, 1250, 230, P(T, 7.7, 8.4));
  // gaze line of curiosity
  const gz = P(T, 8.4, 9.1);
  if (gz > 0) { ctx.save(); ctx.setLineDash([6, 10]); gline([[410, 880], [650, 760]], gz, 2, C.gold2, 8); ctx.restore(); }
  ctx.restore();
}
// 9.66–14.6  how they grow, varieties, year-round care
function sCare(T) {
  const a = win(T, 9.4, 14.7, 0.3, 0.5);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const M = [[540, 520, 9.66, 'زراعتها'], [540, 870, 11.04, 'أنواعها'], [540, 1220, 12.05, 'رعايتها']];
  M.forEach(([x, y, t0, label], i) => {
    const p = P(T, t0 - 0.1, t0 + 0.7);
    if (p <= 0) return;
    const side = i % 2 ? 1 : -1, mx = x + side * 190;
    gline(ellipsePts(mx, y, 140, 140, -Math.PI / 2, 80), oC(p), 3);
    gline(ellipsePts(mx, y, 124, 124, -Math.PI / 2, 80), oC(P(T, t0, t0 + 0.8)), 1.2);
    // label on the other side
    ctx.save(); ctx.globalAlpha *= P(T, t0 + 0.2, t0 + 0.6);
    ctx.font = `700 76px ${RUQAA}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = goldGrad(y - 60, y + 20);
    ctx.shadowColor = 'rgba(240,190,100,0.5)'; ctx.shadowBlur = 20; ctx.fillText(label, x - side * 200, y + 24); ctx.restore();
    gline([[x - side * 30, y], [x - side * 80, y]], P(T, t0 + 0.2, t0 + 0.5), 2);
    if (i === 0) { // seedling
      const s = P(T, t0 + 0.1, t0 + 1.1);
      gline([[mx - 80, y + 70], [mx + 80, y + 70]], s * 2, 3);
      const stem = quad([mx, y + 70], [mx - 10, y + 10], [mx + 4, y - 50], 20);
      gline(stem, clamp(s * 1.5 - 0.2), 3.5);
      const lf = clamp(s * 1.6 - 0.6);
      if (lf > 0) {
        gline(quad([mx + 2, y - 20], [mx - 50, y - 60], [mx - 70, y - 20], 16), lf, 3);
        gline(quad([mx + 2, y - 20], [mx - 30, y], [mx - 70, y - 20], 16), lf, 3);
        gline(quad([mx + 4, y - 45], [mx + 50, y - 90], [mx + 70, y - 50], 16), lf, 3);
        gline(quad([mx + 4, y - 45], [mx + 35, y - 25], [mx + 70, y - 50], 16), lf, 3);
      }
      for (let k = 0; k < 3; k++) { const dy = ((T * 60 + k * 40) % 120); ctx.save(); ctx.globalAlpha *= s * (1 - dy / 120); ctx.fillStyle = C.gold2; ctx.beginPath(); ctx.ellipse(mx + 60 - k * 20, y - 100 + dy, 5, 8, 0, 0, 7); ctx.fill(); ctx.restore(); }
    } else if (i === 1) { // varieties
      const shapes = [[-70, 0.9, 1.0], [0, 1.05, 0.75], [70, 0.8, 1.15]];
      shapes.forEach(([dx, sc, sq], k) => {
        const q = P(T, t0 + 0.1 + k * 0.15, t0 + 0.5 + k * 0.15);
        if (q <= 0) return;
        ctx.save(); ctx.translate(mx + dx, y + 6); ctx.scale(sq, 1); dateFruit(0, 0, 48 * sc * oB(q), [-0.3, 0.1, 0.35][k]); ctx.restore();
      });
    } else { // year ring
      const q = P(T, t0, t0 + 1.2);
      for (let k = 0; k < 12; k++) {
        if (k / 12 > q) break;
        const an = -Math.PI / 2 + k * Math.PI / 6;
        gline([[mx + Math.cos(an) * 80, y + Math.sin(an) * 80], [mx + Math.cos(an) * 100, y + Math.sin(an) * 100]], 1, 3);
      }
      const an = -Math.PI / 2 + T * 2.2;
      ctx.save(); ctx.globalAlpha *= q; ctx.fillStyle = C.ember; ctx.shadowColor = C.ember; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(mx + Math.cos(an) * 60, y + Math.sin(an) * 60, 13, 0, 7); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha *= q; ctx.strokeStyle = C.gold2; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx - Math.cos(an) * 60, y - Math.sin(an) * 60, 12, 0.6, 5.2); ctx.stroke(); ctx.restore();
    }
  });
  ctx.restore();
}
// 15.1–17.1  passion grows (ember)
const R3 = rng(33);
const sparks = Array.from({ length: 60 }, () => ({ x: (R3() - 0.5) * 180, v: 140 + R3() * 260, ph: R3(), s: 1.5 + R3() * 3 }));
function sFlame(T) {
  const a = win(T, 14.8, 17.3, 0.4, 0.35);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const g1 = P(T, 15.0, 16.0), g2 = P(T, 16.0, 16.9); // الشغف grows, الفضول grows more
  const s = lerp(0.35, 0.8, oC(g1)) + 0.35 * oC(g2);
  const cx = 540, cy = 1050;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(cx, cy - 120 * s, 10, cx, cy - 120 * s, 520 * s);
  halo.addColorStop(0, 'rgba(255,170,70,0.45)'); halo.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 300, W, 1200);
  for (let layer = 0; layer < 3; layer++) {
    const k = [1, 0.7, 0.42][layer], col = ['rgba(255,120,40,0.55)', 'rgba(255,180,80,0.7)', 'rgba(255,240,190,0.9)'][layer];
    const hgt = 520 * s * k, wid = 190 * s * k;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(cx, cy);
    const fl = t => Math.sin(T * 9 + t * 5 + layer) * 18 * s * k;
    ctx.bezierCurveTo(cx - wid * 1.2, cy - hgt * 0.15, cx - wid * 0.6 + fl(1), cy - hgt * 0.6, cx + fl(2) * 0.5, cy - hgt);
    ctx.bezierCurveTo(cx + wid * 0.6 + fl(3), cy - hgt * 0.6, cx + wid * 1.2, cy - hgt * 0.15, cx, cy);
    ctx.fill();
  }
  ctx.fillStyle = '#FFD89A';
  sparks.forEach(sp => {
    const u = ((T - 15) * sp.v / 700 + sp.ph) % 1;
    ctx.globalAlpha = (1 - u) * 0.9 * a;
    ctx.beginPath(); ctx.arc(cx + sp.x * s * (1 + u) + Math.sin(T * 3 + sp.ph * 9) * 20, cy - 80 - u * 760 * s, sp.s, 0, 7); ctx.fill();
  });
  ctx.restore();
  // date-palm ember sigil under the flame
  star8(cx, cy + 40, 170 * s, 1, T * 0.4, 2.5);
  ctx.restore();
}
// 17.2–19.9  the search: compass
function sCompass(T) {
  const a = win(T, 17.0, 20.0, 0.3, 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const cx = 540, cy = 900, p = oC(P(T, 17.15, 18.0));
  gline(ellipsePts(cx, cy, 330, 330, -Math.PI / 2, 100), p, 3);
  gline(ellipsePts(cx, cy, 300, 300, -Math.PI / 2, 100), p, 1.2);
  for (let k = 0; k < 32; k++) { const an = k * Math.PI / 16; const r2 = k % 4 === 0 ? 270 : 286; gline([[cx + Math.cos(an) * 300, cy + Math.sin(an) * 300], [cx + Math.cos(an) * r2, cy + Math.sin(an) * r2]], P(T, 17.3 + k * 0.01, 17.6 + k * 0.01), 2); }
  const rp = oC(P(T, 17.4, 18.3));
  const rose = []; for (let i = 0; i <= 16; i++) { const an = -Math.PI / 2 + i * Math.PI / 8; const rr = i % 2 ? 70 : (i % 4 === 0 ? 250 : 150); rose.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
  gline(rose, rp, 3);
  ['ش', 'ج', 'شر', 'غ'].forEach((l, i) => { const an = -Math.PI / 2 + i * Math.PI / 2; ctx.save(); ctx.globalAlpha *= rp; ctx.font = `700 52px ${KUFI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.gold2; ctx.fillText(l, cx + Math.cos(an) * 400, cy + Math.sin(an) * 400); ctx.restore(); });
  // swinging needle
  const sw = Math.sin((T - 17.3) * 3.2) * Math.exp(-(T - 17.3) * 0.5) * 1.2 + 0.6;
  if (T > 17.4) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(sw);
    ctx.fillStyle = C.ember; ctx.shadowColor = C.ember; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(22, 0); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(22, 0); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#1A0E09'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
// 19.9–30.6  the Gulf map -> Saudi -> Qassim farms
const ARAB = [[47.9, 29.5], [48.5, 28.0], [49.6, 26.9], [50.2, 26.2], [50.8, 25.0], [50.8, 24.7], [51.2, 26.1], [51.6, 25.3], [51.6, 24.5], [52.5, 24.2], [54.0, 24.1], [55.5, 25.5], [56.1, 26.2], [56.4, 25.0], [56.4, 24.6], [57.8, 23.7], [58.8, 23.5], [59.8, 22.5], [58.6, 20.5], [57.8, 19.0], [56.6, 18.0], [55.0, 17.0], [52.2, 15.6], [49.0, 14.6], [45.0, 13.0], [43.5, 12.7], [43.2, 13.3], [42.8, 15.3], [42.7, 16.5], [41.7, 17.9], [40.8, 19.7], [39.2, 21.5], [38.5, 23.6], [37.4, 24.7], [36.6, 26.0], [35.1, 28.0], [34.9, 29.5], [36.5, 29.9], [37.5, 30.5], [38.0, 31.5], [39.2, 32.2], [42.0, 31.0], [44.7, 29.2], [46.5, 29.1], [47.9, 29.5]];
const KW = [47.98, 29.37], QS = [43.97, 26.33];
function sMap(T) {
  const a = win(T, 19.75, 30.4, 0.3, 0.55);
  if (a <= 0) return;
  const zoom = 1 + 1.6 * ioC(P(T, 26.9, 28.6));
  const k = 34, MX = 540, MY = 860;
  const raw = (lon, lat) => [MX + (lon - 47) * k * 0.9, MY - (lat - 22.5) * k];
  const qs0 = raw(QS[0], QS[1]);
  const pr = (lon, lat) => { const q = raw(lon, lat); return [qs0[0] + (q[0] - qs0[0]) * zoom + (540 - qs0[0]) * (zoom - 1) / 1.6, qs0[1] + (q[1] - qs0[1]) * zoom + (900 - qs0[1]) * (zoom - 1) / 1.6]; };
  const mapA = 1 - P(T, 28.4, 29.3);
  ctx.save(); ctx.globalAlpha *= a;
  if (mapA > 0) {
    ctx.save(); ctx.globalAlpha *= mapA;
    // graticule
    ctx.save(); ctx.strokeStyle = 'rgba(217,178,106,0.10)'; ctx.lineWidth = 1;
    for (let lo = 34; lo <= 61; lo += 3) { const q1 = pr(lo, 12), q2 = pr(lo, 33); ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); }
    for (let la = 12; la <= 33; la += 3) { const q1 = pr(34, la), q2 = pr(61, la); ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); }
    ctx.restore();
    const pts = ARAB.map(p => pr(p[0], p[1]));
    const op = oC(P(T, 19.9, 21.6));
    if (op >= 1) { ctx.save(); ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = 'rgba(217,178,106,0.07)'; ctx.fill(); ctx.restore(); }
    gline(pts, op, 3.5);
    // Gulf label + scanning beam (عن نخلة)
    const gl = P(T, 22.6, 23.2) * (1 - P(T, 24.6, 25.2));
    if (gl > 0) { const q = pr(52.6, 27.6); ctx.save(); ctx.globalAlpha *= gl; ctx.font = `700 54px ${RUQAA}`; ctx.textAlign = 'center'; ctx.fillStyle = C.gold2; ctx.fillText('الخليج', q[0], q[1]); ctx.restore(); }
    const scan = win(T, 21.0, 24.7, 0.4, 0.4);
    if (scan > 0) {
      const sx = 540 + Math.sin((T - 21) * 1.6) * 260, sy = 860 + Math.cos((T - 21) * 1.1) * 150;
      ctx.save(); ctx.globalAlpha *= scan; ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150); g.addColorStop(0, 'rgba(255,210,140,0.35)'); g.addColorStop(1, 'rgba(255,210,140,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - 160, sy - 160, 320, 320); ctx.restore();
      gline(ellipsePts(sx, sy, 90, 90, 0, 40), scan, 2, C.gold2, 10);
    }
    // Kuwait origin
    const kq = pr(KW[0], KW[1]), kp = P(T, 20.6, 21.0);
    if (kp > 0) { ctx.save(); ctx.globalAlpha *= kp; ctx.fillStyle = C.gold2; ctx.shadowColor = C.gold; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(kq[0], kq[1], 10 + 3 * Math.sin(T * 5), 0, 7); ctx.fill(); ctx.restore(); }
    // journey arc Kuwait -> Qassim
    const jp = P(T, 24.7, 25.9);
    const qq = pr(QS[0], QS[1]);
    if (jp > 0) { const arc = quad(kq, [(kq[0] + qq[0]) / 2, Math.min(kq[1], qq[1]) - 160 * zoom], qq, 40); ctx.save(); ctx.setLineDash([12, 12]); gline(arc, oC(jp), 4, C.gold2, 16); ctx.restore(); }
    // Saudi pin + label
    const sp = P(T, 25.6, 26.1);
    if (sp > 0) {
      ctx.save(); ctx.translate(qq[0], qq[1]); const s = oB(sp); ctx.scale(s, s);
      ctx.fillStyle = C.ember; ctx.shadowColor = C.ember; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-12, -20, -30, -34, -30, -56); ctx.arc(0, -56, 30, Math.PI, 0); ctx.bezierCurveTo(30, -34, 12, -20, 0, 0); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#1A0E09'; ctx.beginPath(); ctx.arc(0, -56, 11, 0, 7); ctx.fill(); ctx.restore();
      for (let r = 0; r < 2; r++) { const u = ((T - 25.6) * 0.9 + r * 0.5) % 1; ctx.save(); ctx.globalAlpha *= (1 - u) * sp; ctx.strokeStyle = C.gold2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(qq[0], qq[1], 20 + u * 90, 0, 7); ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.globalAlpha *= sp * (1 - P(T, 26.9, 27.4)); ctx.font = `700 60px ${RUQAA}`; ctx.textAlign = 'center'; ctx.fillStyle = goldGrad(qq[1] - 170, qq[1] - 100); ctx.fillText('السعودية', qq[0], qq[1] - 110); ctx.restore();
    }
    ctx.restore();
  }
  // Buraydah / Qassim farms
  const fp = P(T, 28.6, 29.0);
  if (fp > 0) {
    ctx.save(); ctx.globalAlpha *= fp;
    gline([[90, 1250], [990, 1250]], oC(P(T, 28.6, 29.2)), 2.5);
    [[180, 300, 0.0], [330, 430, 0.12], [540, 560, 0.05], [740, 420, 0.18], [900, 330, 0.25]].forEach(([x, h, d]) => palm(x, 1250, h, P(T, 28.8 + d, 30.0 + d), { sway: T + x }));
    const lp = P(T, 29.3, 29.8);
    ctx.save(); ctx.globalAlpha *= lp; ctx.font = `700 64px ${KUFI}`; ctx.textAlign = 'center'; ctx.fillStyle = C.gold2; ctx.letterSpacing = '4px';
    ctx.fillText('بريدة · القصيم', 540, 520); ctx.restore();
    ornament(540, 570, 420, lp);
    ctx.restore();
  }
  ctx.restore();
}
// 30.9–36.9  biggest festival badge -> harvest
function sFestival(T) {
  const a = win(T, 30.7, 33.4, 0.35, 0.35);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = 540, cy = 880, p = oC(P(T, 30.9, 32.0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 480); g.addColorStop(0, `rgba(255,200,120,${0.25 * p})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 380, W, 1000); ctx.restore();
    gline(starPts(cx, cy, 360, 300, 16, T * 0.1), p, 3);
    star8(cx, cy, 250, p, -T * 0.15, 2.5);
    // laurels
    [[-1], [1]].forEach(([sd]) => { for (let i = 0; i < 9; i++) { const q = P(T, 31.2 + i * 0.06, 31.5 + i * 0.06); if (q <= 0) continue; const an = Math.PI / 2 + sd * (0.35 + i * 0.22); const x = cx + Math.cos(an) * 410 * sd * sd, y = cy + Math.sin(an) * 410; ctx.save(); ctx.translate(cx + sd * Math.abs(x - cx), y); ctx.rotate(-sd * (an - Math.PI / 2) + sd * 0.6); ctx.globalAlpha *= q; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(0, 0, 13, 32, 0, 0, 7); ctx.fill(); ctx.restore(); } });
    const tp = P(T, 31.3, 31.9);
    ctx.save(); ctx.globalAlpha *= tp; const dg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260); dg.addColorStop(0, 'rgba(20,10,6,0.95)'); dg.addColorStop(0.8, 'rgba(20,10,6,0.85)'); dg.addColorStop(1, 'rgba(20,10,6,0)'); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, cy, 260, 0, 7); ctx.fill(); ctx.textAlign = 'center';
    ctx.font = `700 92px ${KUFI}`; ctx.fillStyle = goldGrad(cy - 90, cy); ctx.shadowColor = 'rgba(240,190,100,0.5)'; ctx.shadowBlur = 24; ctx.fillText('أكبر مهرجان', cx, cy - 10);
    ctx.font = `600 50px ${KUFI}`; ctx.fillStyle = C.cream; ctx.shadowBlur = 0; ctx.fillText('سنوي في العالم', cx, cy + 70);
    ctx.restore();
    ctx.restore();
  }
  const b = win(T, 33.1, 37.1, 0.4, 0.4);
  if (b > 0) {
    ctx.save(); ctx.globalAlpha *= b;
    // sun behind
    const sg = ctx.createRadialGradient(400, 560, 0, 400, 560, 420); sg.addColorStop(0, 'rgba(255,190,100,0.45)'); sg.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 100, W, 1000);
    gline([[90, 1290], [990, 1290]], oC(P(T, 33.2, 33.8)), 2.5);
    const top = palm(400, 1290, 820, P(T, 33.2, 34.4), { dates: P(T, 34.2, 35.4), sway: T });
    // basket
    const bp = P(T, 34.6, 35.1);
    if (bp > 0) {
      ctx.save(); ctx.globalAlpha *= bp; const bx = 790, byy = 1290;
      ctx.fillStyle = '#3B2214'; ctx.beginPath(); ctx.moveTo(bx - 130, byy - 150); ctx.lineTo(bx + 130, byy - 150); ctx.lineTo(bx + 100, byy); ctx.lineTo(bx - 100, byy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(240,200,120,0.6)'; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineWidth = 2; for (let k = 1; k < 5; k++) { const yy = byy - 150 + k * 30; const ww = lerp(130, 100, k / 5); ctx.beginPath(); ctx.moveTo(bx - ww, yy); ctx.lineTo(bx + ww, yy); ctx.stroke(); }
      // falling dates into basket
      for (let i = 0; i < 9; i++) {
        const t0 = 34.9 + i * 0.18, u = P(T, t0, t0 + 0.55);
        if (u <= 0) continue;
        const sx = top[0] + 40 + (i % 3) * 20, sy = top[1] + 120;
        const ex = bx - 70 + (i * 37) % 140, ey = byy - 160 - Math.floor(i / 3) * 14;
        const x = lerp(sx, ex, u), y = lerp(sy, ey, u * u) - Math.sin(Math.PI * u) * 120;
        dateFruit(x, y, 24, u * 5 + i);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
// 37.2–43.5  transport crates, then sorting by size / type / quality
function sSort(T) {
  const a = win(T, 37.0, 39.85, 0.3, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha *= a;
    gline([[60, 1150], [1020, 1150]], oC(P(T, 37.1, 37.6)), 3);
    for (let k = 0; k < 40; k++) { const x = ((k * 40 - T * 240) % 1080 + 1080) % 1080; ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, 1172, 7, 0, 7); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < 6; i++) {
      const t0 = 37.5 + i * 0.28, u = T - t0;
      if (u < 0) continue;
      const x = 1100 - u * 420;
      if (x < -260) continue;
      crate(x, 1150 - 150, 220, 150, clamp(u * 3));
      ctx.save(); ctx.globalAlpha *= 0.35 * clamp(u * 3); ctx.fillStyle = C.gold; for (let s = 0; s < 3; s++) ctx.fillRect(x + 240 + s * 30, 1040 + s * 30, 60 - s * 12, 3); ctx.restore();
    }
    ctx.restore();
  }
  const b = win(T, 39.7, 43.5, 0.3, 0.45);
  if (b > 0) {
    ctx.save(); ctx.globalAlpha *= b;
    const fx = 540, fy = 520, p = oC(P(T, 39.75, 40.4));
    gline([[fx - 230, fy - 60], [fx - 50, fy + 110], [fx - 50, fy + 180]], p, 4);
    gline([[fx + 230, fy - 60], [fx + 50, fy + 110], [fx + 50, fy + 180]], p, 4);
    const lanes = [[240, 'الحجم', 41.25], [540, 'النوع', 41.75], [840, 'الجودة', 42.3]];
    lanes.forEach(([lx, label, tl], i) => {
      const lp = P(T, 40.3, 40.9);
      const path = quad([fx, fy + 190], [lx, fy + 300], [lx, 1180], 30);
      gline(path, lp, 2.5, 'rgba(217,178,106,0.6)', 6);
      const on = P(T, tl, tl + 0.35);
      // bin
      ctx.save(); ctx.globalAlpha *= lp;
      ctx.fillStyle = on > 0 ? `rgba(217,178,106,${0.18 * on})` : 'rgba(0,0,0,0)';
      ctx.fillRect(lx - 110, 1180, 220, 130); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(240,200,120,0.7)'; ctx.shadowBlur = on * 25; ctx.strokeRect(lx - 110, 1180, 220, 130); ctx.restore();
      ctx.save(); ctx.globalAlpha *= lp * (0.45 + 0.55 * on); ctx.font = `700 60px ${KUFI}`; ctx.textAlign = 'center'; ctx.fillStyle = on > 0 ? goldGrad(1230, 1280) : C.cream; ctx.fillText(label, lx, 1268); ctx.restore();
      // flowing dates down each lane
      for (let k = 0; k < 6; k++) {
        const u = ((T - 40.4) * 0.8 + k / 6 + i * 0.11) % 1;
        if (T < 40.4) continue;
        const q = path[Math.floor(u * 30)];
        dateFruit(q[0], q[1], [16, 22, 28][(k + i) % 3] * (i === 0 ? (0.7 + (k % 3) * 0.25) : 1), u * 3 + k, 0.95);
      }
    });
    // dates pouring into funnel
    for (let k = 0; k < 8; k++) { const u = ((T - 39.8) * 1.2 + k / 8) % 1; if (T < 39.8) break; dateFruit(fx + Math.sin(k * 3.1) * 120 * (1 - u), fy - 260 + u * 380, 20, k + u * 4, 1 - P(u, 0.85, 1)); }
    ctx.restore();
  }
}
// 43.6–47.2  dawn breaks, getting ready for the auction (sun becomes a clock)
function sDawn(T) {
  const a = win(T, 43.4, 47.25, 0.3, 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const hy = 1150, rise = oC(P(T, 43.6, 45.0));
  const sy = lerp(hy + 160, hy - 260, rise);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hy); ctx.clip();
  ctx.save(); ctx.translate(540, sy); ctx.rotate(T * 0.15); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.fillStyle = `rgba(255,200,120,${0.07 * rise})`; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(60, -1100); ctx.lineTo(-60, -1100); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const sg = ctx.createRadialGradient(540, sy, 40, 540, sy, 300); sg.addColorStop(0, 'rgba(255,230,170,1)'); sg.addColorStop(0.5, 'rgba(255,170,80,0.85)'); sg.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(540, sy, 300, 0, 7); ctx.fill();
  ctx.fillStyle = '#FFE7B5'; ctx.beginPath(); ctx.arc(540, sy, 150, 0, 7); ctx.fill();
  // clock face on the sun (المزاد)
  const ck = P(T, 45.0, 45.6);
  if (ck > 0) {
    ctx.save(); ctx.globalAlpha *= ck; ctx.strokeStyle = '#6A3A18'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const an = k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(540 + Math.cos(an) * 118, sy + Math.sin(an) * 118); ctx.lineTo(540 + Math.cos(an) * (k % 3 ? 132 : 140), sy + Math.sin(an) * (k % 3 ? 132 : 140)); ctx.stroke(); }
    const hand = lerp(-Math.PI * 0.9, -Math.PI / 2, ioC(P(T, 45.3, 46.6)));
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(540, sy); ctx.lineTo(540 + Math.cos(hand) * 100, sy + Math.sin(hand) * 100); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(540, sy); ctx.lineTo(540 + Math.cos(hand * 0.3 - 1) * 70, sy + Math.sin(hand * 0.3 - 1) * 70); ctx.stroke();
    ctx.fillStyle = '#6A3A18'; ctx.beginPath(); ctx.arc(540, sy, 12, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // dunes
  const d1 = [], d2 = [];
  for (let x = 0; x <= W; x += 20) { d1.push([x, hy - 40 * Math.sin(x / 260 + 0.6) - 30]); d2.push([x, hy + 60 - 50 * Math.sin(x / 190 + 2.2)]); }
  ctx.save(); ctx.beginPath(); d1.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#1C0F09'; ctx.fill(); ctx.restore();
  gline(d1, oC(P(T, 43.6, 44.4)), 3);
  ctx.save(); ctx.beginPath(); d2.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#140A06'; ctx.fill(); ctx.restore();
  gline(d2, oC(P(T, 43.8, 44.6)), 2);
  palm(170, hy - 30, 300, P(T, 44.0, 45.0), { sway: T });
  palm(900, hy + 20, 380, P(T, 44.2, 45.2), { sway: T + 2 });
  ctx.restore();
}
// 47.3–52.75  heart of the auction: paddles, fierce competition, the elite pick
const PAD = [[200, 620, '12'], [540, 560, '27'], [880, 640, '45'], [300, 900, '08'], [760, 880, '33'], [180, 1170, '61'], [540, 1120, '19'], [890, 1160, '74'], [420, 690, '52']];
function sAuction(T) {
  const a = win(T, 47.1, 52.8, 0.3, 0.2);
  if (a <= 0) return;
  const fierce = P(T, 48.4, 49.0) * (1 - P(T, 50.2, 50.5));
  const sh = fierce * 7 * Math.sin(T * 63);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(sh, sh * 0.6);
  // pulsing center glow (قلب الحدث)
  const hb = 0.5 + 0.5 * Math.pow(Math.abs(Math.sin((T - 47.3) * 3.4)), 6);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 900, 0, 540, 900, 600); g.addColorStop(0, `rgba(255,150,60,${0.22 * hb})`); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1200); ctx.restore();
  const elite = P(T, 50.45, 50.9);
  PAD.forEach(([x, y, n], i) => {
    const t0 = i < 2 ? 47.4 + i * 0.3 : 48.45 + (i - 2) * 0.2;
    const p = P(T, t0, t0 + 0.3);
    if (p <= 0) return;
    const bob = Math.sin(T * 9 + i * 1.7) * 14 * fierce, rot = Math.sin(T * 5 + i) * 0.12 * (0.3 + fierce);
    ctx.save(); ctx.globalAlpha *= 1 - elite * 0.85; ctx.translate(x, y + bob + (1 - oB(p)) * 140); ctx.rotate(rot); ctx.scale(oB(p), oB(p));
    ctx.fillStyle = C.gold; ctx.fillRect(-10, 40, 20, 150);
    ctx.fillStyle = '#2B170E'; ctx.beginPath(); ctx.ellipse(0, -30, 92, 92, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(240,200,120,0.7)'; ctx.shadowBlur = 14; ctx.stroke();
    ctx.shadowBlur = 0; ctx.font = `700 78px ${KUFI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.cream; ctx.fillText(n, 0, -26);
    ctx.restore();
  });
  // rising bid counter
  const cp = P(T, 48.4, 48.7) * (1 - elite);
  if (cp > 0) {
    const v = Math.floor(lerp(1000, 48750, ioC(P(T, 48.4, 50.3))) / 50) * 50;
    ctx.save(); ctx.globalAlpha *= cp; ctx.font = `700 120px ${KUFI}`; ctx.textAlign = 'center'; ctx.fillStyle = goldGrad(300, 420); ctx.shadowColor = 'rgba(255,170,80,0.6)'; ctx.shadowBlur = 30;
    ctx.fillText(v.toLocaleString('en-US'), 540, 420); ctx.restore();
  }
  // spotlight on the elite crate
  if (elite > 0) {
    ctx.save(); ctx.globalAlpha *= elite;
    ctx.fillStyle = 'rgba(8,4,2,0.55)'; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalCompositeOperation = 'lighter';
    const cg = ctx.createLinearGradient(0, 200, 0, 1150); cg.addColorStop(0, 'rgba(255,220,150,0.0)'); cg.addColorStop(1, 'rgba(255,220,150,0.28)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(480, 200); ctx.lineTo(600, 200); ctx.lineTo(820, 1150); ctx.lineTo(260, 1150); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const cs = oB(P(T, 50.6, 51.1));
    ctx.save(); ctx.translate(540, 1080); ctx.scale(cs, cs); crate(-190, -170, 380, 200, 1, '#5A3418'); ctx.restore();
    ctx.save(); ctx.globalAlpha *= P(T, 51.0, 51.4); ctx.font = `700 120px ${RUQAA}`; ctx.textAlign = 'center'; ctx.fillStyle = goldGrad(560, 700); ctx.shadowColor = 'rgba(240,190,100,0.7)'; ctx.shadowBlur = 34; ctx.fillText('نخبة', 540, 690); ctx.restore();
    for (let k = 0; k < 6; k++) { const an = T * 1.5 + k; const r = 260 + Math.sin(T * 3 + k) * 20; ctx.save(); ctx.globalAlpha *= 0.8 * Math.abs(Math.sin(T * 4 + k)); ctx.fillStyle = '#FFF0C8'; ctx.translate(540 + Math.cos(an) * r, 980 + Math.sin(an) * r * 0.5); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
    ctx.restore();
  }
  ctx.restore();
}
// 52.7–54.6  the hammer falls: "فواخر!"
function rrHead() {
  ctx.fillRect(-70, -95, 140, 190); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(240,200,120,0.7)'; ctx.shadowBlur = 16; ctx.strokeRect(-70, -95, 140, 190);
  ctx.shadowBlur = 0; ctx.fillStyle = C.gold; ctx.fillRect(-70, -62, 140, 12); ctx.fillRect(-70, 50, 140, 12);
}
function sGavel(T) {
  const a = win(T, 52.6, 54.75, 0.15, 0.3);
  if (a <= 0) return;
  const hits = [53.05, 53.65];
  let ang = -1.0;
  if (T < hits[0]) ang = lerp(-0.2, -1.0, ioC(P(T, 52.6, 52.85))) + (-0 - -1.0) * iC(P(T, 52.85, hits[0]));
  else if (T < hits[1]) { const u = P(T, hits[0], hits[0] + 0.25), v = P(T, hits[0] + 0.25, hits[1]); ang = u < 1 ? lerp(0, -0.7, oC(u)) : lerp(-0.7, 0, iC(v)); }
  else ang = lerp(0, -0.15, oC(P(T, hits[1], hits[1] + 0.3)));
  const imp = Math.max(...hits.map(h => (T >= h ? Math.exp(-(T - h) * 9) : 0)));
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(Math.sin(T * 80) * 12 * imp, 0);
  // sound block
  ctx.fillStyle = '#2B170E'; ctx.fillRect(400, 1160, 340, 80); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(240,200,120,0.6)'; ctx.shadowBlur = 12; ctx.strokeRect(400, 1160, 340, 80); ctx.shadowBlur = 0;
  ctx.fillStyle = '#1E1009'; ctx.fillRect(380, 1240, 380, 26); ctx.strokeRect(380, 1240, 380, 26);
  // gavel (pivot at handle end; positive angle = raised)
  ctx.save(); ctx.translate(920, 1065); ctx.rotate(-ang);
  ctx.fillStyle = '#4A2814'; ctx.fillRect(-350, -16, 350, 32); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(-350, -16, 350, 32);
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(-350, 0); ctx.fillStyle = '#5A3218'; rrHead(); ctx.restore();
  ctx.restore();
  // impact
  hits.forEach(h => {
    const u = P(T, h, h + 0.6);
    if (u <= 0 || u >= 1) return;
    ctx.save(); ctx.strokeStyle = C.gold2; ctx.lineWidth = 6 * (1 - u) + 1; ctx.globalAlpha *= 1 - u;
    ctx.beginPath(); ctx.ellipse(570, 1165, 60 + u * 520, 20 + u * 160, 0, 0, 7); ctx.stroke();
    for (let k = 0; k < 10; k++) { const an = Math.PI + k * Math.PI / 9; ctx.beginPath(); ctx.moveTo(570 + Math.cos(an) * (110 + u * 200), 1150 + Math.sin(an) * (60 + u * 140)); ctx.lineTo(570 + Math.cos(an) * (150 + u * 260), 1150 + Math.sin(an) * (80 + u * 180)); ctx.stroke(); }
    ctx.restore();
  });
  if (imp > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,160,${0.35 * imp})`; ctx.fillRect(-30, 0, W + 60, H); ctx.restore(); }
  // the name is called
  const np = P(T, hits[1], hits[1] + 0.25);
  if (np > 0) {
    ctx.save(); ctx.translate(540, 760); const s = lerp(1.8, 1, oE(np)); ctx.scale(s, s); ctx.globalAlpha *= clamp(np * 3);
    ctx.font = `700 250px ${RUQAA}`; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = goldGrad(-200, 40); ctx.shadowColor = 'rgba(255,190,100,0.8)'; ctx.shadowBlur = 50;
    ctx.fillText('فواخر!', 0, 0); ctx.restore();
  }
  ctx.restore();
}
// 54.5–58.7  passion + blessing: light from above, a palm emerges
function sBlessing(T) {
  const a = win(T, 54.4, 58.95, 0.4, 0.35);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const lp = oC(P(T, 55.8, 57.5));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x = 540 + (i - 3) * 120 + Math.sin(T * 0.6 + i) * 20, w = 60 + (i % 3) * 40;
    const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, `rgba(255,230,170,${0.22 * lp})`); g.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w * 0.3, 0); ctx.lineTo(x + w * 0.3, 0); ctx.lineTo(x + w * 1.6, 1400); ctx.lineTo(x - w * 1.6, 1400); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // ember of passion rising into the light
  const ep = P(T, 54.5, 55.8);
  const ey = lerp(1250, 1000, oC(ep));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const eg = ctx.createRadialGradient(540, ey, 0, 540, ey, 160); eg.addColorStop(0, `rgba(255,190,90,${0.7 * ep * (1 - lp * 0.6)})`); eg.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = eg; ctx.fillRect(340, ey - 200, 400, 400); ctx.restore();
  gline([[200, 1290], [880, 1290]], oC(P(T, 55.0, 55.8)), 2.5);
  palm(540, 1290, 760, P(T, 55.4, 57.8), { fill: '#120A06', sway: T * 0.8, dates: P(T, 57.4, 58.4) });
  ctx.restore();
}
// 58.7–68.4  logo reveal + "story of success ... forever"
function sLogo(T) {
  const a = P(T, 58.6, 59.0);
  if (a <= 0) return;
  const mv = ioC(P(T, 61.6, 62.4));
  const cy = lerp(880, 700, mv), sc = lerp(1, 0.86, mv);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.translate(540, cy); ctx.scale(sc, sc); ctx.translate(-540, -cy);
  const glow = ctx.createRadialGradient(540, cy, 0, 540, cy, 560); glow.addColorStop(0, 'rgba(255,200,120,0.22)'); glow.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, cy - 600, W, 1200);
  star8(540, cy, 380, oC(P(T, 58.7, 59.8)), T * 0.05, 3);
  gline(ellipsePts(540, cy, 420, 420, T * 0.05, 120), oC(P(T, 58.9, 60.0)), 1.4);
  calli('فواخر', 540, cy + 70, 250, P(T, 59.0, 60.1), RUQAA, { glow: 40 });
  const tg = P(T, 59.9, 60.5);
  ctx.save(); ctx.globalAlpha *= tg; ctx.font = `600 58px ${KUFI}`; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.letterSpacing = `${lerp(30, 6, oE(tg))}px`;
  ctx.fillStyle = C.cream; ctx.fillText('منزل جودة التمور', 540, cy + 200); ctx.restore();
  // shine
  const sw = P(T, 60.5, 61.4);
  if (sw > 0 && sw < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sx = lerp(220, 860, ioC(sw)); ctx.globalAlpha *= Math.sin(Math.PI * sw);
    const g = ctx.createRadialGradient(sx, cy + 10, 0, sx, cy + 10, 170);
    g.addColorStop(0, 'rgba(255,240,200,0.35)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 180, cy - 170, 360, 360); ctx.restore();
  }
  ctx.restore();
  // timeline: years past (right) -> forever (left)
  const tl = P(T, 62.0, 62.5);
  if (tl > 0) {
    const y = 1230, x0 = 960, x1 = lerp(x0, 120, oC(P(T, 62.1, 64.8))), x2 = lerp(120, -40, oC(P(T, 65.2, 66.4)));
    const end = T < 65.2 ? x1 : x2;
    const inf0 = P(T, 66.3, 66.6);
    if (inf0 <= 0 || end > 720) gline([[x0, y], [end, y]], 1, 3.5, C.gold, 16);
    else { gline([[x0, y], [720, y]], 1, 3.5, C.gold, 16); if (end < 360) gline([[360, y], [end, y]], 1, 3.5, C.gold, 16); gline([[720, y], [360, y]], 1 - inf0, 3.5, C.gold, 16); }
    for (let k = 0; k < 5; k++) {
      const x = lerp(900, 260, k / 4), q = P(T, 62.4 + k * 0.45, 62.7 + k * 0.45);
      if (q <= 0) continue;
      ctx.save(); ctx.globalAlpha *= q; ctx.fillStyle = k < 2 ? C.goldD : C.gold2; ctx.shadowColor = C.gold; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(x, y, 11 * oB(q), 0, 7); ctx.fill(); ctx.restore();
    }
    // forever: infinity sign
    const inf = P(T, 66.3, 67.0);
    if (inf > 0) {
      const ip = []; for (let i = 0; i <= 80; i++) { const t = i / 80 * Math.PI * 2; const d = 1 + Math.sin(t) ** 2; ip.push([540 + 150 * Math.cos(t) / d, y - 6 + 150 * Math.sin(t) * Math.cos(t) / d]); }
      gline(ip, oC(inf), 7, C.gold2, 26);
    }
    // handle
    const hd = P(T, 66.8, 67.3);
    ctx.save(); ctx.globalAlpha *= hd * 0.85; ctx.font = `700 40px ${NASKH}`; ctx.textAlign = 'center'; ctx.fillStyle = C.gold2; ctx.fillText('@fawakher.kw', 540, 1800); ctx.restore();
  }
}

// ================= timeline =================
function render(T) {
  const f = Math.round(T * 30);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.letterSpacing = '0px'; ctx.shadowBlur = 0; ctx.setLineDash([]);
  const warm = win(T, 43.6, 47.3, 1.2, 0.5) * 0.9 + win(T, 54.5, 59, 1.0, 0.5) * 0.35;
  background(T, warm);
  const scenes = [sHook, sOnce, sCare, sFlame, sCompass, sMap, sFestival, sSort, sDawn, sAuction, sGavel, sBlessing, sLogo];
  scenes.forEach(s => { ctx.save(); s(T); ctx.restore(); });
  captions(T);
  doors(T, 5.35);
  frame(T);
  finish(f);
  const fi = 1 - P(T, 0, 0.5), fo = P(T, DUR - 0.6, DUR);
  if (fi > 0 || fo > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
Promise.all([
  document.fonts.load(`700 40px ${NASKH}`, 'عربي'), document.fonts.load(`700 40px ${RUQAA}`, 'عربي'),
  document.fonts.load(`700 40px ${KUFI}`, 'عربي'), document.fonts.load(`600 40px ${KUFI}`, 'عربي'),
]).then(() => { render(0); window.ready = true; });
