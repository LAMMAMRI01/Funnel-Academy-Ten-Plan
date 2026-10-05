// الشبكة العالمية — "مزرعتين" motion graphic. Reference style (white, minimal green/gray kinetic type), richer scenes.
const W = 1080, H = 1920, DUR = 39.5;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const G = '#6EC148', G2 = '#8FD97A', GL = '#E8F6E1', GRAY = '#787878', GRAYL = '#D9D9D9', INK = '#4A4A4A', LIME = '#E3F57A', WHITE = '#FFFFFF';
const F = 'Alexandria';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const oC = t => 1 - Math.pow(1 - t, 3);
const oE = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const ioC = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const iC = t => t * t * t;
const oB = t => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = 0.35, fo = 0.35) => clamp(P(t, a, a + fi)) * (1 - P(t, b - fo, b));
function quad(a, c, b, n = 30) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return o; }
function plen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function pathPartial(pts, p) {
  if (p <= 0) return false; const L = plen(pts) * clamp(p);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let acc = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); return true; } ctx.lineTo(pts[i][0], pts[i][1]); acc += d; }
  return true;
}

// ---------- primitives ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); }
function ring(x, y, r, col, lw, a0 = 0, a1 = Math.PI * 2) { ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); }
function shadowCard(x, y, w, h, r, fill = WHITE) { ctx.save(); ctx.shadowColor = 'rgba(60,90,50,0.13)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; rr(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
function pop(x, y, p, fn, o = {}) {
  if (p <= 0) return; const s = o.nb ? oE(p) : oB(clamp(p));
  ctx.save(); ctx.translate(x, y + (1 - oE(p)) * (o.dy ?? 40)); const k = lerp(o.s0 ?? 0.5, 1, s); ctx.scale(k, k); ctx.rotate((o.rot || 0) * (1 - oE(p))); ctx.globalAlpha *= clamp(p * 3); fn(); ctx.restore();
}
function txt(t, x, y, size, col, o = {}) { ctx.save(); ctx.font = `${o.w || 700} ${size}px ${F}`; ctx.fillStyle = col; ctx.textAlign = o.a || 'center'; ctx.textBaseline = 'middle'; ctx.direction = o.dir || 'rtl'; ctx.fillText(t, x, y); ctx.restore(); }
function tw(t, size, w = 700) { ctx.save(); ctx.font = `${w} ${size}px ${F}`; ctx.direction = 'rtl'; const m = ctx.measureText(t).width; ctx.restore(); return m; }
function check(x, y, s, p = 1, col = WHITE, w = 0.15) { if (p <= 0) return; const pts = [[x - 0.3 * s, y + 0.02 * s], [x - 0.08 * s, y + 0.24 * s], [x + 0.34 * s, y - 0.24 * s]]; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (pathPartial(pts, p)) ctx.stroke(); ctx.restore(); }
function dashed(pts, p, col = GRAY, lw = 4) { ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; if (pathPartial(pts, p)) ctx.stroke(); ctx.restore(); }
// reveal a text by sweeping a mask right->left (Arabic reading direction)
function sweepText(t, x, y, size, col, p, o = {}) {
  if (p <= 0) return; const w = tw(t, size, o.w) + 30;
  ctx.save(); ctx.beginPath(); ctx.rect(x + w / 2 - w * oC(p), y - size, w * oC(p), size * 2); ctx.clip();
  txt(t, x + (1 - oE(p)) * 20, y, size, col, o); ctx.restore();
}
// green highlight box with white text, growing from the right
function hlBox(t, x, y, size, p, o = {}) {
  if (p <= 0) return; const w = tw(t, size, o.w || 800) + size * 0.9, h = size * 1.55, bp = oE(P(p, 0, 0.6));
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  rr(x + w / 2 - w * bp, y - h / 2, w * bp, h, size * 0.25); ctx.fillStyle = o.bg || G; ctx.fill();
  ctx.beginPath(); ctx.rect(x + w / 2 - w * bp, y - h, w * bp, h * 2); ctx.clip();
  txt(t, x, y + (1 - oE(P(p, 0.2, 1))) * 20, size, o.col || WHITE, { w: o.w || 800 });
  ctx.restore();
}
function underline(x, y, w, p, col = G, lw = 7) { if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2 - w * oC(p), y); ctx.stroke(); ctx.restore(); }
// leaf shape (brand emblem)
function leafPath(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100);
  ctx.beginPath(); ctx.moveTo(-48, 46); ctx.bezierCurveTo(-52, -10, -10, -40, 50, -48); ctx.bezierCurveTo(44, 0, 10, 48, -48, 46); ctx.closePath();
  ctx.restore();
}
function leaf(x, y, s, rot = 0, col = G) {
  leafPath(x, y, s, rot); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.quadraticCurveTo(-5, 0, 28, -22); ctx.stroke(); ctx.restore();
}

// ---------- icons (flat, brand colors) ----------
const IC = {
  drop(x, y, s, c = G) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - s * 0.55); ctx.bezierCurveTo(x + s * 0.1, y - s * 0.3, x + s * 0.42, y - s * 0.05, x + s * 0.42, y + s * 0.18); ctx.arc(x, y + s * 0.18, s * 0.42, 0, Math.PI); ctx.bezierCurveTo(x - s * 0.42, y - s * 0.05, x - s * 0.1, y - s * 0.3, x, y - s * 0.55); ctx.fill(); circle(x - s * 0.15, y + s * 0.18, s * 0.08, 'rgba(255,255,255,0.7)'); },
  bag(x, y, s, c = G) { ctx.fillStyle = c; rr(x - s * 0.34, y - s * 0.38, s * 0.68, s * 0.8, s * 0.1); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; leafPath(x, y + s * 0.05, s * 0.32, 0); ctx.fill(); ctx.fillStyle = c; rr(x - s * 0.28, y - s * 0.5, s * 0.56, s * 0.16, s * 0.05); ctx.fill(); },
  worker(x, y, s, c = G) { circle(x, y - s * 0.18, s * 0.17, c); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y - s * 0.26, s * 0.22, Math.PI, 0); ctx.fill(); rr(x - s * 0.28, y - s * 0.3, s * 0.56, s * 0.06, s * 0.03); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + s * 0.38, s * 0.34, s * 0.3, 0, Math.PI, 0); ctx.fill(); },
  clock(x, y, s, c = G) { ring(x, y, s * 0.38, c, s * 0.1); ctx.strokeStyle = c; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.22); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.16, y + s * 0.08); ctx.stroke(); },
  calc(x, y, s, c = G) { ctx.fillStyle = c; rr(x - s * 0.34, y - s * 0.46, s * 0.68, s * 0.92, s * 0.1); ctx.fill(); ctx.fillStyle = WHITE; rr(x - s * 0.24, y - s * 0.36, s * 0.48, s * 0.2, s * 0.04); ctx.fill(); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { rr(x - s * 0.24 + i * s * 0.18, y - s * 0.06 + j * s * 0.15, s * 0.12, s * 0.1, s * 0.02); ctx.fill(); } },
  kg(x, y, s, c = GRAY) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.22); ctx.lineTo(x + s * 0.3, y - s * 0.22); ctx.lineTo(x + s * 0.45, y + s * 0.42); ctx.lineTo(x - s * 0.45, y + s * 0.42); ctx.closePath(); ctx.fill(); ring(x, y - s * 0.36, s * 0.13, c, s * 0.08); txt('1kg', x, y + s * 0.12, s * 0.26, WHITE, { w: 800, dir: 'ltr' }); },
  plant(x, y, s, c = G) { ctx.strokeStyle = c; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.lineTo(x, y - s * 0.05); ctx.stroke(); leaf(x - s * 0.18, y - s * 0.05, s * 0.4, 0.5, c); leaf(x + s * 0.18, y - s * 0.22, s * 0.42, -0.9 + Math.PI * 0.6, c); ctx.fillStyle = GRAY; rr(x - s * 0.3, y + s * 0.34, s * 0.6, s * 0.1, s * 0.05); ctx.fill(); },
  seed(x, y, s, c = G) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, s * 0.24, s * 0.36, 0.5, 0, 7); ctx.fill(); ctx.strokeStyle = WHITE; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(x - s * 0.08, y + s * 0.2); ctx.quadraticCurveTo(x + s * 0.05, y, x + s * 0.06, y - s * 0.2); ctx.stroke(); },
  clip(x, y, s, c = G) { ctx.fillStyle = c; rr(x - s * 0.32, y - s * 0.42, s * 0.64, s * 0.86, s * 0.08); ctx.fill(); ctx.fillStyle = WHITE; rr(x - s * 0.14, y - s * 0.5, s * 0.28, s * 0.14, s * 0.04); ctx.fill(); for (let i = 0; i < 3; i++) { rr(x - s * 0.18, y - s * 0.18 + i * s * 0.18, s * 0.36, s * 0.07, s * 0.03); ctx.fill(); } },
  cal(x, y, s, c = G) { ctx.fillStyle = c; rr(x - s * 0.38, y - s * 0.32, s * 0.76, s * 0.72, s * 0.1); ctx.fill(); ctx.fillStyle = WHITE; rr(x - s * 0.3, y - s * 0.12, s * 0.6, s * 0.44, s * 0.05); ctx.fill(); ctx.fillStyle = c; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rr(x - s * 0.22 + i * s * 0.17, y - s * 0.04 + j * s * 0.17, s * 0.1, s * 0.1, s * 0.02); ctx.fill(); } },
  chat(x, y, s, c = G) { ctx.fillStyle = c; rr(x - s * 0.42, y - s * 0.34, s * 0.84, s * 0.56, s * 0.16); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.15, y + s * 0.2); ctx.lineTo(x - s * 0.3, y + s * 0.42); ctx.lineTo(x + s * 0.05, y + s * 0.2); ctx.fill(); for (let i = -1; i <= 1; i++) circle(x + i * s * 0.2, y - s * 0.06, s * 0.06, WHITE); },
  farm(x, y, s, c = G) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.02); ctx.lineTo(x, y - s * 0.4); ctx.lineTo(x + s * 0.4, y - s * 0.02); ctx.fill(); rr(x - s * 0.32, y - s * 0.04, s * 0.64, s * 0.42, s * 0.04); ctx.fill(); ctx.fillStyle = WHITE; rr(x - s * 0.1, y + s * 0.12, s * 0.2, s * 0.26, s * 0.03); ctx.fill(); },
};
function iconBubble(name, x, y, r, p, o = {}) { pop(x, y, p, () => { circle(0, 0, r, o.bg || GL); ring(0, 0, r, o.ring || G2, 4); IC[name](0, 0, r * 1.1, o.col || G); }, { dy: 30, s0: 0.3 }); }

// ---------- images (official logo from the brand guideline) ----------
const IMG = {}; const IMGS = ['gear', 'leaf', 'icon', 'logo_full'];
function logoTop(T) { // persistent small logo at the top, like the reference
  const a = P(T, 0.0, 0.5) * (1 - P(T, 36.25, 36.6)); if (a <= 0 || !IMG.icon) return;
  const s = 120, im = IMG.icon; ctx.save(); ctx.globalAlpha = a; ctx.drawImage(im, 540 - s / 2, 120, s, s * im.height / im.width); ctx.restore();
}

// ---------- background ----------
function bg(T) {
  ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H);
  // brand halftone pattern, very faint, drifting (from the guideline's dot pattern)
  ctx.save(); ctx.fillStyle = G;
  const ox = (T * 6) % 40;
  for (let y = 0; y < 520; y += 40) for (let x = 0; x < 520; x += 40) { const d = Math.hypot(x, y) / 700; const r = Math.max(0, 4.2 * (1 - d * 1.4)); if (r > 0.3) { ctx.globalAlpha = 0.16; ctx.beginPath(); ctx.arc(W - x - ox, H - y - ox * 0.5, r, 0, 7); ctx.fill(); } }
  ctx.restore();
}
// floating leaves used as scene transitions
function leafSweep(T, t0, dir = 1) {
  const p = P(T, t0 - 0.35, t0 + 0.45); if (p <= 0 || p >= 1) return;
  for (let i = 0; i < 6; i++) {
    const q = clamp(p * 1.3 - i * 0.05), x = lerp(dir > 0 ? -200 : 1280, dir > 0 ? 1280 : -200, ioC(q)), y = 500 + i * 230 + Math.sin(q * 6 + i) * 60;
    ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * q) * 0.9; leaf(x, y, 70 + (i % 3) * 30, q * 4 + i, i % 2 ? G : G2); ctx.restore();
  }
}

// ================= SCENES =================
// 01 · 0–4.9  "مزرعتين.. نفس كمية الإنتاج بالضبط.. بس وحدة منهم تربح أكثر"
function farmCard(cx, cy, label, t0, T, win2) {
  pop(cx, cy, P(T, t0, t0 + 0.5), () => {
    shadowCard(-200, -300, 400, 600, 36);
    ctx.save(); rr(-180, -280, 360, 230, 26); ctx.clip();
    const sky = ctx.createLinearGradient(0, -280, 0, -50); sky.addColorStop(0, '#F3FBEF'); sky.addColorStop(1, '#FFFFFF'); ctx.fillStyle = sky; ctx.fillRect(-180, -280, 360, 230);
    circle(110, -220, 30, LIME);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? G : G2; ctx.beginPath(); const y0 = -150 + i * 18; ctx.moveTo(-180, y0 + 20); ctx.quadraticCurveTo(0, y0 - 6, 180, y0 + 20); ctx.lineTo(180, y0 + 38); ctx.quadraticCurveTo(0, y0 + 12, -180, y0 + 38); ctx.fill(); }
    ctx.restore();
    txt(label, 0, -10, 40, INK, { w: 800 });
    // production bar (identical in both)
    const bp = oE(P(T, 1.0, 1.9));
    txt('الإنتاج', 120, 60, 28, GRAY, { w: 600 });
    rr(-160, 90, 320, 30, 15); ctx.fillStyle = '#EFEFEF'; ctx.fill();
    rr(160 - 320 * 0.78 * bp, 90, 320 * 0.78 * bp, 30, 15); ctx.fillStyle = G2; ctx.fill();
    // profit bar (differs)
    const pp = oE(P(T, 3.0, 4.2)), pv = win2 ? 0.92 : 0.38;
    txt('الربح', 135, 170, 28, GRAY, { w: 600 });
    rr(-160, 200, 320, 30, 15); ctx.fillStyle = '#EFEFEF'; ctx.fill();
    rr(160 - 320 * pv * pp, 200, 320 * pv * pp, 30, 15); ctx.fillStyle = win2 ? G : GRAY; ctx.fill();
  }, { dy: 80, s0: 0.7 });
}
function s1(T) {
  const out = P(T, 4.75, 5.05); if (out >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - out;
  hlBox('مزرعتين', 540, 420, 84, P(T, 0.02, 0.6));
  sweepText('نفس كمية الإنتاج بالضبط', 540, 545, 52, GRAY, P(T, 0.95, 2.4), { w: 700 });
  farmCard(300, 1080, 'مزرعة ١', 0.25, T, true);
  farmCard(780, 1080, 'مزرعة ٢', 0.4, T, false);
  // equals sign between production bars
  pop(540, 1165, P(T, 1.7, 2.1), () => { circle(0, 0, 38, G); ctx.fillStyle = WHITE; rr(-18, -12, 36, 7, 3); ctx.fill(); rr(-18, 5, 36, 7, 3); ctx.fill(); }, { dy: 0, s0: 0.2 });
  // winner badge
  pop(300, 760, P(T, 3.6, 4.0), () => { rr(-130, -34, 260, 68, 34); ctx.fillStyle = G; ctx.fill(); txt('تربح أكثر', 14, 2, 34, WHITE, { w: 800 }); ctx.strokeStyle = WHITE; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-100, 12); ctx.lineTo(-84, -4); ctx.lineTo(-74, 6); ctx.lineTo(-56, -14); ctx.stroke(); }, { dy: 20, s0: 0.3 });
  sweepText('بس وحدة منهم', 540, 1540, 50, GRAY, P(T, 2.9, 3.6));
  sweepText('تربح أكثر', 540, 1630, 72, G, P(T, 3.6, 4.4), { w: 800 });
  ctx.restore();
}
// 02 · 5.0–8.2  "شلون؟ لأنه مو كل شي يعتمد على كمية إنتاجك"
function s2(T) {
  const a = win(T, 5.0, 8.15, 0.2, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  pop(540, 560, P(T, 5.05, 5.45), () => { circle(0, 0, 120, G); txt('شلون؟', 0, 6, 64, WHITE, { w: 800 }); }, { dy: 0, s0: 0.2 });
  for (let k = 0; k < 2; k++) { const u = ((T - 5.1) * 0.9 + k * 0.5) % 1; if (T < 5.1) break; ctx.save(); ctx.globalAlpha *= (1 - u) * 0.6; ring(540, 560, 130 + u * 120, G2, 4); ctx.restore(); }
  // balance scale: production alone doesn't decide
  const tilt = lerp(0, -0.22, oE(P(T, 6.4, 7.4))) + Math.sin(T * 3) * 0.01;
  pop(540, 1150, P(T, 5.6, 6.1), () => {
    ctx.fillStyle = GRAY; rr(-12, -170, 24, 330, 12); ctx.fill(); rr(-120, 150, 240, 26, 13); ctx.fill(); circle(0, -175, 22, GRAY);
    ctx.save(); ctx.translate(0, -170); ctx.rotate(tilt);
    ctx.fillStyle = GRAY; rr(-330, -8, 660, 16, 8); ctx.fill();
    [[-300, 'الإنتاج', G2], [300, 'التكلفة', G]].forEach(([x, l, c], i) => {
      ctx.save(); ctx.translate(x, 0); ctx.rotate(-tilt);
      ctx.strokeStyle = GRAY; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 150); ctx.moveTo(0, 0); ctx.lineTo(90, 150); ctx.stroke();
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 155, 110, 26, 0, 0, Math.PI); ctx.fill();
      pop(0, 100, P(T, 6.0 + i * 0.4, 6.4 + i * 0.4), () => { rr(-95, -34, 190, 68, 34); ctx.fillStyle = WHITE; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.stroke(); txt(l, 0, 2, 32, INK, { w: 800 }); }, { s0: 0.3 });
      ctx.restore();
    });
    ctx.restore();
  }, { dy: 80, s0: 0.6 });
  sweepText('مو كل شي يعتمد على', 540, 1540, 52, GRAY, P(T, 5.6, 6.8));
  sweepText('كمية إنتاجك', 540, 1630, 70, G, P(T, 6.8, 7.7), { w: 800 });
  ctx.restore();
}
// 03 · 8.2–10.4  "الأهم.. جم كلفك الكيلو؟"
function s3(T) {
  const a = win(T, 8.15, 10.45, 0.2, 0.25); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  hlBox('الأهم..', 540, 560, 90, P(T, 8.2, 8.8));
  const sw = Math.sin((T - 9.3) * 4) * 0.25 * Math.exp(-Math.max(0, T - 9.3) * 1.2);
  pop(540, 1100, P(T, 8.9, 9.4), () => {
    circle(0, 0, 250, GL);
    IC.kg(-20, 40, 300, GRAY);
    // swinging price tag
    ctx.save(); ctx.translate(175, -120); ctx.rotate(0.35 + sw);
    ctx.strokeStyle = GRAY; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 70); ctx.stroke();
    ctx.fillStyle = G; ctx.beginPath(); ctx.moveTo(-50, 70); ctx.lineTo(50, 70); ctx.lineTo(50, 170); ctx.lineTo(0, 200); ctx.lineTo(-50, 170); ctx.closePath(); ctx.fill();
    txt('؟', 0, 130, 70, WHITE, { w: 800 }); circle(0, 88, 7, WHITE);
    ctx.restore();
  }, { dy: 60, s0: 0.5 });
  sweepText('جم كلفك الكيلو؟', 540, 1580, 76, G, P(T, 9.05, 10.2), { w: 800 });
  ctx.restore();
}
// 04 · 10.4–14.4  "الماي، السماد، العمالة والوقت.. كلهم يدخلون بالحسبة"
const COSTS = [['drop', 'الماي', 10.45, 270, 760], ['bag', 'السماد', 11.15, 810, 760], ['worker', 'العمالة', 11.95, 270, 1080], ['clock', 'الوقت', 12.55, 810, 1080]];
function s4(T) {
  const a = win(T, 10.4, 14.45, 0.15, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const C0 = [540, 1420];
  COSTS.forEach(([ic, label, t0, x, y]) => {
    iconBubble(ic, x, y, 95, P(T, t0, t0 + 0.4));
    sweepText(label, x, y + 140, 44, INK, P(T, t0 + 0.1, t0 + 0.6), { w: 800 });
    const lp = P(T, 12.95, 13.7);
    if (lp > 0) dashed(quad([x, y + 180], [x, C0[1] - 40], [C0[0] + (x < 540 ? -100 : 100), C0[1]], 30), lp, G2, 4);
    // particles flowing into the calculator
    if (T > 13.3) for (let k = 0; k < 2; k++) { const u = ((T - 13.3) * 1.3 + k / 2) % 1; const pts = quad([x, y + 180], [x, C0[1] - 40], [C0[0] + (x < 540 ? -100 : 100), C0[1]], 30); const q = pts[Math.floor(u * 30)]; circle(q[0], q[1], 8, G); }
  });
  pop(C0[0], C0[1], P(T, 12.9, 13.35), () => { circle(0, 0, 110, G); IC.calc(0, 0, 140, WHITE); }, { s0: 0.3 });
  pop(C0[0], C0[1] + 170, P(T, 13.6, 14.0), () => { rr(-150, -36, 300, 72, 36); ctx.fillStyle = GL; ctx.fill(); txt('= التكلفة', 0, 2, 38, G, { w: 800 }); }, { s0: 0.4 });
  sweepText('كلهم يدخلون بالحسبة', 540, 470, 58, GRAY, P(T, 12.95, 14.1), { w: 800 });
  ctx.restore();
}
// 05 · 14.4–18.9  "فبدال لا تسأل جم إنتجت؟ اسأل جم كلفتك؟"
function s5(T) {
  const a = win(T, 14.4, 18.95, 0.2, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  sweepText('فبدال لا تسأل..', 540, 470, 56, GRAY, P(T, 14.4, 15.0));
  // old question card (gray) gets struck & pushed back
  const strike = P(T, 15.9, 16.3), back = oE(P(T, 16.1, 16.7));
  ctx.save(); ctx.translate(0, -back * 90); ctx.globalAlpha *= 1 - back * 0.55;
  pop(540, 860, P(T, 14.8, 15.25), () => {
    shadowCard(-380, -100, 760, 200, 100, '#F4F4F4');
    txt('جم إنتجت؟', -40, 4, 70, GRAY, { w: 800 });
    circle(290, 0, 60, GRAYL); IC.farm(290, 4, 70, GRAY);
    if (strike > 0) { ctx.strokeStyle = '#E25B5B'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(-250 + 500 * oC(strike), 0); ctx.stroke(); }
  }, { dy: 60, s0: 0.7 });
  ctx.restore();
  // new question card (green)
  pop(540, 1180, P(T, 16.1, 16.6), () => {
    shadowCard(-400, -115, 800, 230, 115, G);
    txt('جم كلفتك؟', -40, 4, 84, WHITE, { w: 800 });
    circle(310, 0, 70, WHITE); IC.calc(310, 2, 90, G);
  }, { dy: 80, s0: 0.6 });
  sweepText('اسأل', 540, 1450, 64, G, P(T, 16.1, 16.6), { w: 800 });
  underline(540, 1500, 240, P(T, 16.6, 17.4), G, 8);
  ctx.restore();
}
// 06 · 18.9–22.0  "اختيار المحصول والصنف والتخطيط من قبل الزراعة"
const PLAN = [['plant', 'اختيار المحصول', 19.05], ['seed', 'الصنف', 20.15], ['clip', 'التخطيط', 20.6]];
function s6(T) {
  const a = win(T, 18.9, 22.05, 0.25, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const X = 800;
  pop(X, 620, P(T, 19.0, 19.4), () => { circle(0, 0, 70, G); IC.farm(0, 6, 80, WHITE); }, { s0: 0.3 });
  PLAN.forEach(([ic, label, t0], i) => {
    const y = 860 + i * 230, lp = P(T, t0 - 0.15, t0 + 0.25);
    dashed([[X, 700 + (i ? (i - 1) * 230 + 160 : 0)], [X, y], [X - 90, y]], lp, GRAY, 4);
    iconBubble(ic, X - 170, y, 70, P(T, t0, t0 + 0.4));
    sweepText(label, X - 270 - tw(label, 56, 800) / 2, y, 56, i === 0 ? G : INK, P(T, t0 + 0.1, t0 + 0.6), { w: 800 });
  });
  pop(540, 1600, P(T, 21.0, 21.4), () => { rr(-230, -44, 460, 88, 44); ctx.fillStyle = GL; ctx.fill(); IC.cal(160, 0, 60, G); txt('من قبل الزراعة', -30, 2, 40, G, { w: 800 }); }, { s0: 0.4 });
  ctx.restore();
}
// 07 · 22.0–27.6  "هذي الأشياء اللي تفرق معاك بالربح آخر الموسم.. مو إنتاج أكثر يعني ربح أكثر"
function s7(T) {
  const a = win(T, 22.0, 27.7, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const ringOut = P(T, 24.9, 25.25);
  if (ringOut < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - ringOut;
    sweepText('هذي الأشياء اللي', 540, 470, 54, GRAY, P(T, 22.06, 22.9));
    sweepText('تفرق معاك بالربح', 540, 560, 66, G, P(T, 22.9, 24.2), { w: 800 });
    const fill = ioC(P(T, 22.6, 24.6));
    ring(540, 1060, 260, '#EFEFEF', 34);
    ctx.save(); ctx.lineCap = 'round'; ring(540, 1060, 260, G, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill * 0.999); ctx.restore();
    pop(540, 1060, P(T, 22.4, 22.9), () => { circle(0, 0, 200, GL); ctx.strokeStyle = G; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-110, 60); ctx.lineTo(-40, -10); ctx.lineTo(10, 30); ctx.lineTo(100, -70); ctx.stroke(); ctx.beginPath(); ctx.moveTo(60, -72); ctx.lineTo(102, -72); ctx.lineTo(102, -30); ctx.stroke(); }, { s0: 0.4 });
    pop(540, 1440, P(T, 24.3, 24.7), () => { rr(-200, -42, 400, 84, 42); ctx.fillStyle = G; ctx.fill(); IC.cal(130, 0, 56, WHITE); txt('آخر الموسم', -25, 2, 40, WHITE, { w: 800 }); }, { s0: 0.4 });
    ctx.restore();
  }
  // myth: more production ≠ more profit
  const m = P(T, 25.0, 25.4);
  if (m > 0) {
    pop(540, 820, m, () => { shadowCard(-330, -90, 660, 180, 40); IC.farm(220, 0, 90, G2); txt('إنتاج أكثر', -40, 4, 66, INK, { w: 800 }); }, { dy: 60, s0: 0.7 });
    const neq = P(T, 26.45, 26.75);
    pop(540, 1050, P(T, 25.6, 25.9), () => {
      circle(0, 0, 70, neq > 0 ? G : GRAY); ctx.fillStyle = WHITE; rr(-30, -18, 60, 10, 5); ctx.fill(); rr(-30, 8, 60, 10, 5); ctx.fill();
      if (neq > 0) { ctx.strokeStyle = WHITE; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(18, -40); ctx.lineTo(18 - 36 * oC(neq), -40 + 80 * oC(neq)); ctx.stroke(); }
    }, { dy: 0, s0: 0.2 });
    pop(540, 1280, P(T, 26.4, 26.8), () => { shadowCard(-330, -90, 660, 180, 40, GL); circle(220, 0, 52, G); txt('+', 220, 2, 70, WHITE, { w: 800, dir: 'ltr' }); txt('ربح أكثر', -40, 4, 66, G, { w: 800 }); }, { dy: 60, s0: 0.7 });
    sweepText('مو بالضرورة', 540, 1520, 56, GRAY, P(T, 26.6, 27.2), { w: 800 });
  }
  ctx.restore();
}
// 08 · 28.2–34.2  "مع الاستشارات الزراعية واختيار المحاصيل وإدارة المزارع من الشبكة العالمية"
const SERV = [['chat', 'الاستشارات الزراعية', 28.4], ['plant', 'اختيار المحاصيل', 30.0], ['farm', 'إدارة المزارع', 31.05]];
function s8(T) {
  const a = win(T, 28.1, 34.25, 0.3, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  hlBox('مع الشبكة العالمية:', 540, 520, 54, P(T, 28.2, 28.8));
  SERV.forEach(([ic, label, t0], i) => {
    const y = 760 + i * 210, p = P(T, t0, t0 + 0.5);
    if (p <= 0) return;
    ctx.save(); ctx.translate((1 - oE(p)) * 500, 0); ctx.globalAlpha *= clamp(p * 2);
    shadowCard(130, y - 80, 820, 160, 40);
    circle(860, y, 56, G); IC[ic](860, y, 70, WHITE);
    txt(label, 770, y + 2, 50, INK, { w: 800, a: 'right' });
    check(220, y, 64, P(T, t0 + 0.4, t0 + 0.8), G, 0.16);
    ctx.restore();
  });
  // brand name lands under the list
  const bp = P(T, 32.3, 32.9);
  if (bp > 0 && IMG.logo_full) pop(540, 1530, bp, () => { const im = IMG.logo_full, w = 330, h = w * im.height / im.width; ctx.drawImage(im, -w / 2, -h / 2, w, h); }, { s0: 0.6 });
  ctx.restore();
}
// 09 · 34.3–36.6  "خطة صح.. وربح صح"
function s9(T) {
  const a = win(T, 34.25, 36.65, 0.2, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  [[540, 760, 'خطة', 34.35], [540, 1260, 'ربح', 35.45]].forEach(([x, y, w1, t0]) => {
    pop(x, y, P(T, t0, t0 + 0.45), () => {
      for (let k = 0; k < 2; k++) { ctx.save(); ctx.globalAlpha *= 0.5; ring(0, 0, 215 + k * 26, G2, 2); ctx.restore(); }
      circle(0, 0, 200, G);
      txt(w1, 0, -50, 70, WHITE, { w: 800 });
      txt('صح', 40, 50, 84, WHITE, { w: 800 });
      check(-95, 52, 66, P(T, t0 + 0.3, t0 + 0.7), WHITE, 0.16);
    }, { dy: 0, s0: 0.3 });
  });
  ctx.restore();
}
// 10 · 36.4–39.5  leaf flies in and builds the logo (reference ending), gear rotates in
function s10(T) {
  const p = P(T, 36.35, 37.3); if (p <= 0 || !IMG.gear) return;
  const lp = ioC(p), x = lerp(1250, 540, lp), y = lerp(1450, 880, lp) - Math.sin(Math.PI * lp) * 300;
  const s = 620, im = IMG.icon, h = s * im.height / im.width;
  if (p < 1) { ctx.save(); leaf(x, y, lerp(140, 300, lp), lerp(2.5, -0.15, lp), G); ctx.restore(); }
  const gp = P(T, 37.0, 37.8), lf = P(T, 37.15, 37.45);
  if (gp > 0) { ctx.save(); ctx.globalAlpha = clamp(gp * 2); ctx.translate(540, 820); ctx.rotate((1 - oE(gp)) * -2.2); const k = lerp(0.6, 1, oE(gp)); ctx.scale(k, k); ctx.drawImage(IMG.gear, -s / 2, -h / 2, s, h); ctx.restore(); }
  if (lf > 0) { ctx.save(); ctx.globalAlpha = lf; ctx.drawImage(IMG.leaf, 540 - s / 2, 820 - h / 2, s, h); ctx.restore(); }
  const tp = P(T, 37.7, 38.3);
  if (tp > 0) {
    ctx.save(); ctx.globalAlpha = tp;
    txt('شركة الشبكة العالمية', 540, 1180 + (1 - oE(tp)) * 30, 72, GRAY, { w: 800 });
    txt('للمقاولات الزراعية', 540, 1270 + (1 - oE(tp)) * 30, 46, GRAY, { w: 700 });
    txt('Alshabaka Global Company', 540, 1350, 40, GRAY, { w: 400, dir: 'ltr' });
    ctx.restore();
  }
}

// ================= timeline =================
function render(T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.setLineDash([]); ctx.letterSpacing = '0px';
  bg(T);
  [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].forEach(s => { ctx.save(); s(T); ctx.restore(); });
  logoTop(T);
  leafSweep(T, 18.95, 1); leafSweep(T, 28.25, -1);
  const fi = 1 - P(T, 0, 0.25), fo = P(T, DUR - 0.4, DUR);
  if (fi > 0 || fo > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
Promise.all([
  ...[400, 600, 800, 900].map(w => document.fonts.load(`${w} 40px ${F}`, 'عربي')),
  ...IMGS.map(n => new Promise(r => { const im = new Image(); im.onload = () => { IMG[n] = im; r(); }; im.onerror = r; im.src = 'img/' + n + '.png'; })),
]).then(() => { render(0); window.ready = true; });
