// الشبكة العالمية — "القرار الغلط" — matches the reference reels: white, airy, thin type, typewriter caret, green highlight boxes.
const W = 1080, H = 1920, DUR = 41.9;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const G = '#6EC148', G2 = '#8FD97A', GL = '#EEF8E9', GRAY = '#787878', GRAYL = '#CFCFCF', OR = '#F0941D', WHITE = '#FFFFFF', SOIL = '#3B2A1E';
const F = 'Alexandria';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const oC = t => 1 - Math.pow(1 - t, 3);
const oE = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const ioC = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const oB = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = 0.3, fo = 0.3) => clamp(P(t, a, a + fi)) * (1 - P(t, b - fo, b));
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function plen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function pathPartial(pts, p) {
  if (p <= 0) return false; const L = plen(pts) * clamp(p);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let acc = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); return true; } ctx.lineTo(pts[i][0], pts[i][1]); acc += d; }
  return true;
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); }
function ring(x, y, r, col, lw, a0 = 0, a1 = Math.PI * 2) { ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); }
function font(size, w) { return `${w} ${size}px ${F}`; }
function tw(t, size, w = 400) { ctx.save(); ctx.font = font(size, w); ctx.direction = 'rtl'; const m = ctx.measureText(t).width; ctx.restore(); return m; }
function txt(t, x, y, size, col, w = 400, a = 'center', dir = 'rtl') { ctx.save(); ctx.font = font(size, w); ctx.fillStyle = col; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.direction = dir; ctx.fillText(t, x, y); ctx.restore(); }
function pop(x, y, p, fn, o = {}) { if (p <= 0) return; const s = o.nb ? oE(p) : oB(clamp(p)); ctx.save(); ctx.translate(x, y + (1 - oE(p)) * (o.dy ?? 0)); const k = lerp(o.s0 ?? 0.4, 1, s); ctx.scale(k, k); ctx.globalAlpha *= clamp(p * 3); fn(); ctx.restore(); }
function check(x, y, s, p = 1, col = WHITE, w = 0.14) { if (p <= 0) return; const pts = [[x - 0.3 * s, y + 0.02 * s], [x - 0.08 * s, y + 0.24 * s], [x + 0.34 * s, y - 0.24 * s]]; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (pathPartial(pts, p)) ctx.stroke(); ctx.restore(); }
function dashed(pts, p, col = GRAYL, lw = 3) { ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; if (pathPartial(pts, p)) ctx.stroke(); ctx.restore(); }

// ---------- text building blocks (reference behaviour) ----------
// a "line" is a list of runs [text, style] laid out right->left and centred. style: 'n' normal (thin), 'b' bold green, 'g' gray, 'box' green box
function layout(runs, size) {
  const sp = size * 0.28; const ws = runs.map(([t, st]) => tw(t, size, st === 'n' || st === 'g' ? 400 : 800) + (st === 'box' ? size * 0.7 : 0));
  return { ws, sp, total: ws.reduce((a, b) => a + b, 0) + sp * (runs.length - 1) };
}
// typewriter: reveal characters right->left with a caret; box runs slide in as green blocks
function typeLine(T, runs, y, size, t0, t1, o = {}) {
  const { ws, sp, total } = layout(runs, size);
  const nChars = runs.reduce((s, [t]) => s + t.length, 0);
  const prog = P(T, t0, t1) * nChars;
  let x = 540 + total / 2, used = 0, caretX = null;
  runs.forEach(([t, st], i) => {
    const w = ws[i], n = clamp(prog - used, 0, t.length); used += t.length;
    if (st === 'box') {
      const bp = clamp(n / t.length * 1.4);
      if (bp > 0) {
        const h = size * 1.45, bx = x - w;
        // box slides from the left edge of the word toward the right
        rr(bx, y - h / 2, w * oE(bp), h, size * 0.18); ctx.fillStyle = o.boxCol || G; ctx.fill();
        const tp = clamp((bp - 0.35) / 0.65);
        if (tp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(bx, y - h, w * oE(bp), h * 2); ctx.clip(); ctx.globalAlpha *= tp; txt(t, x - w / 2, y + (1 - oE(tp)) * 14, size, WHITE, 800); ctx.restore(); }
        if (bp < 1) caretX = bx + w * oE(bp);
      }
    } else if (n > 0) {
      const s = t.slice(0, Math.ceil(n));
      const col = st === 'b' ? G : st === 'g' ? GRAY : (o.col || G);
      txt(s, x, y, size, col, st === 'b' ? 800 : 400, 'right');
      if (n < t.length) caretX = x - tw(s, size, st === 'b' ? 800 : 400) - 8;
    }
    x -= w + sp;
  });
  if (caretX === null && prog < nChars + 0.01 && prog > 0) caretX = x + sp - 8;
  if (caretX !== null && T < t1 + 0.35 && Math.floor(T * 4) % 2 === 0) { ctx.fillStyle = o.col || G; ctx.fillRect(caretX - 3, y - size * 0.6, 4, size * 1.2); }
}
// whole-line fade-up (for secondary lines)
function riseLine(T, runs, y, size, t0, o = {}) {
  const p = P(T, t0, t0 + 0.5); if (p <= 0) return;
  const { ws, sp, total } = layout(runs, size); let x = 540 + total / 2;
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(0, (1 - oE(p)) * 30);
  runs.forEach(([t, st], i) => {
    const w = ws[i];
    if (st === 'box') { const h = size * 1.45; rr(x - w, y - h / 2, w, h, size * 0.18); ctx.fillStyle = G; ctx.fill(); txt(t, x - w / 2, y, size, WHITE, 800); }
    else txt(t, x, y, size, st === 'b' ? G : st === 'g' ? GRAY : (o.col || G), st === 'b' ? 800 : 400, 'right');
    x -= w + sp;
  });
  ctx.restore();
}
// chip like "الحرارة ترتفع": round icon on the right, text left of it
function iconChip(T, x, y, t0, icon, col, label, accent, size = 50) {
  const p = P(T, t0, t0 + 0.5); if (p <= 0) return;
  const lw = tw(label, size, 400), aw = accent ? tw(accent, size, 800) + size * 0.25 : 0, R = size * 0.82;
  const total = R * 2 + 24 + lw + aw, right = x + total / 2;
  pop(right - R, y, p, () => { circle(0, 0, R, col); ICON[icon](0, 0, R * 1.1, WHITE); }, { s0: 0.2 });
  const tp = P(T, t0 + 0.2, t0 + 0.7);
  if (tp > 0) {
    const tx = right - R * 2 - 24; ctx.save(); ctx.beginPath(); ctx.rect(tx - (lw + aw) * oC(tp), y - size, (lw + aw) * oC(tp) + 4, size * 2); ctx.clip();
    txt(label, tx, y, size, col, 400, 'right');
    if (accent) txt(accent, tx - lw - size * 0.25, y, size, col, 800, 'right');
    ctx.restore();
  }
  // soft ring pulse like the reference
  const rp = P(T, t0 + 0.3, t0 + 0.9); if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha *= 1 - rp; ring(right - R, y, R + rp * 26, col, 3); ctx.restore(); }
}

// ---------- icons ----------
function leafPath(x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100); ctx.beginPath(); ctx.moveTo(-48, 46); ctx.bezierCurveTo(-52, -10, -10, -40, 50, -48); ctx.bezierCurveTo(44, 0, 10, 48, -48, 46); ctx.closePath(); ctx.restore(); }
function leaf(x, y, s, rot = 0, col = G) { leafPath(x, y, s, rot); ctx.fillStyle = col; ctx.fill(); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.quadraticCurveTo(-5, 0, 28, -22); ctx.stroke(); ctx.restore(); }
const ICON = {
  bag(x, y, s, c) { ctx.fillStyle = c; rr(x - s * 0.3, y - s * 0.32, s * 0.6, s * 0.7, s * 0.08); ctx.fill(); rr(x - s * 0.24, y - s * 0.44, s * 0.48, s * 0.14, s * 0.04); ctx.fill(); },
  clock(x, y, s, c) { ring(x, y, s * 0.34, c, s * 0.08); ctx.strokeStyle = c; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.2); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.14, y + s * 0.08); ctx.stroke(); },
  drop(x, y, s, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - s * 0.45); ctx.bezierCurveTo(x + s * 0.08, y - s * 0.25, x + s * 0.34, y - s * 0.05, x + s * 0.34, y + s * 0.14); ctx.arc(x, y + s * 0.14, s * 0.34, 0, Math.PI); ctx.bezierCurveTo(x - s * 0.34, y - s * 0.05, x - s * 0.08, y - s * 0.25, x, y - s * 0.45); ctx.fill(); },
  warn(x, y, s, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - s * 0.38); ctx.lineTo(x + s * 0.4, y + s * 0.32); ctx.lineTo(x - s * 0.4, y + s * 0.32); ctx.closePath(); ctx.fill(); },
  chat(x, y, s, c) { ctx.fillStyle = c; rr(x - s * 0.38, y - s * 0.3, s * 0.76, s * 0.5, s * 0.14); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.12, y + s * 0.18); ctx.lineTo(x - s * 0.26, y + s * 0.38); ctx.lineTo(x + s * 0.04, y + s * 0.18); ctx.fill(); },
  repeat(x, y, s, c) { ctx.strokeStyle = c; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0.3, Math.PI * 1.7); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + s * 0.3, y - s * 0.02); ctx.lineTo(x + s * 0.42, y - s * 0.2); ctx.lineTo(x + s * 0.16, y - s * 0.2); ctx.fill(); },
  sprout(x, y, s, c) { ctx.strokeStyle = c; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + s * 0.35); ctx.lineTo(x, y - s * 0.05); ctx.stroke(); leafPath(x - s * 0.15, y - s * 0.05, s * 0.34, 0.5); ctx.fillStyle = c; ctx.fill(); leafPath(x + s * 0.15, y - s * 0.18, s * 0.36, 0.95); ctx.fill(); },
  sprinkler(x, y, s, c) { ctx.fillStyle = c; rr(x - s * 0.04, y - s * 0.02, s * 0.08, s * 0.36, s * 0.03); ctx.fill(); rr(x - s * 0.18, y + s * 0.3, s * 0.36, s * 0.07, s * 0.03); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y - s * 0.05, s * 0.12, s * 0.07, 0, 0, 7); ctx.fill(); [-1, 1].forEach(d => { for (let k = 0; k < 2; k++) for (let i = 1; i <= 6; i++) { const u = i / 6, px = x + d * u * s * (0.36 + k * 0.08), py = y - s * 0.08 - Math.sin(u * Math.PI * 0.9) * s * (0.32 - k * 0.1) + u * u * s * 0.12; circle(px, py, s * 0.025 * (1.2 - u * 0.4), c); } }); },
};

// ---------- logo, background ----------
const IMG = {}; const IMGS = ['gear', 'leaf', 'icon', 'leaf_only'];
function logoTop(T) { const a = P(T, 0, 0.6) * (1 - P(T, 37.0, 37.35)); if (a <= 0 || !IMG.icon) return; const w = 190, im = IMG.icon, h = w * im.height / im.width; ctx.save(); ctx.globalAlpha = a; ctx.drawImage(im, 540 - w / 2, 250, w, h); ctx.restore(); }
// soil strip (like the reference's real soil) — textured, procedurally
const soilTex = (() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 260; const g = c.getContext('2d'); const r = rng(77);
  const gr = g.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, '#4A3424'); gr.addColorStop(1, '#22170F'); g.fillStyle = gr; g.fillRect(0, 26, 1080, 240);
  g.beginPath(); g.moveTo(0, 40); for (let x = 0; x <= 1080; x += 12) g.lineTo(x, 26 + r() * 22); g.lineTo(1080, 260); g.lineTo(0, 260); g.fill();
  for (let i = 0; i < 2600; i++) { const x = r() * 1080, y = 30 + r() * 230, s = 1 + r() * 4.5; g.fillStyle = `rgba(${r() < 0.5 ? '110,80,55' : '20,12,8'},${0.35 + r() * 0.5})`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + r() * 0.5), r() * 3, 0, 7); g.fill(); }
  return c; })();

// ================= SCENES =================
// L1 0.28–2.98 "بالزراعة، القرار الغلط ما يبين من أول يوم."
function s1(T) {
  const a = win(T, 0.2, 3.3, 0.1, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['بالزراعة،', 'n'], ['القرار الغلط', 'box']], 880, 74, 0.3, 1.9);
  riseLine(T, [['ما يبين', 'g'], ['من أول يوم', 'b']], 990, 62, 1.95);
  // calendar badge "يوم ١" with pulsing ring (reference "شهر ماي")
  const cp = P(T, 2.2, 2.6);
  pop(540, 1260, cp, () => {
    const pr = P(T, 2.3, 2.9); ring(0, 0, 110 + 20 * (1 - oE(pr)), G, 8 * (1 - pr) + 0.01);
    rr(-62, -56, 124, 116, 18); ctx.fillStyle = G; ctx.fill(); ctx.fillStyle = '#5BAE37'; rr(-62, -56, 124, 34, [18, 18, 0, 0]); ctx.fill();
    ctx.fillStyle = WHITE; rr(-40, -66, 10, 22, 5); ctx.fill(); rr(30, -66, 10, 22, 5); ctx.fill();
    txt('يوم', 0, -38, 22, WHITE, 400); txt('١', 0, 18, 64, WHITE, 800);
  }, { s0: 0.3 });
  ctx.restore();
}
// L2 3.47–6.55 "بذرة ضعيفة.. تطلع مشكلتها بعد فترة من النمو."  — seedling grows from real-looking soil, then wilts
function seedling(x, gy, g, wilt) {
  if (g <= 0) return;
  const h = 360 * oC(g), bend = wilt * 0.9;
  const stem = []; for (let i = 0; i <= 20; i++) { const u = i / 20; stem.push([x + Math.sin(u * 1.4) * bend * 70 * u, gy - h * u + bend * 60 * u * u]); }
  ctx.save(); ctx.lineCap = 'round';
  const sc = lerpColor('#5DA83A', '#B8A44A', wilt);
  ctx.strokeStyle = sc; ctx.lineWidth = 12; if (pathPartial(stem, 1)) ctx.stroke();
  const top = stem[20];
  const lc1 = lerpColor('#7CCB4E', '#D2B556', wilt), lc2 = lerpColor('#69BC40', '#C49A3E', wilt);
  const ls = 150 * clamp((g - 0.35) / 0.65);
  if (ls > 0) {
    [[-1, lc1], [1, lc2]].forEach(([d, c]) => {
      ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(d * (0.55 + wilt * 0.9));
      const gr = ctx.createLinearGradient(0, 0, d * ls, -ls * 0.3); gr.addColorStop(0, c); gr.addColorStop(1, lerpColor(c, '#FFFFFF', 0.15));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(d * ls * 0.5, -ls * 0.55, d * ls, -ls * 0.12); ctx.quadraticCurveTo(d * ls * 0.55, ls * 0.18, 0, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(d * ls * 0.5, -ls * 0.2, d * ls * 0.9, -ls * 0.12); ctx.stroke();
      ctx.restore();
    });
  }
  ctx.restore();
}
function lerpColor(a, b, t) { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t)).toString(16).padStart(2, '0')).join(''); }
function s2(T) {
  const a = win(T, 3.3, 6.95, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['بذرة', 'n'], ['ضعيفة..', 'box']], 880, 74, 3.45, 4.35);
  riseLine(T, [['تطلع مشكلتها', 'g'], ['بعد فترة من النمو', 'b']], 990, 58, 4.45);
  const sp = P(T, 3.4, 3.8);
  ctx.save(); ctx.translate(0, (1 - oE(sp)) * 260); ctx.drawImage(soilTex, 0, H - 260); ctx.restore();
  seedling(540, H - 225, P(T, 3.8, 5.3), ioC(P(T, 5.45, 6.4)));
  // warning badge appears as the problem shows
  pop(700, 1330, P(T, 5.6, 5.95), () => { circle(0, 0, 46, OR); txt('!', 0, 4, 56, WHITE, 800); }, { s0: 0.2 });
  ctx.restore();
}
// L3 7.21–10.49 "تسميد مو مناسب.. تحس فيه بعدين.. مو الحين."
function s3(T) {
  const a = win(T, 7.0, 10.95, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  iconChip(T, 540, 880, 7.2, 'bag', OR, 'تسميد', 'مو مناسب..', 60);
  // timeline الحين ---- بعدين
  const lp = P(T, 8.75, 9.4), y = 1140, xR = 800, xL = 280;
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(lp * 2);
    ctx.strokeStyle = GRAYL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(lerp(xR, xL, oC(lp)), y); ctx.stroke();
    circle(xR, y, 18, GRAY); txt('الحين', xR, y + 62, 42, GRAY, 400);
    ctx.restore();
    const dp = P(T, 9.1, 9.5); if (dp > 0) { pop(xL, y, dp, () => { circle(0, 0, 26, OR); }, { s0: 0.2 }); ctx.save(); ctx.globalAlpha *= dp; txt('بعدين', xL, y + 62, 42, OR, 800); ctx.restore(); }
    // traveller dot
    const tp = ioC(P(T, 8.9, 9.6)); if (tp > 0 && tp < 1) circle(lerp(xR, xL, tp), y, 12, OR);
  }
  riseLine(T, [['تحس فيه', 'g'], ['بعدين..', 'b']], 990, 58, 8.8, { col: GRAY });
  // "مو الحين." — strike the "now" dot
  const st = P(T, 10.1, 10.4);
  if (st > 0) { ctx.save(); ctx.strokeStyle = OR; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xR - 30, y - 30); ctx.lineTo(xR - 30 + 60 * oC(st), y - 30 + 60 * oC(st)); ctx.stroke(); ctx.restore(); txt('مو الحين.', 540, 1330, 54, GRAY, 800); }
  ctx.restore();
}
// L4 11.22–15.42 "تصميم ري مو مضبوط.. تشوف أثره لمن يزيد احتياج النبتة للماي."
function arcText(t, cx, cy, r, size, col, a0, p) { // text along a circle (reference "ضبط الري بهالفترة")
  ctx.save(); ctx.font = font(size, 800); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  const chars = [...t]; const total = ctx.measureText(t).width, ang = total / r; let a = a0 + ang / 2; // rtl: start on the right, go left (counter-clockwise on top)
  const n = Math.ceil(chars.length * clamp(p));
  // draw whole string by measuring progressive substrings so Arabic joins correctly
  for (let i = 0; i < n; i++) {
    const pre = ctx.measureText(t.slice(0, i)).width, cur = ctx.measureText(t.slice(0, i + 1)).width - pre;
    const aa = a0 + ang / 2 - (pre + cur / 2) / r;
    ctx.save(); ctx.translate(cx + Math.cos(aa) * r, cy + Math.sin(aa) * r); ctx.rotate(aa + Math.PI / 2);
    ctx.beginPath(); ctx.rect(-cur / 2 - 1, -size, cur + 2, size * 2); ctx.clip();
    ctx.fillText(t, (total / 2 - pre - cur / 2) * -1 + 0, 0); ctx.restore();
  }
  ctx.restore();
}
function s4(T) {
  const a = win(T, 11.05, 15.85, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const gray = P(T, 13.0, 13.6), col = lerpColor(G, '#8C8C8C', gray);
  pop(540, 860, P(T, 11.2, 11.6), () => {
    circle(0, 0, 120, col); ICON.sprinkler(0, 20, 170, WHITE);
    for (let k = 0; k < 2; k++) { ctx.save(); ctx.globalAlpha *= 0.35; ring(0, 0, 138 + k * 14, col, 2); ctx.restore(); }
  }, { s0: 0.3 });
  arcText('تصميم ري مو مضبوط', 540, 860, 190, 42, col, -Math.PI / 2, P(T, 11.4, 12.6));
  riseLine(T, [['تشوف', 'g'], ['أثره', 'b']], 1150, 64, 12.95, { col: GRAY });
  // water need meter rising
  const mp = P(T, 13.6, 15.2), mx = 540, my0 = 1520, mh = 230;
  pop(mx, my0 - mh / 2, P(T, 13.4, 13.8), () => {
    rr(-150, -mh / 2 - 10, 300, mh + 20, 40); ctx.fillStyle = GL; ctx.fill();
    const lv = oC(mp); ctx.save(); rr(-150, -mh / 2 - 10, 300, mh + 20, 40); ctx.clip(); ctx.fillStyle = G2;
    ctx.beginPath(); ctx.moveTo(-150, mh / 2 + 10); for (let x = -150; x <= 150; x += 10) ctx.lineTo(x, mh / 2 + 10 - (mh + 20) * lv + Math.sin(x / 20 + T * 6) * 6); ctx.lineTo(150, mh / 2 + 10); ctx.fill(); ctx.restore();
    ICON.drop(0, 0, 110, lv > 0.5 ? WHITE : G);
  }, { s0: 0.5 });
  riseLine(T, [['لمن يزيد احتياج النبتة', 'g'], ['للماي', 'b']], 1730, 48, 13.7, { col: GRAY });
  ctx.restore();
}
// L5 16.18–18.76 "تسوية مو دقيقة.. تكتشفها وقت المطر."
function s5(T) {
  const a = win(T, 16.0, 19.25, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['تسوية', 'n'], ['مو دقيقة..', 'box']], 880, 74, 16.15, 17.2);
  riseLine(T, [['تكتشفها', 'g'], ['وقت المطر', 'b']], 990, 62, 17.6);
  // uneven ground line (laser-level dashed reference above)
  const gp = P(T, 16.3, 17.0), gy = 1450;
  const ground = []; for (let x = 120; x <= 960; x += 10) ground.push([x, gy + Math.sin((x - 120) / 120) * 28 + Math.sin((x - 120) / 47) * 10]);
  dashed([[120, gy - 70], [960, gy - 70]], gp, G2, 3);
  ctx.save(); ctx.strokeStyle = GRAY; ctx.lineWidth = 8; ctx.lineCap = 'round'; if (pathPartial(ground, oC(gp))) ctx.stroke(); ctx.restore();
  // rain + puddle in the low spot
  const rp = P(T, 17.65, 18.0);
  if (rp > 0) {
    pop(540, 1170, rp, () => { ctx.fillStyle = GRAYL; circle(-50, 0, 46, GRAYL); circle(10, -24, 58, GRAYL); circle(70, 4, 42, GRAYL); rr(-96, 0, 210, 46, 23); ctx.fill(); }, { s0: 0.5 });
    const r = rng(9); for (let i = 0; i < 14; i++) { const x = 430 + r() * 220, sp = 600 + r() * 300, u = ((T - 17.7) * sp / 300 + r()) % 1; ctx.save(); ctx.globalAlpha *= rp * 0.8; ctx.strokeStyle = '#7DB7E8'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, 1230 + u * 200); ctx.lineTo(x - 6, 1260 + u * 200); ctx.stroke(); ctx.restore(); }
    const pud = P(T, 18.0, 18.8); if (pud > 0) { ctx.save(); ctx.fillStyle = 'rgba(125,183,232,0.75)'; ctx.beginPath(); ctx.ellipse(448, gy + 36, 90 * oC(pud), 14 * oC(pud), 0, 0, 7); ctx.fill(); ctx.restore(); pop(448, gy + 110, P(T, 18.2, 18.5), () => { circle(0, 0, 30, OR); txt('!', 0, 3, 38, WHITE, 800); }, { s0: 0.2 }); }
  }
  ctx.restore();
}
// L6 19.60–23.37 "المشكلة مو بالحدث اللي صار.. تكون بالقرار اللي جا قبله."
function nodeChip(x, y, label, col, fill, p, icon) { pop(x, y, p, () => { const w = tw(label, 48, 800) + 130; rr(-w / 2, -50, w, 100, 50); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); circle(w / 2 - 50, 0, 32, col); ICON[icon](w / 2 - 50, 0, 46, WHITE); txt(label, -30, 2, 48, col, 800); }, { s0: 0.4 }); }
function s6(T) {
  const a = win(T, 19.45, 23.85, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['المشكلة', 'n'], ['مو بالحدث', 'b'], ['اللي صار..', 'n']], 820, 60, 19.6, 21.2, { col: GRAY });
  // flowchart like the reference: decision -> (time) -> event, dashed bracket
  nodeChip(540, 1420, 'الحدث', GRAY, '#F4F4F4', P(T, 20.0, 20.4), 'warn');
  const lp = P(T, 21.7, 22.4);
  dashed([[700, 1420], [860, 1420], [860, 1120], [700, 1120]], lp, GRAYL, 4);
  if (lp > 0.95) { ctx.fillStyle = GRAYL; ctx.beginPath(); ctx.moveTo(700, 1420); ctx.lineTo(724, 1406); ctx.lineTo(724, 1434); ctx.fill(); }
  nodeChip(540, 1120, 'القرار', G, GL, P(T, 21.75, 22.15), 'sprout');
  pop(910, 1270, P(T, 22.0, 22.3), () => { ICON.clock(0, 0, 70, GRAY); }, { s0: 0.3 });
  riseLine(T, [['تكون', 'g'], ['بالقرار', 'box'], ['اللي جا قبله', 'g']], 940, 58, 21.75);
  ctx.restore();
}
// L7 24.09–27.31 "علشان جذي، المتابعة من البداية تسوي فرق كبير."
function s7(T) {
  const a = win(T, 23.95, 27.75, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['علشان جذي،', 'n'], ['المتابعة', 'b']], 820, 66, 24.1, 25.0, { col: GRAY });
  riseLine(T, [['من البداية', 'g']], 925, 56, 25.0);
  // pie circle filling (reference "أكثر مما تتخيل")
  const fp = ioC(P(T, 25.4, 27.0)), cx = 540, cy = 1300, R = 230;
  pop(cx, cy, P(T, 25.2, 25.6), () => {
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.globalAlpha *= 0.4; ring(0, 0, R + 14 + k * 16, G2, 2); ctx.restore(); }
    circle(0, 0, R, WHITE); ring(0, 0, R, GL, 3);
    if (fp > 0) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fp); ctx.closePath(); ctx.fillStyle = G; ctx.fill(); }
    const tp = P(T, 26.3, 26.8);
    if (tp > 0) { ctx.globalAlpha *= tp; txt('تسوي', 0, -40, 50, fp > 0.6 ? WHITE : G, 400); txt('فرق كبير', 0, 34, 66, fp > 0.6 ? WHITE : G, 800); }
  }, { s0: 0.3 });
  ctx.restore();
}
// L8 27.97–34.02 "مع الاستشارات الزراعية، المتابعة الدورية، وإرشادات اختيار المحاصيل من الشبكة العالمية.."
const LIST = [['chat', 'الاستشارات الزراعية', 28.05], ['repeat', 'المتابعة الدورية', 29.6], ['sprout', 'إرشادات اختيار المحاصيل', 31.25]];
function s8(T) {
  const a = win(T, 27.8, 34.4, 0.25, 0.35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const hp = P(T, 27.95, 28.5);
  if (hp > 0) { const w = 560, h = 92, x = 540 + w / 2; rr(x - w * oE(hp), 760 - h / 2, w * oE(hp), h, 14); ctx.fillStyle = G; ctx.fill(); if (hp > 0.4) { ctx.save(); ctx.globalAlpha *= P(hp, 0.4, 1); txt('مع الشبكة العالمية:', 540, 762, 50, WHITE, 800); ctx.restore(); } }
  LIST.forEach(([ic, label, t0], i) => {
    const y = 940 + i * 150, p = P(T, t0, t0 + 0.45); if (p <= 0) return;
    const lw = tw(label, 50, 400), R = 40, right = 540 + (lw + R * 2 + 26) / 2;
    pop(right - R, y, p, () => { circle(0, 0, R, G); ICON[ic](0, 0, R * 1.2, WHITE); }, { s0: 0.2 });
    const tp = P(T, t0 + 0.15, t0 + 0.6); ctx.save(); ctx.beginPath(); ctx.rect(right - R * 2 - 26 - lw * oC(tp) - 4, y - 50, lw * oC(tp) + 8, 100); ctx.clip(); txt(label, right - R * 2 - 26, y, 50, GRAY, 400, 'right'); ctx.restore();
  });
  // brand name lands as VO says "من الشبكة العالمية"
  const bp = P(T, 32.6, 33.1);
  if (bp > 0 && IMG.icon) pop(540, 1470, bp, () => { const w = 150, im = IMG.icon, h = w * im.height / im.width; ctx.drawImage(im, -w / 2, -h / 2 - 20, w, h); txt('الشبكة العالمية', 0, h / 2 + 30, 50, GRAY, 800); }, { s0: 0.5 });
  ctx.restore();
}
// L9 34.62–36.99 "قرارك اليوم.. يحدد نتيجتك بعدين."
function s9(T) {
  const a = win(T, 34.45, 37.25, 0.25, 0.3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  typeLine(T, [['قرارك', 'n'], ['اليوم..', 'box']], 880, 78, 34.6, 35.4);
  const p2 = P(T, 35.8, 36.3);
  riseLine(T, [['يحدد', 'g'], ['نتيجتك', 'b'], ['بعدين', 'g']], 1000, 64, 35.8);
  // underline -> check (reference "المصدر الصح")
  const ul = P(T, 36.1, 36.6), w = 420;
  if (ul > 0 && ul < 1) { ctx.save(); ctx.strokeStyle = G; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540 + w / 2, 1065); ctx.lineTo(540 + w / 2 - w * oC(ul), 1065); ctx.stroke(); ctx.restore(); }
  pop(540, 1300, P(T, 36.3, 36.7), () => { circle(0, 0, 110, G); for (let k = 0; k < 2; k++) { ctx.save(); ctx.globalAlpha *= 0.4; ring(0, 0, 126 + k * 16, G2, 2); ctx.restore(); } check(0, 6, 120, P(T, 36.45, 36.9)); }, { s0: 0.2 });
  ctx.restore();
}
// END 37.0–41.9 — reference ending: the logo's own leaf sweeps in big with motion blur, turns upright,
// shrinks back into place; the gear fades in behind it; company name fades in line by line.
const LOGO = { w: 520, cy: 860 };
function leafState(t) { // centre x,y, scale (relative to final), rotation
  const k = LOGO.w / 1480, iw = 1480 * k, ih = 1240 * k, tlx = 540 - iw / 2, tly = LOGO.cy - ih / 2;
  const fx = tlx + (170 + 650) * k, fy = tly + (440 + 405) * k;
  const A = [-420, 1180, 2.7, -0.10], B = [580, 760, 2.15, -0.95], Cc = [fx, fy, 1, 0];
  const pa = P(t, 37.0, 37.65), pb = P(t, 37.65, 38.45);
  if (pb <= 0) { const e = oC(pa); return A.map((v, i) => lerp(v, B[i], e)); }
  const e = ioC(pb); return B.map((v, i) => lerp(v, Cc[i], e)).concat([]);
}
function drawLeafAt(st, alpha = 1) {
  const im = IMG.leaf_only; if (!im) return; const k = LOGO.w / 1480 * st[2], w = im.width * k, h = im.height * k;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(st[0], st[1]); ctx.rotate(st[3]); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
function s10(T) {
  if (T < 37.0 || !IMG.gear) return;
  const k = LOGO.w / 1480, iw = 1480 * k, ih = 1240 * k;
  // gear first (behind the leaf)
  const gp = P(T, 38.25, 38.9);
  if (gp > 0) {
    ctx.save(); ctx.translate(540, LOGO.cy); ctx.rotate(lerp(-0.28, 0, oC(gp))); const sc = lerp(0.93, 1, oC(gp)); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(gp * 1.6); ctx.drawImage(IMG.gear, -iw / 2, -ih / 2, iw, ih);
    if (gp < 1) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = `rgba(255,255,255,${0.65 * (1 - oC(gp))})`; ctx.fillRect(-iw / 2, -ih / 2, iw, ih); }
    ctx.restore();
  }
  // motion-blurred leaf
  const st = leafState(T);
  const fast = 1 - P(T, 37.55, 38.2);
  if (fast > 0) for (let i = 6; i >= 1; i--) drawLeafAt(leafState(T - i * 0.014), 0.10 * fast);
  drawLeafAt(st, clamp(P(T, 37.0, 37.08) * 1));
  // company name
  const t1 = P(T, 38.9, 39.45), t2 = P(T, 39.35, 39.9);
  if (t1 > 0) { ctx.save(); ctx.globalAlpha = oC(t1); txt('شركة الشبكة العالمية', 540, LOGO.cy + 300 + (1 - oE(t1)) * 22, 66, GRAY, 800); ctx.restore(); }
  if (t2 > 0) { ctx.save(); ctx.globalAlpha = oC(t2); txt('للمقاولات الزراعية', 540, LOGO.cy + 375 + (1 - oE(t2)) * 18, 40, GRAY, 600); ctx.restore(); }
}

function render(T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.setLineDash([]);
  ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H);
  [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].forEach(s => { ctx.save(); s(T); ctx.restore(); });
  logoTop(T);
  const fi = 1 - P(T, 0, 0.2), fo = P(T, DUR - 0.4, DUR);
  if (fi > 0 || fo > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
Promise.all([
  ...[400, 600, 800].map(w => document.fonts.load(`${w} 40px ${F}`, 'عربي')),
  ...IMGS.map(n => new Promise(r => { const im = new Image(); im.onload = () => { IMG[n] = im; r(); }; im.onerror = r; im.src = 'img/' + n + '.png'; })),
]).then(() => { render(0); window.ready = true; });
