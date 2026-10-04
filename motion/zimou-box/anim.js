// ZIMOU Express — "La boîte ZIMOU": neo-brutalist editorial restyle. render(t) is deterministic.
const W = 1080, H = 1920, DUR = 41.5667;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const PAPER = '#F3ECDF', INK = '#151515', RED = '#E3212D', CREAM = '#FFF8EC', YEL = '#F5C431', PINK = '#F06AA5';
const KR = { top: '#E6BC80', left: '#D19D5E', right: '#B98446', in: '#5B3B1C' };
const TAPES = ['#2F5BD3', '#F5C431', '#1E9E6A', '#F07A22', '#8E44C9', '#18A7C9', '#7A7A7A']; // the 7 partners, abstract
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
const spring = (u, z = 6, w = 13) => (u <= 0 ? 0 : 1 - Math.exp(-z * u) * Math.cos(w * u)); // 0 -> 1 with wobble
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
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function brut(x, y, w, h, r, fill, o = {}) { // hard offset shadow + ink outline
  const sh = o.sh ?? 12, lw = o.lw ?? 5;
  ctx.save();
  rrect(x + sh, y + sh, w, h, r); ctx.fillStyle = INK; ctx.fill();
  rrect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
function poly(pts, fill, stroke = true) {
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) ctx.stroke();
}
function circle(x, y, r, fill, lw = 5, sh = 0) {
  if (sh) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + sh, y + sh, r, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
}
const BARC = ['#F45D66', '#E3212D', '#B10F1B'];
function zIcon(x, y, s, a = 1, mono) {
  const bw = s * 0.2, gap = s * 0.11, sk = s * 0.42;
  for (let i = 0; i < 3; i++) {
    const pp = clamp(a * 3 - i); if (pp <= 0) continue;
    const ox = x + (i - 1) * (bw + gap);
    ctx.save(); ctx.globalAlpha *= pp; ctx.fillStyle = mono || BARC[i];
    ctx.beginPath();
    ctx.moveTo(ox - bw / 2 + sk / 2, y - s / 2); ctx.lineTo(ox + bw / 2 + sk / 2, y - s / 2);
    ctx.lineTo(ox + bw / 2 - sk / 2, y + s / 2); ctx.lineTo(ox - bw / 2 - sk / 2, y + s / 2);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function checkMark(x, y, s, p, col = CREAM, w = 0.16) {
  if (p <= 0) return;
  const pts = [[-0.32, 0.02], [-0.08, 0.26], [0.36, -0.22]];
  const l1 = Math.hypot(0.24, 0.24), l2 = Math.hypot(0.44, 0.48), L = (l1 + l2) * p;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (L <= l1) { const k = L / l1; ctx.lineTo(x + lerp(pts[0][0], pts[1][0], k) * s, y + lerp(pts[0][1], pts[1][1], k) * s); }
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const k = (L - l1) / l2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], k) * s, y + lerp(pts[1][1], pts[2][1], k) * s); }
  ctx.stroke(); ctx.restore();
}
function pinShape(x, y, s, fill) { // tip at (x,y)
  const r = s * 0.42;
  ctx.save(); ctx.lineWidth = Math.max(3, s * 0.06); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - r * 0.35, y - s * 0.35, x - r, y - s * 0.55, x - r, y - s * 0.78);
  ctx.arc(x, y - s * 0.78, r, Math.PI, 0);
  ctx.bezierCurveTo(x + r, y - s * 0.55, x + r * 0.35, y - s * 0.35, x, y);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  circle(x, y - s * 0.78, r * 0.38, CREAM, Math.max(2, s * 0.04));
  ctx.restore();
}
// isometric cardboard box; (cx, cy) = centre of the base footprint
function isoBox(cx, cy, s, o = {}) {
  const sz = o.sz ?? 1, sxy = o.sxy ?? 1 / Math.sqrt(sz);
  const p = (x, y, z) => [cx + ((x - 0.5) - (y - 0.5)) * s * 0.866 * sxy, cy + ((x - 0.5) + (y - 0.5)) * s * 0.5 * sxy - z * s * sz];
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, s * 0.03); ctx.strokeStyle = INK;
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  poly([p(0, 0, 0), p(1, 0, 0), p(1, 1, 0), p(0, 1, 0)].map(q => [q[0] + s * 0.14, q[1] + s * 0.03]), INK, false);
  poly([p(0, 1, 0), p(1, 1, 0), p(1, 1, 1), p(0, 1, 1)], KR.left);
  poly([p(1, 0, 0), p(1, 1, 0), p(1, 1, 1), p(1, 0, 1)], KR.right);
  if (o.open) {
    poly([p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)], KR.in);
  } else {
    poly([p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)], KR.top);
    const tp = o.tapeP ?? 1;
    if (o.tape !== false && tp > 0) {
      const tc = o.tape || RED;
      poly([p(0, 0.42, 1), p(tp, 0.42, 1), p(tp, 0.58, 1), p(0, 0.58, 1)], tc);
      if (tp >= 1) poly([p(1, 0.42, 1), p(1, 0.58, 1), p(1, 0.58, 0.6), p(1, 0.42, 0.6)], tc);
    }
  }
  if (o.logo) {
    const f = (u, v) => p(u, 1, v);
    for (let i = 0; i < 3; i++) {
      const uc = 0.5 + (i - 1) * 0.13;
      ctx.fillStyle = BARC[i];
      ctx.beginPath();
      [[uc - 0.045 + 0.05, 0.7], [uc + 0.045 + 0.05, 0.7], [uc + 0.045 - 0.05, 0.3], [uc - 0.045 - 0.05, 0.3]].forEach((q, k) => { const r = f(q[0], q[1]); k ? ctx.lineTo(r[0], r[1]) : ctx.moveTo(r[0], r[1]); });
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
  return p;
}
// drop with bounce: returns {dy, sz} or null before t0
function drop(T, t0, h) {
  if (T < t0) return null;
  const ft = 0.32, u = (T - t0) / ft;
  if (u < 1) return { dy: -(1 - u * u) * h, sz: 1.1 };
  const b = T - t0 - ft;
  return { dy: -Math.abs(Math.sin(b * 13)) * h * 0.06 * Math.exp(-b * 8), sz: 1 - 0.25 * Math.exp(-b * 11) * Math.cos(b * 26) };
}
function person(x, gy, s, body = RED) { // feet at gy
  ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = INK;
  brut(x - s * 0.42, gy - s * 1.25, s * 0.84, s * 1.25, s * 0.38, body, { sh: 8 });
  circle(x, gy - s * 1.62, s * 0.36, CREAM, 5, 8);
  ctx.restore();
}
function building(x, gy, w, h, fill, k = 1) { // grows with k
  const hh = h * k; if (hh <= 1) return;
  ctx.save();
  ctx.fillStyle = INK; ctx.fillRect(x + 10, gy - hh + 10, w, hh - 10);
  ctx.fillStyle = fill; ctx.fillRect(x, gy - hh, w, hh);
  ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x, gy - hh, w, hh);
  const wc = fill === INK ? CREAM : INK;
  ctx.fillStyle = wc; ctx.globalAlpha *= 0.85;
  const cols = Math.max(1, Math.floor((w - 16) / 26));
  for (let yy = gy - hh + 18; yy < gy - 30; yy += 34) for (let c = 0; c < cols; c++) ctx.fillRect(x + 12 + c * 26, yy, 13, 17);
  ctx.restore();
}

// ---------- typography ----------
const isLat = s => !/[؀-ۿ]/.test(s);
const fontFor = (s, size, wt) => (isLat(s) ? `${wt || 900} ${Math.round(size * 0.9)}px ${LA}` : `${wt || 900} ${size}px ${AR}`);
// list: [[text, at, style]] style: undefined | 'red' | 'hl' (cream on red block) ; reading order, laid out RTL
function words(T, list, cx, y, size, o = {}) {
  const sp = size * 0.24, pad = size * 0.2;
  const ws = list.map(([s, , st]) => { ctx.font = fontFor(s, size, o.weight); return ctx.measureText(s).width + (st === 'hl' ? pad * 2 : 0); });
  const total = ws.reduce((a, b) => a + b, 0) + sp * (list.length - 1);
  if (total > 930 && !o.fitted) return words(T, list, cx, y, Math.floor(size * 930 / total), { ...o, fitted: true });
  let x = cx + total / 2;
  list.forEach(([s, at, st], i) => {
    const w = ws[i];
    if (st === 'hl') {
      const bp = oE(P(T, at - 0.08, at + 0.3));
      if (bp > 0) {
        const top = y - size * 0.95, hh = size * 1.32;
        ctx.save(); ctx.fillStyle = INK; ctx.fillRect(x - w * bp + 9, top + 9, w * bp, hh);
        ctx.fillStyle = RED; ctx.fillRect(x - w * bp, top, w * bp, hh);
        ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x - w * bp, top, w * bp, hh); ctx.restore();
      }
    }
    const a = P(T, at, at + 0.42);
    if (a > 0) {
      ctx.save();
      ctx.translate(x - w / 2, y - size * 0.3);
      const sc = lerp(1.45, 1, oB(a)); ctx.scale(sc, sc); ctx.rotate((1 - oE(a)) * -0.1);
      ctx.globalAlpha *= clamp(a * 3);
      ctx.font = fontFor(s, size, o.weight); ctx.direction = isLat(s) ? 'ltr' : 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = st === 'hl' ? CREAM : st === 'red' ? RED : (o.color || INK);
      ctx.fillText(s, 0, size * 0.3);
      ctx.restore();
    }
    x -= w + sp;
  });
}
function latin(T, text, cx, y, size, t0, step, o = {}) {
  ctx.save(); ctx.font = `900 ${size}px ${LA}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ws = [...text].map(ch => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  [...text].forEach((ch, i) => {
    const a = P(T, t0 + i * step, t0 + i * step + 0.42);
    if (a > 0) {
      ctx.save(); ctx.translate(x + ws[i] / 2, y - size * 0.35);
      const sc = lerp(1.6, 1, oB(a)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(a * 3);
      ctx.textAlign = 'center';
      ctx.fillStyle = o.shadow || RED; ctx.fillText(ch, 9, size * 0.35 + 9);
      ctx.fillStyle = o.color || INK; ctx.fillText(ch, 0, size * 0.35);
      ctx.restore();
    }
    x += ws[i];
  });
  ctx.restore();
}
function pill(x, y, text, size, p, o = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.font = fontFor(text, size, o.weight || 800); ctx.direction = isLat(text) ? 'ltr' : 'rtl';
  const tw = ctx.measureText(text).width, padX = size * 0.7, h = size * 1.7;
  const w = tw + padX * 2 + (o.check ? size * 1.2 : 0);
  ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const sc = oB(clamp(p * 1.3)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(p * 4);
  brut(-w / 2, -h / 2, w, h, o.square ? 10 : h / 2, o.bg || RED, { sh: 9, lw: 4 });
  ctx.fillStyle = o.color || CREAM; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, o.check ? -size * 0.6 : 0, size * 0.06);
  if (o.check) checkMark(w / 2 - padX - size * 0.3, 0, size * 1.05, 1, o.color || CREAM, 0.17);
  ctx.restore();
}

// ---------- logo (light version, as on the brand) ----------
function logoLight(cx, cy, sc) {
  const iconH = 150 * sc;
  ctx.save();
  ctx.font = `600 ${150 * sc}px ${LA}`; ctx.letterSpacing = `${6 * sc}px`;
  const zw = ctx.measureText('ZIMOU').width, iconW = iconH * 1.05, gap = 26 * sc;
  const left = cx - (iconW + gap + zw) / 2, zx = left + iconW + gap;
  zIcon(left + iconW / 2, cy, iconH, 1);
  ctx.fillStyle = '#2A2A2A'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('ZIMOU', zx, cy + 30 * sc);
  ctx.font = `600 ${56 * sc}px ${LA}`; ctx.letterSpacing = '0px';
  const ew0 = ctx.measureText('Express').width; ctx.letterSpacing = `${(zw - 6 * sc - ew0) / 7}px`;
  ctx.fillStyle = RED; ctx.fillText('Express', zx + 4 * sc, cy + 76 * sc);
  const ux = zx + zw + 14 * sc, uy = cy - 78 * sc;
  ctx.translate(ux, uy); ctx.scale(0.95 * sc, 0.95 * sc);
  ctx.strokeStyle = PINK; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, 46); ctx.bezierCurveTo(10, 10, 20, -32, 0, -32); ctx.bezierCurveTo(-20, -32, -10, 10, 18, 46); ctx.stroke();
  ctx.restore();
}

// ---------- paper, chrome ----------
const grains = [0, 1, 2].map(k => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640;
  const g = c.getContext('2d'); const id = g.createImageData(360, 640); const r = rng(300 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = 120 + r() * 135; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});
function paper() {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(21,21,21,0.09)';
  for (let y = 150; y < H - 120; y += 44) for (let x = 64; x < W - 40; x += 44) { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
}
function chrome(T, idx) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + dy * 44); ctx.lineTo(x, y); ctx.lineTo(x + dx * 44, y); ctx.stroke();
  });
  ctx.font = `800 22px ${LA}`; ctx.letterSpacing = '5px'; ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText('ZIMOU EXPRESS', 72, 96);
  ctx.textAlign = 'right'; ctx.fillText(String(idx).padStart(2, '0') + ' / 10', W - 72, 96);
  ctx.textAlign = 'left'; ctx.fillText('+800 BUREAUX · DZ', 72, H - 74);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(21,21,21,0.18)'; ctx.fillRect(470, H - 84, 470, 6);
  ctx.fillStyle = INK; ctx.fillRect(470, H - 84, 470 * clamp(T / DUR), 6);
  ctx.restore();
}
function grain(f) {
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(grains[f % 3], 0, 0, W, H); ctx.restore();
}

// ================= SCENES (content only; paper is global) =================
// 01 · 0–5.5  "Imagine 7 شركات توصيل، من مكان واحد." — 7 boxes -> 1 tower -> 1 ZIMOU box
const pile = [[250, 1450, 135], [470, 1530, 120], [720, 1460, 140], [880, 1600, 118], [330, 1660, 126], [620, 1690, 130], [830, 1330, 112]];
const towerS = 92;
function s1(T) {
  // giant numeral 7 -> 1 behind
  const np = P(T, 2.9, 3.4);
  if (np > 0) {
    const flip = P(T, 4.0, 4.45), ch = flip < 0.5 ? '7' : '1', sx = Math.abs(Math.cos(flip * Math.PI));
    ctx.save(); ctx.translate(540, 1420); ctx.scale(sx * oB(np), oB(np));
    ctx.font = `900 1050px ${LA}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(227,33,45,0.35)'; ctx.setLineDash([22, 16]); ctx.strokeText(ch, 0, 40);
    ctx.restore();
  }
  latin(T, 'Imagine', 540, 420, 172, 0.3, 0.05);
  words(T, [['7', 3.0, 'hl'], ['شركات', 3.15], ['توصيل،', 3.5]], 540, 600, 92);
  words(T, [['من', 4.0], ['مكان', 4.2], ['واحد.', 4.5, 'hl']], 540, 735, 92);
  const merge = P(T, 4.0, 4.35);
  // 7 partner boxes
  const items = pile.map((b, i) => {
    const d = drop(T, 1.0 + i * 0.2, 900);
    if (!d) return null;
    const g = P(T, 2.95 + i * 0.09, 3.5 + i * 0.09), e = ioC(g);
    const tx = 540, ty = 1660 - i * towerS * 1.0;
    let x = lerp(b[0], tx, e), y = lerp(b[1], ty, e) - Math.sin(Math.PI * g) * 220 + (g > 0 ? 0 : d.dy);
    let s = lerp(b[2], towerS, e);
    if (merge > 0) { y = lerp(y, 1520, iC(merge)); s *= 1 - merge; }
    return { i, x, y, s, sz: g > 0 && g < 1 ? 1.06 : d.sz, depth: g > 0.5 ? -i : y };
  }).filter(Boolean);
  items.sort((a, b) => (a.depth < 0 || b.depth < 0 ? b.depth - a.depth : a.depth - b.depth));
  items.forEach(it => { if (it.s > 2) isoBox(it.x, it.y, it.s, { tape: TAPES[it.i], sz: it.sz }); });
  // the one ZIMOU box
  const bp = P(T, 4.25, 4.75);
  if (bp > 0) {
    const s = 280 * oB(bp), hop = T > 4.9 ? Math.abs(Math.sin((T - 4.9) * 5.5)) * 26 * Math.exp(-(T - 4.9) * 2) : 0;
    isoBox(540, 1640 - hop, s, { logo: true, sz: 1 + 0.08 * Math.sin((T - 4.25) * 20) * Math.exp(-(T - 4.25) * 5) });
    // burst lines
    const bl = P(T, 4.3, 4.8);
    if (bl > 0 && bl < 1) {
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const r1 = 230 + bl * 120, r2 = r1 + 70 * (1 - bl); ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * r1, 1500 + Math.sin(a) * r1); ctx.lineTo(540 + Math.cos(a) * r2, 1500 + Math.sin(a) * r2); ctx.stroke(); }
      ctx.restore();
    }
  }
}

// 02 · 5.5–13.6  mosaic map (+800) then every tile flies into the box
const DZ = [[-2.2, 35.1], [-1.2, 35.7], [0.1, 35.9], [1.4, 36.55], [3.0, 36.8], [4.8, 36.9], [6.3, 37.08], [7.8, 36.95], [8.62, 36.9],
  [8.4, 36.4], [8.3, 35.5], [8.2, 34.6], [7.6, 34.1], [7.5, 33.2], [8.3, 32.5], [9.06, 32.1], [9.5, 30.2], [9.9, 29.0], [9.7, 27.3],
  [9.6, 26.6], [10.0, 25.3], [10.3, 24.4], [11.5, 24.3], [11.98, 23.5], [10.0, 22.4], [7.45, 20.85], [5.68, 19.6], [4.27, 19.15],
  [3.3, 19.0], [3.15, 19.7], [1.8, 20.6], [1.1, 20.9], [-1.5, 23.0], [-4.9, 25.0], [-8.67, 27.4], [-8.67, 28.7], [-7.0, 29.6],
  [-5.2, 30.0], [-3.6, 30.9], [-3.7, 31.6], [-1.2, 32.1], [-1.3, 32.8], [-1.7, 33.4], [-1.75, 34.7]];
const MK = 40, MX = 540, MY = 1380;
const toXY = (lon, lat) => [MX + (lon - 1.65) * 0.88 * MK, MY - (lat - 28.05) * MK];
const fromXY = (x, y) => [(x - MX) / (0.88 * MK) + 1.65, 28.05 - (y - MY) / MK];
function inPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
const DZXY = DZ.map(p => toXY(p[0], p[1]));
const ALG = toXY(3.06, 36.75);
const R2 = rng(9);
const cells = [];
for (let y = 990; y < 1760; y += 24) for (let x = 150; x < 940; x += 24) {
  const [lo, la] = fromXY(x + 12, y + 12);
  if (inPoly(lo, la, DZ)) cells.push({ x: x + 12, y: y + 12, d: Math.hypot(x - ALG[0], y - ALG[1]), red: R2() < 0.14, r: R2() });
}
const maxD = Math.max(...cells.map(c => c.d));
const BOX2 = [540, 1520], BOX2S = 250;
function s2(T) {
  // outline draw-on + red offset silhouette
  const op = oC(P(T, 5.6, 7.0)), sil = P(T, 6.4, 7.0);
  const gone = P(T, 11.3, 12.9);
  if (gone < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - gone;
    if (sil > 0) {
      ctx.save(); ctx.globalAlpha *= sil;
      poly(DZXY.map(p => [p[0] + 16, p[1] + 16]), RED, false);
      poly(DZXY, CREAM, false);
      ctx.restore();
    }
    let per = 0; for (let i = 0; i < DZXY.length; i++) { const a = DZXY[i], b = DZXY[(i + 1) % DZXY.length]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    ctx.save(); ctx.setLineDash([per * op, per]); ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
    poly(DZXY, null, true); ctx.restore();
    ctx.restore();
  }
  // tiles
  const boxIn = T >= 11.0;
  cells.forEach(c => {
    const at = 8.25 + (c.d / maxD) * 0.85;
    const a = P(T, at, at + 0.25);
    if (a <= 0) return;
    const fl0 = 11.35 + (c.d / maxD) * 1.2 + c.r * 0.15, fl = P(T, fl0, fl0 + 0.5);
    let x = c.x, y = c.y, s = 18 * oB(a);
    if (fl >= 1) return;
    if (fl > 0) {
      const e = ioC(fl);
      x = lerp(c.x, BOX2[0], e); y = lerp(c.y, BOX2[1] - BOX2S * 1.05, e) - Math.sin(Math.PI * fl) * 160; s = 18 * (1 - e * 0.7);
    }
    ctx.fillStyle = c.red ? RED : INK;
    ctx.fillRect(x - s / 2, y - s / 2 * (fl > 0 ? 1 : Math.abs(Math.cos((1 - a) * Math.PI / 2))), s, s * (fl > 0 ? 1 : Math.abs(Math.cos((1 - a) * Math.PI / 2))));
  });
  // Algiers marker
  const am = P(T, 8.2, 8.5) * (1 - gone);
  if (am > 0) { ctx.save(); ctx.translate(ALG[0], ALG[1]); ctx.scale(oB(am), oB(am)); pinShape(0, 0, 70, RED); ctx.restore(); }
  // the box drops in and swallows everything
  if (boxIn) {
    const d = drop(T, 11.0, 1100);
    const eat = T > 11.4 && T < 12.95 ? Math.sin(T * 34) * 0.05 : 0;
    const seal = P(T, 12.95, 13.35);
    isoBox(BOX2[0], BOX2[1] + (d ? d.dy : 0), BOX2S, { open: seal <= 0, tapeP: oC(seal), logo: true, sz: (d ? d.sz : 1) + eat });
  }
  // text A
  const ta = 1 - P(T, 10.85, 11.1);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha *= ta; ctx.translate(0, -(1 - ta) * 50);
    words(T, [['Accès', 7.45], ['لأكثر', 7.75], ['من', 8.0]], 540, 300, 76);
    const cp = P(T, 8.25, 8.45);
    if (cp > 0) {
      const n = Math.round(800 * oC(P(T, 8.3, 9.05)));
      ctx.save(); ctx.font = `900 270px ${LA}`; ctx.textBaseline = 'alphabetic';
      const s = String(n), tw = ctx.measureText('+' + s).width, pw = ctx.measureText('+').width;
      ctx.translate(540, 520); ctx.scale(lerp(1.3, 1, oB(cp)), lerp(1.3, 1, oB(cp))); ctx.globalAlpha *= cp; ctx.textAlign = 'left';
      ctx.fillStyle = RED; ctx.fillText('+' + s, -tw / 2 + 12, 12 + 0);
      ctx.fillStyle = INK; ctx.fillText('+', -tw / 2, 0); ctx.fillText(s, -tw / 2 + pw, 0);
      ctx.restore();
    }
    words(T, [['مكتب', 9.0, 'hl'], ['توصيل', 9.15, 'hl']], 540, 680, 74);
    words(T, [['عبر', 10.0], ['كامل', 10.15], ['التراب', 10.35], ['الوطني.', 10.55]], 540, 810, 64, { weight: 800 });
    ctx.restore();
  }
  words(T, [['تجمعلك', 11.0]], 540, 420, 140);
  words(T, [['كل', 11.45], ['المكاتب.', 11.75, 'hl']], 540, 610, 130);
}

// 03 · 13.6–16.0  "هذا واش تقدملك" — the box bursts open, the logo card springs out
const R4 = rng(4);
const confetti = Array.from({ length: 26 }, () => ({ a: -Math.PI / 2 + (R4() - 0.5) * 2.4, v: 900 + R4() * 900, r: R4() * 6, c: [RED, INK, YEL, '#F45D66'][Math.floor(R4() * 4)] }));
function s3(T) {
  const sh = T > 13.7 && T < 14.35 ? Math.sin(T * 80) * 9 * P(T, 13.7, 14.1) : 0;
  const open = T >= 14.35;
  // card
  const cu = T - 14.38;
  if (cu > 0) {
    const k = spring(cu, 5, 12);
    const cy = lerp(BOX2[1] - BOX2S, 1000, k), sx = lerp(0.35, 1, clamp(k * 1.2)), cw = 880, ch = 340;
    ctx.save(); ctx.translate(540, cy); ctx.scale(sx, 1); ctx.rotate((1 - clamp(k)) * 0.08);
    brut(-cw / 2, -ch / 2, cw, ch, 28, CREAM, { sh: 14, lw: 6 });
    logoLight(0, 0, 0.82);
    ctx.restore();
  }
  // confetti
  if (cu > 0 && cu < 1.6) {
    confetti.forEach(c => {
      const t = cu; const x = 540 + Math.cos(c.a) * c.v * t * 0.6, y = BOX2[1] - BOX2S + Math.sin(c.a) * c.v * t + 1500 * t * t;
      ctx.save(); ctx.translate(x, y); ctx.rotate(c.r + t * 8); ctx.fillStyle = c.c; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(10, -22); ctx.lineTo(6, 22); ctx.lineTo(-10, 22); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    });
  }
  isoBox(BOX2[0] + sh, BOX2[1], BOX2S, { open, logo: true, sz: open ? 1 - 0.12 * Math.exp(-(T - 14.35) * 8) * Math.cos((T - 14.35) * 30) : 1 });
  // torn tape flaps
  if (open && T < 15.2) {
    const f = P(T, 14.35, 15.2);
    ctx.save(); ctx.globalAlpha *= 1 - f; ctx.fillStyle = RED; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    [[-1], [1]].forEach(([sd]) => { ctx.save(); ctx.translate(540 + sd * (60 + f * 200), BOX2[1] - BOX2S - 40 - f * 200 + f * f * 500); ctx.rotate(sd * f * 4); ctx.beginPath(); ctx.rect(-60, -14, 120, 28); ctx.fill(); ctx.stroke(); ctx.restore(); });
    ctx.restore();
  }
  words(T, [['هذا', 13.95], ['واش', 14.15], ['تقدملك', 14.45, 'hl']], 540, 450, 110);
}
function s23(T) { if (T < 13.6) s2(T); else s3(T); }

// 04 · 16.0–20.0  "منصة وحدة، أفضل 7 شركات توصيل في الجزائر." — one dial, 7 clicks
const DC = [540, 1250], DR = 300;
function s4(T) {
  words(T, [['منصة', 16.0], ['وحدة،', 16.45, 'hl']], 540, 330, 124);
  words(T, [['أفضل', 17.35], ['7', 17.75, 'red'], ['شركات', 17.9], ['توصيل', 18.1]], 540, 480, 80);
  words(T, [['في', 18.45], ['الجزائر.', 18.65, 'hl']], 540, 600, 80);
  const en = P(T, 16.05, 16.7);
  if (en <= 0) return;
  ctx.save(); ctx.translate(DC[0], DC[1]); const es = oB(en); ctx.scale(es, es); ctx.translate(-DC[0], -DC[1]);
  circle(DC[0], DC[1], DR, CREAM, 7, 18);
  ctx.save(); ctx.setLineDash([10, 14]); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(DC[0], DC[1], DR - 40, 0, 7); ctx.stroke(); ctx.restore();
  const ang = i => -Math.PI / 2 + i * Math.PI * 2 / 7;
  // knob rotation: step to each position
  let cur = 0;
  for (let i = 0; i < 7; i++) { const st = 17.5 + i * 0.28; cur += oB(P(T, st, st + 0.22)) * (i === 0 ? 0 : 1); }
  const kAng = ang(0) + cur * Math.PI * 2 / 7;
  for (let i = 0; i < 7; i++) {
    const a = ang(i), on = P(T, 17.5 + i * 0.28, 17.7 + i * 0.28);
    const x = DC[0] + Math.cos(a) * (DR - 40), y = DC[1] + Math.sin(a) * (DR - 40);
    circle(x, y, 34, on > 0 ? TAPES[i] : CREAM, 5, 6);
    if (on > 0) checkMark(x, y, 44 * oB(on), on, CREAM, 0.2);
    // partner box pops outside
    if (on > 0) { const bx = DC[0] + Math.cos(a) * (DR + 125), by = DC[1] + Math.sin(a) * (DR + 125) + 40; isoBox(bx, by, 70 * oB(on), { tape: TAPES[i] }); }
  }
  // knob
  circle(DC[0], DC[1], 160, RED, 7, 12);
  ctx.save(); ctx.translate(DC[0], DC[1]); ctx.rotate(kAng);
  ctx.fillStyle = CREAM; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(185, 0); ctx.lineTo(140, -26); ctx.lineTo(140, 26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  zIcon(DC[0], DC[1], 120, 1, CREAM);
  ctx.restore();
}

// 05 · 20.0–23.0  "Imagine بكل هاد المكاتب" — a skyline of offices pops up
const R6 = rng(66);
const blds = []; { let bx = -60; while (bx < 2600) { const w = 80 + R6() * 90; blds.push({ x: bx, w, h: 150 + R6() * 430, c: [CREAM, RED, INK, KR.left, CREAM][Math.floor(R6() * 5)], pin: R6() < 0.35, r: R6() }); bx += w + 8 + R6() * 22; } }
const GY = 1660;
function s5(T) {
  const pan = -1350 * ioC(P(T, 20.3, 23.3));
  const gl = oC(P(T, 20.05, 20.5));
  ctx.save(); ctx.fillStyle = INK; ctx.fillRect(540 - 540 * gl, GY, 1080 * gl, 8);
  ctx.globalAlpha *= 0.12; for (let x = -40 + (pan % 40); x < W; x += 40) { ctx.fillRect(x, GY + 30, 20, 4); } ctx.restore();
  blds.forEach(b => {
    const sx = b.x + pan; if (sx > W + 20 || sx + b.w < -30) return;
    const tp = 20.9 + (b.x / 2600) * 2.0 + b.r * 0.12, k = oB(P(T, tp, tp + 0.38));
    if (k <= 0) return;
    building(sx, GY, b.w, b.h, b.c, k);
    if (b.pin) { const pp = P(T, tp + 0.25, tp + 0.55); if (pp > 0) { ctx.save(); ctx.translate(sx + b.w / 2, GY - b.h * k - 8); ctx.scale(oB(pp), oB(pp)); pinShape(0, 0, 66, RED); ctx.restore(); } }
  });
  latin(T, 'Imagine', 540, 420, 172, 20.95, 0.045);
  words(T, [['بكل', 21.95], ['هاد', 22.3, 'hl'], ['المكاتب', 22.5, 'hl']], 540, 610, 112);
}

// 06 · 23.0–28.5  "كل زبون يطلب التوصيل للمكتب. bien sûr لازم يكون المكتب قريب." — tape measure
function s6(T) {
  const G = 1500;
  ctx.save(); ctx.fillStyle = INK; ctx.fillRect(60, G, 960 * oC(P(T, 23.1, 23.5)), 8); ctx.restore();
  // far office leaves, near office arrives
  const farIn = P(T, 24.25, 24.6), farOut = P(T, 26.3, 26.75);
  if (farIn > 0 && farOut < 1) { ctx.save(); ctx.translate(farOut * 300, 0); ctx.globalAlpha *= 1 - farOut; building(840, G, 150, 330, CREAM, oB(farIn)); ctx.translate(915, G - 330 * oB(farIn) - 10); pinShape(0, 0, 80, RED); ctx.restore(); }
  const nearIn = P(T, 26.85, 27.2);
  if (nearIn > 0) { building(520, G, 150, 280, RED, oB(nearIn)); ctx.save(); ctx.translate(595, G - 280 * oB(nearIn) - 10); ctx.scale(oB(nearIn), oB(nearIn)); pinShape(0, 0, 80, CREAM); ctx.restore(); }
  // customer + tape measure
  const pp = P(T, 23.3, 23.7);
  if (pp > 0) {
    ctx.save(); ctx.translate(190, G); ctx.scale(oB(pp), oB(pp)); ctx.translate(-190, -G); person(190, G, 110); ctx.restore();
  }
  const ext = oE(P(T, 24.45, 25.5)), ret = P(T, 27.0, 27.5);
  if (ext > 0) {
    const x0 = 330, xe = lerp(x0, 840, ext);
    const xEnd = ret > 0 ? lerp(840, 520, spring(ret * 1.2, 5, 16)) : xe;
    const len = xEnd - x0, y0 = 1395;
    const sag = u => Math.sin(Math.PI * u) * Math.min(26, len * 0.04) * (ret > 0 && ret < 1 ? Math.cos(ret * 30) : 1);
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = INK;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) { const u = i / 30; ctx.lineTo(x0 + len * u, y0 - 14 + sag(u)); }
    for (let i = 30; i >= 0; i--) { const u = i / 30; ctx.lineTo(x0 + len * u, y0 + 14 + sag(u)); }
    ctx.closePath(); ctx.fillStyle = YEL; ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3;
    for (let x = x0 + 20; x < xEnd - 6; x += 22) { const u = (x - x0) / len, tl = ((x - x0) / 22) % 5 === 0 ? 16 : 8; ctx.beginPath(); ctx.moveTo(x, y0 - 14 + sag(u)); ctx.lineTo(x, y0 - 14 + tl + sag(u)); ctx.stroke(); }
    ctx.fillStyle = INK; ctx.fillRect(xEnd - 4, y0 - 26, 10, 50);
    ctx.restore();
    brut(250, 1340, 100, 100, 18, INK, { sh: 8 });
    circle(300, 1390, 30, RED, 4);
  }
  ctx.save(); ctx.globalAlpha *= 1 - farOut; pill(590, 1240, 'بعيد', 40, P(T, 25.5, 25.9), { bg: INK }); ctx.restore();
  pill(430, 1250, 'قريب', 42, P(T, 27.6, 28.0), { check: true });
  // text
  const t1 = 1 - P(T, 25.95, 26.2);
  if (t1 > 0) {
    ctx.save(); ctx.globalAlpha *= t1; ctx.translate(0, -(1 - t1) * 50);
    words(T, [['كل', 23.45], ['زبون', 23.75], ['يطلب', 24.4]], 540, 360, 108);
    words(T, [['التوصيل', 24.95, 'hl'], ['للمكتب.', 25.45, 'hl']], 540, 520, 100);
    ctx.restore();
  }
  pill(540, 290, 'bien sûr !', 42, P(T, 26.0, 26.4), { bg: YEL, color: INK, rot: -0.08, square: true });
  words(T, [['لازم', 26.45], ['يكون', 26.85], ['المكتب', 27.15]], 540, 470, 96);
  const qp = P(T, 27.5, 27.9);
  if (qp > 0) {
    ctx.save(); ctx.translate(540, 700); const s = lerp(2.0, 1, oE(qp)); ctx.scale(s, s); ctx.rotate(-0.05 * (1 - oE(qp)));
    ctx.globalAlpha *= clamp(qp * 4); ctx.font = `900 200px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.fillStyle = INK; ctx.fillText('قريب.', 12, 12); ctx.fillStyle = RED; ctx.fillText('قريب.', 0, 0); ctx.restore();
  }
}

// 07 · 28.5–33.0  "تلقى مكتب قريب، بسهولة." — magnifier locks on the nearest office
const MAPC = { x: 90, y: 780, w: 900, h: 800 };
const offices = [[650, 1130], [260, 900], [860, 920], [300, 1470], [880, 1380], [470, 1010], [700, 1500]];
const CUST = [520, 1240];
function streetMap(T, found) {
  const { x, y, w, h } = MAPC;
  ctx.fillStyle = '#EDE3D1'; ctx.fillRect(x, y, w, h);
  for (let by = y + 26; by < y + h; by += 154) for (let bx = x + 26; bx < x + w; bx += 186) {
    rrect(bx, by, 150, 120, 12); ctx.fillStyle = (Math.floor(bx / 186 + by / 154) % 4 === 0) ? '#E3C99F' : CREAM; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }
  offices.forEach((o, i) => { const hit = i === 0 && found > 0; pinShape(o[0], o[1], hit ? 70 + 20 * oB(found) : 62, hit ? RED : INK); });
  ctx.save(); ctx.fillStyle = 'rgba(227,33,45,0.25)'; ctx.beginPath(); ctx.arc(CUST[0], CUST[1], 34 + 14 * Math.sin(T * 6), 0, 7); ctx.fill(); ctx.restore();
  circle(CUST[0], CUST[1], 22, RED, 5);
}
function s7(T) {
  words(T, [['تلقى', 29.95], ['مكتب', 30.2]], 540, 330, 116);
  words(T, [['قريب،', 30.5, 'hl'], ['بسهولة.', 31.45]], 540, 500, 116);
  const sq = P(T, 31.7, 32.1);
  if (sq > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 40 * sq; i++) { const xx = 470 - i * 9, yy = 545 + Math.sin(i * 0.9) * 9; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore(); }
  const cp = P(T, 28.55, 29.0);
  if (cp <= 0) return;
  const { x, y, w, h } = MAPC;
  ctx.save(); ctx.translate(0, (1 - oE(cp)) * 300); ctx.globalAlpha *= clamp(cp * 2);
  brut(x, y, w, h, 26, '#EDE3D1', { sh: 16, lw: 6 });
  ctx.save(); rrect(x, y, w, h, 26); ctx.clip();
  const found = P(T, 31.1, 31.45);
  streetMap(T, found);
  // route
  const rp = P(T, 31.25, 31.75);
  if (rp > 0) {
    const pts = [CUST, [585, 1240], [585, 1130], [650, 1130]];
    ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.setLineDash([22, 14]); ctx.lineCap = 'round';
    let L = 0; const segs = []; for (let i = 0; i < 3; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push(l); L += l; }
    let rem = L * oC(rp); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < 3 && rem > 0; i++) { const k = Math.min(1, rem / segs[i]); ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)); rem -= segs[i]; }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // magnifier
  const path = [[300, 960, 28.9], [800, 1000, 29.6], [780, 1440, 30.25], [340, 1400, 30.8], [650, 1060, 31.15]];
  let mx = path[0][0], my = path[0][1];
  for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1]; if (T >= a[2] && T <= b[2]) { const u = ioC((T - a[2]) / (b[2] - a[2])); mx = lerp(a[0], b[0], u); my = lerp(a[1], b[1], u); } else if (T > b[2]) { mx = b[0]; my = b[1]; } }
  const mIn = P(T, 28.75, 29.1), mOut = P(T, 32.0, 32.4);
  if (mIn > 0 && mOut < 1) {
    ctx.save(); ctx.globalAlpha *= mIn * (1 - mOut);
    const R = 130;
    // handle
    ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = INK; rrect(R - 6, -22, 190, 44, 20); ctx.fill(); ctx.restore();
    // lens (magnified map)
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R, 0, 7); ctx.clip();
    ctx.translate(mx, my); ctx.scale(1.7, 1.7); ctx.translate(-mx, -my); streetMap(T, found);
    ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(mx - 40, my - 50, 40, 0, 7); ctx.fill(); ctx.restore();
    ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(mx, my, R, 0, 7); ctx.stroke();
    if (found > 0) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(mx, my, R + 14 + 10 * (1 - found), 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  pill(540, 1700, 'مكتب قريب من زبونك', 44, P(T, 31.9, 32.3), { check: true });
}

// 08 · 33.0–37.0  "واحد من أكبر المشاكل... لي تحلهم المنصة." — the knot straightens
function knot(k, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / 300, env = Math.pow(Math.sin(Math.PI * t), 0.7);
    const x = lerp(270, 810, t) + k * env * (150 * Math.sin(2 * Math.PI * 4.3 * t) + 55 * Math.sin(2 * Math.PI * 9.1 * t + 1));
    const y = 1330 + k * env * (150 * Math.cos(2 * Math.PI * 4.3 * t) + 50 * Math.cos(2 * Math.PI * 7.7 * t + 2));
    pts.push([x, y]);
  }
  return pts;
}
function s8(T) {
  words(T, [['واحد', 33.45], ['من', 33.7], ['أكبر', 33.95]], 540, 330, 108);
  words(T, [['المشاكل...', 34.45, 'hl']], 540, 490, 124);
  words(T, [['لي', 35.45], ['تحلهم', 35.65], ['المنصة.', 35.95, 'red']], 540, 650, 100);
  const ap = P(T, 33.05, 33.4);
  if (ap <= 0) return;
  const un = P(T, 35.45, 36.25), k = 1 - spring(un, 5, 11);
  const n = Math.round(300 * oC(P(T, 33.15, 34.3)));
  const pts = knot(k, n);
  // tag hanging from the knot
  const tf = P(T, 35.3, 35.95);
  if (tf < 1) {
    const mid = knot(1, 300)[150], tx = 540, ty = 1560 + iC(tf) * 500;
    ctx.save(); ctx.globalAlpha *= clamp(ap * 2) * (1 - tf);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lerp(mid[0], tx, tf), lerp(mid[1], ty - 60, tf)); ctx.lineTo(tx, ty - 50); ctx.stroke();
    ctx.translate(tx, ty); ctx.rotate(Math.sin(T * 2.2) * 0.04 + tf * 0.6);
    brut(-340, -50, 680, 104, 16, CREAM, { sh: 9 });
    ctx.font = `800 46px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('المكتب بعيد على الزبون', 0, 16);
    ctx.restore();
  }
  // string
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const col = k < 0.5 ? RED : INK;
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.strokeStyle = col === RED ? RED : '#3A3A3A'; ctx.lineWidth = 8; ctx.stroke();
  ctx.restore();
  // anchors
  ctx.save(); ctx.globalAlpha *= clamp(ap * 2);
  pinShape(205, 1370, 110, RED);
  circle(880, 1330, 56, CREAM, 5, 8);
  ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(880, 1316, 17, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(880, 1356, 27, 18, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
  // stamp
  const sp = P(T, 36.15, 36.4);
  if (sp > 0) {
    ctx.save(); ctx.translate(540, 1010); const s = lerp(2.2, 1, oE(sp)); ctx.scale(s, s); ctx.rotate(-0.18); ctx.globalAlpha *= clamp(sp * 4);
    circle(0, 0, 105, RED, 7, 12); checkMark(0, 4, 130, 1, CREAM, 0.17);
    ctx.restore();
    const dl = P(T, 36.38, 36.75);
    if (dl > 0 && dl < 1) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.3; const r1 = 130 + dl * 60, r2 = r1 + 40 * (1 - dl); ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * r1, 1010 + Math.sin(a) * r1); ctx.lineTo(540 + Math.cos(a) * r2, 1010 + Math.sin(a) * r2); ctx.stroke(); } ctx.restore(); }
  }
}

// 09 · 37.0–39.0  "واش راك تستنى؟ باش تبدا تخدم" — the big START button
const BTN = [540, 1460];
function s9(T) {
  ctx.fillStyle = RED; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(120,8,18,0.32)';
  for (let y = 160; y < H - 100; y += 40) for (let x = 60; x < W; x += 40) { const r = 2 + 8 * Math.pow(y / H, 2.2); ctx.beginPath(); ctx.arc(x + ((y / 40) % 2) * 20, y, r, 0, 7); ctx.fill(); }
  words(T, [['واش', 37.0], ['راك', 37.35]], 540, 520, 160, { color: CREAM });
  const tp = P(T, 37.8, 38.1);
  if (tp > 0) {
    ctx.save(); ctx.translate(540, 790); const s = lerp(2.0, 1, oE(tp)); ctx.scale(s, s); ctx.globalAlpha *= clamp(tp * 4);
    ctx.font = `900 250px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.fillStyle = CREAM; ctx.fillText('تستنى؟', 12, 12); ctx.fillStyle = INK; ctx.fillText('تستنى؟', 0, 0); ctx.restore();
  }
  words(T, [['باش', 38.3], ['تبدا', 38.45], ['تخدم', 38.62, 'hl']], 540, 990, 92, { color: CREAM });
  // button
  const press = P(T, 38.58, 38.68) * (1 - P(T, 38.75, 38.95)), dz = 50 * press;
  const [bx, by] = BTN;
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = INK;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(bx + 16, by + 70, 300, 105, 0, 0, 7); ctx.fill();
  ctx.fillStyle = CREAM; ctx.beginPath(); ctx.ellipse(bx, by + 56, 300, 105, 0, 0, 7); ctx.fill(); ctx.stroke();
  const top = by - 70 + dz;
  ctx.fillStyle = '#9E0F18'; ctx.beginPath(); ctx.ellipse(bx, by + 30, 210, 70, 0, 0, Math.PI); ctx.lineTo(bx - 210, top); ctx.ellipse(bx, top, 210, 70, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = RED; ctx.beginPath(); ctx.ellipse(bx, top, 210, 70, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(bx, top); ctx.scale(1, 0.34); zIcon(0, 0, 150, 1, CREAM); ctx.restore();
  ctx.restore();
  // finger / cursor
  const cIn = P(T, 38.05, 38.58);
  if (cIn > 0) {
    const cx = lerp(900, bx + 30, ioC(cIn)), cy = lerp(1880, top - 10, ioC(cIn));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 120); ctx.lineTo(32, 92); ctx.lineTo(54, 140); ctx.lineTo(76, 130); ctx.lineTo(54, 84); ctx.lineTo(94, 84); ctx.closePath();
    ctx.fillStyle = INK; ctx.save(); ctx.translate(9, 9); ctx.fill(); ctx.restore();
    ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  }
  const rg = P(T, 38.65, 39.1);
  if (rg > 0 && rg < 1) { ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = 10 * (1 - rg) + 2; for (let k = 0; k < 2; k++) { const q = clamp(rg * 1.3 - k * 0.25); ctx.beginPath(); ctx.ellipse(bx, top, 220 + q * 380, 74 + q * 130, 0, 0, 7); ctx.stroke(); } ctx.restore(); }
}

// 10 · 39.0–end  logo slammed like a rubber stamp
function s10(T) {
  const imp = P(T, 39.45, 39.85), shake = imp > 0 && imp < 1 ? Math.sin(T * 90) * 10 * (1 - imp) : 0;
  ctx.save(); ctx.translate(shake, shake * 0.4);
  const sp = P(T, 39.2, 39.45);
  if (sp > 0) {
    ctx.save(); ctx.translate(540, 860); const s = lerp(1.9, 1, iC(sp)); ctx.scale(s, s); ctx.rotate(lerp(-0.14, -0.0, iC(sp))); ctx.globalAlpha *= clamp(sp * 3);
    logoLight(0, 0, 1.15); ctx.restore();
  }
  if (imp > 0 && imp < 1) {
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const rx = 470 + imp * 90, ry = 170 + imp * 70; const k2 = 1 - imp; ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * rx, 860 + Math.sin(a) * ry); ctx.lineTo(540 + Math.cos(a) * (rx + 50 * k2), 860 + Math.sin(a) * (ry + 30 * k2)); ctx.stroke(); }
    ctx.restore();
  }
  pill(540, 1120, 'zimouexpress.com', 46, P(T, 40.35, 40.7), { weight: 800 });
  words(T, [['+800', 40.7, 'red'], ['مكتب', 40.8], ['عبر', 40.9], ['الوطن', 41.0]], 540, 1270, 56, { weight: 800 });
  const d = drop(T, 39.75, 900);
  if (d) isoBox(540, 1640 + d.dy, 180, { logo: true, sz: d.sz });
  ctx.restore();
}

// ================= timeline =================
const SCENES = [[0, 5.5, s1], [5.5, 16.0, s23], [16.0, 20.0, s4], [20.0, 23.0, s5], [23.0, 28.5, s6], [28.5, 33.0, s7], [33.0, 37.0, s8], [37.0, 39.0, s9], [39.0, 99, s10]];
const COUNTER = T => (T < 5.5 ? 1 : T < 13.6 ? 2 : T < 16 ? 3 : T < 20 ? 4 : T < 23 ? 5 : T < 28.5 ? 6 : T < 33 ? 7 : T < 37 ? 8 : T < 39 ? 9 : 10);
const TRANS = [[5.5, 'push'], [16.0, 'push'], [20.0, 'push'], [23.0, 'push'], [28.5, 'push'], [33.0, 'push'], [37.0, 'iris', [540, 1010]], [39.0, 'iris', BTN]];
const sceneAt = T => SCENES.find(s => T >= s[0] && T < s[1]) || SCENES[SCENES.length - 1];
function render(T) {
  const f = Math.round(T * 30);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.letterSpacing = '0px'; ctx.shadowBlur = 0; ctx.setLineDash([]); ctx.lineCap = 'butt';
  paper();
  const tr = TRANS.find(([tb]) => T >= tb - 0.22 && T < tb + 0.28);
  if (tr) {
    const [tb, type, c] = tr, p = ioC(P(T, tb - 0.22, tb + 0.28));
    const prev = sceneAt(tb - 0.001)[2], next = sceneAt(tb)[2];
    if (type === 'push') {
      ctx.save(); ctx.translate(0, -p * H); prev(T); ctx.restore();
      ctx.save(); ctx.translate(0, (1 - p) * H); paper(); next(T); ctx.restore();
      // speed lines
      ctx.save(); ctx.fillStyle = INK; ctx.globalAlpha = Math.sin(Math.PI * p) * 0.9;
      for (let i = 0; i < 7; i++) { const x = 90 + i * 150, l = 300 + (i * 97) % 400; ctx.fillRect(x, (1 - p) * H - l / 2 + ((i * 211) % 500) - 250, 10, l); }
      ctx.restore();
    } else {
      prev(T);
      const r = 2300 * ioC(p);
      ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.clip(); paper(); next(T); ctx.restore();
      ctx.save(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.stroke(); ctx.restore();
    }
  } else {
    ctx.save(); sceneAt(T)[2](T); ctx.restore();
  }
  chrome(T, COUNTER(T));
  grain(f);
  const fo = P(T, DUR - 0.2, DUR), fi = 1 - P(T, 0, 0.2);
  if (fo > 0 || fi > 0) { ctx.fillStyle = `rgba(243,236,223,${Math.max(fo, fi)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
Promise.all([
  document.fonts.load(`900 40px ${AR}`, 'عربي'), document.fonts.load(`800 40px ${AR}`, 'عربي'),
  document.fonts.load(`900 40px ${LA}`, 'Ab'), document.fonts.load(`800 40px ${LA}`, 'Ab'), document.fonts.load(`600 40px ${LA}`, 'Ab'),
]).then(() => { render(0); window.ready = true; });
