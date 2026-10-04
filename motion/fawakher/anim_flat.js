// فواخر — professional flat motion graphics (Zimou-style language, Fawakher identity). render(t) is deterministic.
const W = 1080, H = 1920, DUR = 68.39;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const K = {
  white: '#FBF9F4', cream: '#F3EFE6', green: '#2F5444', green2: '#3E6B57', dark: '#1E382D', leaf: '#2E7D62', lightg: '#DCE8DD',
  mint: '#B9D3BE', gold: '#C8B75C', goldl: '#E9DDA6', goldd: '#A39237', ink: '#1F2F27', gray: '#8A948E', date: '#6B3A1E', date2: '#9A5A2C', trunk: '#A07A4E'
};
const AR = 'Tajawal';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const oC = t => 1 - Math.pow(1 - t, 3);
const oE = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const ioC = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const iC = t => t * t * t;
const oB = t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const spring = (u, z = 6, w = 13) => (u <= 0 ? 0 : 1 - Math.exp(-z * u) * Math.cos(w * u));
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function quad(a, c, b, n = 24) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return o; }
function plen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function pathPartial(pts, p) {
  if (p <= 0) return false; const L = plen(pts) * clamp(p);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let acc = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); return true; } ctx.lineTo(pts[i][0], pts[i][1]); acc += d; }
  return true;
}

// ---------- primitives ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function card(x, y, w, h, r = 28, fill = '#FFFFFF', o = {}) {
  ctx.save();
  ctx.shadowColor = o.sh || 'rgba(31,56,45,0.14)'; ctx.shadowBlur = o.blur ?? 46; ctx.shadowOffsetY = o.oy ?? 18;
  rr(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  if (o.stroke) { ctx.save(); rr(x, y, w, h, r); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.stroke(); ctx.restore(); }
}
function popIn(x, y, p, fn, o = {}) { // scale-in with overshoot around (x,y)
  if (p <= 0) return; const s = o.noBounce ? oE(p) : oB(clamp(p));
  ctx.save(); ctx.translate(x, y + (1 - oE(p)) * (o.dy ?? 60)); ctx.scale(lerp(o.s0 ?? 0.6, 1, s), lerp(o.s0 ?? 0.6, 1, s)); if (o.rot) ctx.rotate(o.rot * (1 - oE(p))); ctx.globalAlpha *= clamp(p * 3); fn(); ctx.restore();
}
function text(t, x, y, size, col, o = {}) {
  ctx.save(); ctx.font = `${o.w || 700} ${size}px ${o.f || AR}`; ctx.fillStyle = col; ctx.textAlign = o.a || 'center'; ctx.textBaseline = o.b || 'alphabetic'; ctx.direction = o.dir || 'rtl';
  if (o.ls) ctx.letterSpacing = o.ls; ctx.fillText(t, x, y); ctx.restore();
}
function chip(x, y, label, p, o = {}) { // pill centred at x,y
  if (p <= 0) return;
  ctx.save(); ctx.font = `${o.w || 700} ${o.size || 40}px ${AR}`; ctx.direction = 'rtl';
  const tw = ctx.measureText(label).width, h = (o.size || 40) * 1.8, ic = o.icon ? h * 0.7 : 0, w = tw + h * 0.9 + ic;
  popIn(x, y, p, () => {
    card(-w / 2, -h / 2, w, h, h / 2, o.bg || '#FFFFFF', { blur: o.flat ? 0 : 30, oy: o.flat ? 0 : 10 });
    ctx.fillStyle = o.col || K.ink; ctx.font = `${o.w || 700} ${o.size || 40}px ${AR}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    ctx.fillText(label, -ic / 2, (o.size || 40) * 0.06);
    if (o.icon) o.icon(w / 2 - h * 0.5, 0, h * 0.62);
  }, { dy: 30, s0: 0.5 });
  ctx.restore();
}
function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); }
function check(x, y, s, p = 1, col = '#fff', w = 0.16) {
  if (p <= 0) return; const pts = [[x - 0.3 * s, y + 0.02 * s], [x - 0.08 * s, y + 0.24 * s], [x + 0.34 * s, y - 0.22 * s]];
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (pathPartial(pts, p)) ctx.stroke(); ctx.restore();
}
function checkBadge(x, y, s, p) { popIn(x, y, p, () => { circle(0, 0, s / 2, K.leaf); check(0, 0, s * 0.9, clamp(p * 2 - 0.4)); }, { dy: 0, s0: 0.2 }); }
function dateIcon(x, y, s, rot = -0.4, col = K.date) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-s * 0.2, -s * 0.38, s * 0.13, s * 0.34, -0.15, 0, 7); ctx.fill();
  ctx.fillStyle = K.goldd; ctx.beginPath(); ctx.ellipse(0, -s * 0.98, s * 0.18, s * 0.09, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function person(x, y, s, bisht = K.leaf, skin = '#F1D3AE') { // flat Gulf man: dishdasha, bisht, ghutra, agal; (x,y)=feet
  ctx.save();
  rr(x - s * 0.4, y - s * 1.15, s * 0.8, s * 1.15, [s * 0.4, s * 0.4, s * 0.08, s * 0.08]); ctx.fillStyle = '#ECEBE4'; ctx.fill();
  [[-1], [1]].forEach(([d]) => { ctx.fillStyle = bisht; ctx.beginPath(); ctx.moveTo(x + d * s * 0.12, y - s * 1.1); ctx.quadraticCurveTo(x + d * s * 0.46, y - s * 1.1, x + d * s * 0.47, y - s * 0.7); ctx.lineTo(x + d * s * 0.47, y); ctx.lineTo(x + d * s * 0.2, y); ctx.quadraticCurveTo(x + d * s * 0.16, y - s * 0.6, x + d * s * 0.12, y - s * 1.1); ctx.fill(); ctx.strokeStyle = K.gold; ctx.lineWidth = s * 0.02; ctx.beginPath(); ctx.moveTo(x + d * s * 0.13, y - s * 1.08); ctx.quadraticCurveTo(x + d * s * 0.17, y - s * 0.6, x + d * s * 0.2, y); ctx.stroke(); });
  circle(x, y - s * 1.38, s * 0.21, skin);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath();
  ctx.moveTo(x - s * 0.33, y - s * 1.0); ctx.quadraticCurveTo(x - s * 0.36, y - s * 1.74, x, y - s * 1.72); ctx.quadraticCurveTo(x + s * 0.36, y - s * 1.74, x + s * 0.33, y - s * 1.0);
  ctx.lineTo(x + s * 0.18, y - s * 1.12); ctx.quadraticCurveTo(x + s * 0.2, y - s * 1.52, x, y - s * 1.56); ctx.quadraticCurveTo(x - s * 0.2, y - s * 1.52, x - s * 0.18, y - s * 1.12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = K.ink; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.ellipse(x, y - s * 1.63, s * 0.24, s * 0.055, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
function pinIcon(x, y, s, col = K.leaf) { // tip at x,y
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); const r = s * 0.42;
  ctx.moveTo(x, y); ctx.bezierCurveTo(x - r * 0.4, y - s * 0.35, x - r, y - s * 0.55, x - r, y - s * 0.78); ctx.arc(x, y - s * 0.78, r, Math.PI, 0); ctx.bezierCurveTo(x + r, y - s * 0.55, x + r * 0.4, y - s * 0.35, x, y); ctx.fill();
  circle(x, y - s * 0.78, r * 0.42, '#FFFFFF'); ctx.restore();
}
function flatPalm(x, by, h, p, o = {}) { // flat illustrated palm; p 0..1
  const segN = 9, tp = clamp(p / 0.5), fp = clamp((p - 0.4) / 0.6);
  const top = [x + h * 0.05, by - h];
  for (let i = 0; i < segN; i++) {
    const q = clamp(tp * segN - i); if (q <= 0) break;
    const u = i / segN, cx = lerp(x, top[0], u * u), cy = lerp(by, top[1], u) - h / segN * 0.5, w = lerp(h * 0.075, h * 0.05, u);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(oB(q), oB(q)); rr(-w / 2, -h / segN * 0.55, w, h / segN * 1.1, w * 0.4); ctx.fillStyle = i % 2 ? K.trunk : '#B48B5C'; ctx.fill(); ctx.restore();
  }
  const N = o.fronds || 9;
  for (let i = 0; i < N; i++) {
    const q = clamp(fp * 1.7 - i * 0.07); if (q <= 0) continue;
    const a = lerp(-Math.PI * 0.95, -Math.PI * 0.05, i / (N - 1)) + Math.sin((o.t || 0) * 1.3 + i) * 0.03;
    const L = h * 0.5 * oB(q), droop = (1 - Math.abs(Math.sin(a))) * L * 0.55;
    const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.6 + droop], c = [top[0] + Math.cos(a) * L * 0.5, top[1] + Math.sin(a) * L * 0.6 - L * 0.12];
    const nx = -(tip[1] - top[1]), ny = tip[0] - top[0], nl = Math.hypot(nx, ny) || 1, wd = h * 0.06;
    ctx.fillStyle = i % 2 ? (o.c1 || '#5E8C6A') : (o.c2 || '#77A37F');
    ctx.beginPath(); ctx.moveTo(top[0], top[1]);
    ctx.quadraticCurveTo(c[0] + nx / nl * wd, c[1] + ny / nl * wd, tip[0], tip[1]);
    ctx.quadraticCurveTo(c[0] - nx / nl * wd * 0.4, c[1] - ny / nl * wd * 0.4, top[0], top[1]); ctx.fill();
  }
  if (o.dates > 0) for (let k = 0; k < 14; k++) { if (k / 14 > o.dates) break; const sd = k % 2 ? 1 : -1; dateIcon(top[0] + sd * (h * 0.05 + (k % 4) * h * 0.012), top[1] + h * 0.06 + Math.floor(k / 2) * h * 0.02, h * 0.018, sd * 0.3); }
  return top;
}
// Fawakher palm-fan mark
function logoFan(x, y, s, p = 1, col = K.leaf) {
  const N = 15;
  for (let i = 0; i < N; i++) {
    const q = clamp(p * 1.8 - i * 0.055); if (q <= 0) continue;
    const a = lerp(Math.PI * 1.08, Math.PI * 1.62, i / (N - 1)), L = s * (0.78 + 0.22 * Math.sin(Math.PI * i / (N - 1)));
    const tip = [x + Math.cos(a) * L, y + Math.sin(a) * L], ctl = [x + Math.cos(a + 0.32) * L * 0.55, y + Math.sin(a + 0.32) * L * 0.55];
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, s * 0.011); if (pathPartial(quad([x, y], ctl, tip, 24), q)) ctx.stroke(); ctx.restore();
  }
}
function logoFull(cx, cy, sc, p = 1, dark = false) {
  const fanP = P(p, 0, 0.6), tP = P(p, 0.35, 0.85), eP = P(p, 0.55, 1);
  ctx.save(); ctx.font = `300 ${150 * sc}px ${AR}`; ctx.direction = 'rtl'; const tw = ctx.measureText('فواخر').width;
  ctx.font = `300 ${46 * sc}px Jost`; ctx.letterSpacing = `${16 * sc}px`; const ew = ctx.measureText('FAWAKHER').width - 16 * sc; ctx.letterSpacing = '0px';
  const fanW = 290 * sc, gap = 70 * sc, textW = Math.max(tw, ew), left = cx - (fanW + gap + textW) / 2, base = left + fanW, tx = base + gap;
  logoFan(base, cy + 58 * sc, 300 * sc, fanP, dark ? K.goldl : K.leaf);
  const col = dark ? K.gold : K.goldd;
  ctx.save(); ctx.globalAlpha *= tP; ctx.fillStyle = col; ctx.font = `300 ${150 * sc}px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillText('فواخر', tx, cy - 8 * sc + (1 - oE(tP)) * 30); ctx.restore();
  ctx.save(); ctx.globalAlpha *= eP; ctx.fillStyle = col; ctx.font = `300 ${46 * sc}px Jost`; ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.letterSpacing = `${lerp(30, 16, oE(eP)) * sc}px`; ctx.fillText('FAWAKHER', tx + 4 * sc, cy + 60 * sc); ctx.restore();
  ctx.restore();
}
const IMG = {}; const IMG_LIST = ['vvip', 'vip', 'jood1', 'jood2', 'creme', 'caramel', 'nuts', 'give', 'tray', 'tray2', 'balls'];
function photoCard(name, cx, cy, w, h, p, o = {}) {
  const im = IMG[name]; if (!im || p <= 0) return;
  popIn(cx, cy, p, () => {
    ctx.rotate(o.rot || 0);
    card(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 30, '#FFFFFF', { blur: 50, oy: 22 });
    ctx.save(); rr(-w / 2, -h / 2, w, h, 20); ctx.clip();
    const k = Math.max(w / im.width, h / im.height) * (1.04 + 0.05 * (o.zoom || 0)); ctx.drawImage(im, -im.width * k / 2, -im.height * k / 2, im.width * k, im.height * k); ctx.restore();
  }, { dy: o.dy ?? 120, s0: o.s0 ?? 0.7, rot: o.rotIn || 0 });
}

// ---------- headings (voiceover text, Zimou-style: top-right, word by word) ----------
const HEADS = [
  { lines: [['تبون تعرفون السر', 0.71, 2.1], ['ورى تمور فواخر؟', 2.1, 3.41]], hl: ['السر', 'فواخر؟'], out: 3.72 },
  { lines: [['خلكم معاي', 3.81, 4.6], ['وسمعوا القصة!', 4.6, 5.48]], hl: ['القصة!'], out: 5.85 },
  { lines: [['كان يا ماكان..', 6.29, 7.3], ['كان في هاوي', 7.35, 8.1], ['لعالم التمور', 8.1, 8.94]], hl: ['التمور', 'ماكان..'], out: 9.4, dark: 1 },
  { lines: [['طريقة زراعتها..', 9.66, 10.81], ['أنواعها..', 11.04, 11.9], ['ورعايتها على مدار العام..', 12.05, 13.63]], hl: ['زراعتها..', 'أنواعها..', 'ورعايتها'], out: 14.7, size: 84 },
  { lines: [['كبر الشغف', 15.11, 16.0], ['وزاد الفضول..', 16.0, 16.9]], hl: ['الشغف', 'الفضول..'], out: 17.0 },
  { lines: [['وابتدت عملية', 17.19, 18.3], ['البحث والاستكشاف..', 18.3, 19.74]], hl: ['البحث', 'والاستكشاف..'], out: 19.8 },
  { lines: [['عن نخلة غنية منتجه', 19.92, 21.7], ['لثمار ذات جودة عالية', 21.85, 23.0], ['في الخليج...', 23.0, 23.92]], hl: ['نخلة', 'جودة', 'عالية', 'الخليج...'], out: 24.5, size: 82 },
  { lines: [['لين ما لقاها', 24.66, 25.5], ['في السعودية..', 25.5, 26.42]], hl: ['السعودية..'], out: 26.75 },
  { lines: [['وصار من رواد', 26.86, 27.9], ['مهرجان بريدة', 27.9, 29.1], ['في "مزارع القصيم"..', 29.2, 30.36]], hl: ['بريدة', '"مزارع', 'القصيم"..'], out: 30.5, size: 86 },
  { lines: [['أكبر مهرجان سنوي', 30.91, 32.2], ['في العالم..', 32.2, 33.1]], hl: ['أكبر', 'العالم..'], out: 33.2, dark: 1 },
  { lines: [['الي ينتج أطيب', 33.3, 34.2], ['ثمار الأرض', 34.2, 35.0], ['في موسم الحصاد!', 35.0, 36.51]], hl: ['أطيب', 'الحصاد!'], out: 36.9, dark: 1 },
  { lines: [['هني...', 37.17, 37.6], ['ينقولون المحاصيل..', 37.9, 39.32]], hl: ['المحاصيل..'], out: 39.62 },
  { lines: [['ويفرزون التمر حسب', 39.72, 41.1], ['الحجم والنوع والجودة..', 41.2, 42.85]], hl: ['الحجم', 'والنوع', 'والجودة..'], out: 43.35, size: 84 },
  { lines: [['ومع شق النور..', 43.61, 44.66], ['يجهز نفسه', 45.02, 45.9], ['لوقت المزاد..', 45.9, 46.79]], hl: ['النور..', 'المزاد..'], out: 47.1 },
  { lines: [['ومن قلب الحدث..', 47.27, 48.25], ['يدخل التنافس الشرس..', 48.45, 50.2]], hl: ['الشرس..'], out: 50.4, dark: 1 },
  { lines: [['ويختار لكم "نخبة"', 50.5, 51.6], ['من المحاصيل..', 51.6, 52.69]], hl: ['"نخبة"'], out: 52.75, dark: 1 },
  { lines: [['ومن هذا الشغف', 54.5, 55.7], ['ومن بعد التوافيق', 56.0, 57.2], ['من رب العالمين..', 57.2, 58.4]], hl: ['الشغف', 'التوافيق'], out: 58.6 },
  { lines: [['تم تأسيس', 58.7, 59.4]], hl: [], out: 61.5, y: 520, size: 70, center: 1 },
  { lines: [['قصة نجاح وفخر..', 61.96, 63.5], ['ابتدت من سنين...', 63.69, 64.77]], hl: ['نجاح', 'وفخر..'], out: 65.0, y: 1480, size: 84, center: 1 },
  { lines: [['وباقية معاكم', 65.12, 66.1], ['إن شاء الله للأبد..', 66.1, 67.56]], hl: ['للأبد..'], out: 99, y: 1480, size: 88, center: 1 },
];
function headings(T) {
  HEADS.forEach(h => {
    const t0 = h.lines[0][1]; if (T < t0 - 0.1 || T > h.out + 0.4) return;
    const size = h.size || 96, lh = size * 1.22, y0 = h.y || 300, R = 985;
    const ex = P(T, h.out, h.out + 0.32);
    ctx.save(); ctx.globalAlpha *= 1 - ex; ctx.translate(0, -ex * 70);
    h.lines.forEach(([txt, a, b], li) => {
      const ws = txt.split(' ');
      ctx.font = `800 ${size}px ${AR}`; ctx.direction = 'rtl';
      const sp = size * 0.24, wd = ws.map(w => ctx.measureText(w).width), tot = wd.reduce((s, v) => s + v, 0) + sp * (ws.length - 1);
      const sc = Math.min(1, 910 / tot);
      let x = h.center ? 540 + tot * sc / 2 : R; const chars = ws.reduce((s, w) => s + w.length, 0); let acc = 0;
      const y = y0 + li * lh;
      ws.forEach((w, i) => {
        const wt = lerp(a, b, acc / chars) - 0.06; acc += w.length;
        const k = P(T, wt, wt + 0.42);
        if (k > 0) {
          const isH = h.hl.includes(w);
          ctx.save(); ctx.translate(x - wd[i] * sc / 2, y + (1 - oE(k)) * size * 0.55); const s = sc * lerp(0.9, 1, oE(k)); ctx.scale(s, s);
          ctx.globalAlpha *= clamp(k * 2.5);
          ctx.font = `800 ${size}px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'center';
          ctx.fillStyle = isH ? (h.dark ? K.gold : K.leaf) : (h.dark ? K.cream : K.ink);
          ctx.fillText(w, 0, 0); ctx.restore();
        }
        x -= (wd[i] + sp) * sc;
      });
    });
    ctx.restore();
  });
}

// ---------- backgrounds & decoration ----------
const R0 = rng(5);
const dots = Array.from({ length: 26 }, () => ({ x: R0() * W, y: R0() * H, r: 4 + R0() * 9, v: 10 + R0() * 18, ph: R0() * 6 }));
function bg(col, T, deco = true, dark = false) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(540, 1100, 100, 540, 1000, 1300); g.addColorStop(0, dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.25)' : 'rgba(31,56,45,0.05)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!deco) return;
  ctx.save(); ctx.globalAlpha = dark ? 0.10 : 0.07; logoFan(1180, 2080, 820, 1, dark ? K.goldl : K.leaf); ctx.restore();
  ctx.save(); dots.forEach(d => { ctx.globalAlpha = (dark ? 0.12 : 0.10) * (0.5 + 0.5 * Math.sin(T + d.ph)); circle(d.x + Math.sin(T * 0.5 + d.ph) * 20, ((d.y - T * d.v) % H + H) % H, d.r, dark ? K.gold : K.leaf); }); ctx.restore();
}

// ================= SCENES =================
// 01 hook
function s1(T) {
  bg(K.white, T);
  const cy = 1180, f = Math.sin(T * 1.6) * 8, spread = oE(P(T, 3.85, 4.5));
  photoCard('jood1', 540 - lerp(250, 300, spread), cy + 40 + f, 400, 400, P(T, 1.05, 1.6), { rot: -0.13, rotIn: -0.4 });
  photoCard('vip', 540 + lerp(250, 300, spread), cy + 40 - f, 400, 400, P(T, 1.25, 1.8), { rot: 0.13, rotIn: 0.4 });
  photoCard('creme', 540, cy - 20 + f * 0.6, 460, 460, P(T, 0.85, 1.45), { zoom: P(T, 1, 5.5) });
  // brand seal on "فواخر"
  popIn(800, cy - 290, P(T, 2.75, 3.15), () => { circle(0, 0, 95, K.green); logoFan(42, 40, 100, 1, K.goldl); }, { dy: 0, s0: 0.2 });
  chip(540, 1640, 'القصة', P(T, 4.6, 5.0), { size: 46, bg: K.green, col: K.cream, icon: (x, y, s) => { ctx.fillStyle = K.gold; ctx.beginPath(); ctx.moveTo(x + s * 0.32, y - s * 0.38); ctx.lineTo(x + s * 0.32, y + s * 0.38); ctx.lineTo(x - s * 0.36, y); ctx.closePath(); ctx.fill(); } });
}
// 02 once upon a time (green)
function s2(T) {
  bg(K.green, T, true, true);
  const gy = 1500;
  popIn(540, gy, P(T, 6.2, 6.8), () => { ctx.fillStyle = K.green2; ctx.beginPath(); ctx.ellipse(0, 0, 470, 70, 0, 0, 7); ctx.fill(); }, { dy: 0, s0: 0.3, noBounce: 1 });
  flatPalm(700, gy, 640, P(T, 7.3, 8.8), { t: T });
  flatPalm(890, gy + 10, 380, P(T, 7.7, 9.0), { t: T + 2, c1: '#4F7B5D', c2: '#6A9672' });
  popIn(330, gy, P(T, 7.5, 8.0), () => person(0, 0, 230, K.leaf), { dy: 80, s0: 0.5 });
  // thought bubble with dates
  popIn(250, 930, P(T, 8.25, 8.65), () => {
    card(-150, -95, 300, 190, 95, K.cream, { blur: 0, oy: 0 }); circle(110, 130, 22, K.cream); circle(150, 175, 12, K.cream);
    dateIcon(-70, 0, 44, -0.4); dateIcon(0, 0, 50, 0.1, K.date2); dateIcon(70, 0, 44, 0.4);
  }, { dy: 30, s0: 0.3 });
}
// 03 growing / varieties / care
function s3(T) {
  bg(K.white, T);
  const cards = [[760, 9.7, 'الزراعة'], [1040, 11.0, 'الأنواع'], [1320, 12.1, 'الرعاية']];
  cards.forEach(([y, t0, title], i) => {
    const p = P(T, t0 - 0.05, t0 + 0.55); if (p <= 0) return;
    ctx.save(); ctx.translate((1 - oE(p)) * 700, 0); ctx.globalAlpha *= clamp(p * 2);
    card(110, y, 860, 230, 34, '#FFFFFF');
    circle(860, y + 115, 70, K.lightg);
    text(title, 760, y + 95, 54, K.ink, { a: 'right', w: 800 });
    if (i === 0) { // seedling
      ctx.fillStyle = K.leaf; rr(855, y + 100, 10, 60, 5); ctx.fill();
      ctx.beginPath(); ctx.ellipse(835, y + 100, 26, 13, -0.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(885, y + 88, 28, 13, 0.5, 0, 7); ctx.fill();
      const steps = ['بذرة', 'شتلة', 'نخلة'];
      steps.forEach((s, k) => { const q = P(T, t0 + 0.3 + k * 0.25, t0 + 0.6 + k * 0.25); const x = 680 - k * 210; circle(x, y + 165, 14, q > 0 ? K.leaf : '#E3E3DD'); if (k < 2) { ctx.fillStyle = '#E3E3DD'; ctx.fillRect(x - 196, y + 163, 182, 4); ctx.fillStyle = K.leaf; ctx.fillRect(x - 14 - 182 * P(T, t0 + 0.45 + k * 0.25, t0 + 0.75 + k * 0.25), y + 163, 182 * P(T, t0 + 0.45 + k * 0.25, t0 + 0.75 + k * 0.25), 4); } ctx.save(); ctx.globalAlpha *= 0.3 + 0.7 * q; text(s, x - 30, y + 177, 32, K.gray, { a: 'right', w: 500 }); ctx.restore(); });
    } else if (i === 1) { // varieties (real Fawakher types)
      dateIcon(840, y + 115, 26, -0.4); dateIcon(880, y + 115, 30, 0.3, K.date2);
      ['مجدول', 'سكري', 'خلاص', 'جالكسي'].forEach((s, k) => chip(660 - k * 150, y + 165, s, P(T, t0 + 0.25 + k * 0.15, t0 + 0.6 + k * 0.15), { size: 28, bg: K.lightg, col: K.green, flat: 1 }));
    } else { // year-round care: 12 months
      ctx.strokeStyle = K.leaf; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(860, y + 115, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * P(T, t0, t0 + 1.4)); ctx.stroke();
      for (let k = 0; k < 12; k++) { const q = P(T, t0 + 0.2 + k * 0.1, t0 + 0.35 + k * 0.1); const x = 700 - k * 50; rr(x - 18, y + 150, 36, 28, 8); ctx.fillStyle = q > 0 ? K.leaf : '#E9E9E3'; ctx.fill(); }
    }
    ctx.restore();
  });
}
// 04 passion & curiosity gauges
function s4(T) {
  bg(K.cream, T);
  const cx = 540, cy = 1080, a1 = ioC(P(T, 15.15, 16.0)), a2 = ioC(P(T, 16.0, 16.85));
  popIn(cx, cy, P(T, 14.95, 15.4), () => {
    card(-330, -330, 660, 660, 330, '#FFFFFF', { blur: 60 });
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ECEAE3'; ctx.lineWidth = 40; ctx.beginPath(); ctx.arc(0, 0, 270, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 200, 0, 7); ctx.stroke();
    ctx.strokeStyle = K.gold; ctx.beginPath(); ctx.arc(0, 0, 270, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a2 * 0.999); if (a2 > 0) ctx.stroke();
    ctx.strokeStyle = K.leaf; ctx.beginPath(); ctx.arc(0, 0, 200, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a1 * 0.999); if (a1 > 0) ctx.stroke();
    // flame
    const fs = 0.8 + 0.25 * a1 + 0.2 * a2 + Math.sin(T * 9) * 0.02;
    ctx.save(); ctx.scale(fs, fs); ctx.fillStyle = K.gold; ctx.beginPath(); ctx.moveTo(0, 70); ctx.bezierCurveTo(-75, 50, -70, -20, -20, -60); ctx.bezierCurveTo(-25, -20, 5, -15, 10, -95); ctx.bezierCurveTo(60, -50, 85, 40, 0, 70); ctx.fill();
    ctx.fillStyle = '#F2E6B8'; ctx.beginPath(); ctx.moveTo(0, 62); ctx.bezierCurveTo(-35, 50, -35, 5, -5, -20); ctx.bezierCurveTo(0, 5, 20, 0, 22, -35); ctx.bezierCurveTo(45, 0, 40, 50, 0, 62); ctx.fill(); ctx.restore();
  }, { dy: 80, s0: 0.5 });
  chip(330, 1500, 'الشغف', P(T, 15.3, 15.7), { size: 40, bg: K.leaf, col: '#fff' });
  chip(750, 1500, 'الفضول', P(T, 16.1, 16.5), { size: 40, bg: K.gold, col: K.ink });
  text(Math.round(100 * Math.max(a1, a2)) + '%', 540, 1700, 70, K.ink, { w: 800, dir: 'ltr' });
}
// 05 search UI
function s5(T) {
  bg(K.white, T);
  const y = 820, q = 'نخلة غنية بثمار عالية الجودة';
  popIn(540, y, P(T, 17.15, 17.6), () => {
    card(-450, -70, 900, 140, 70, '#FFFFFF', { blur: 50 });
    circle(375, 0, 48, K.leaf); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(370, -5, 18, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(383, 8); ctx.lineTo(398, 23); ctx.stroke();
    const n = Math.floor(q.length * P(T, 17.5, 18.9)); const s = q.slice(0, n);
    ctx.font = `500 42px ${AR}`; ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.fillStyle = K.ink; ctx.fillText(s, 300, 14);
    if (Math.floor(T * 3) % 2 === 0 && n < q.length + 1) { const w = ctx.measureText(s).width; ctx.fillStyle = K.leaf; ctx.fillRect(300 - w - 8, -24, 4, 46); }
  }, { dy: 60, s0: 0.7 });
  for (let i = 0; i < 4; i++) {
    const p = P(T, 18.3 + i * 0.12, 18.7 + i * 0.12); if (p <= 0) continue;
    const yy = 1000 + i * 175;
    ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(0, (1 - oE(p)) * 60);
    card(140, yy, 800, 140, 26, '#FFFFFF', { blur: 30, oy: 10 });
    circle(860, yy + 70, 40, K.lightg); pinIcon(860, yy + 92, 50, K.leaf);
    const sh = (T * 1.2 + i * 0.2) % 1, g = ctx.createLinearGradient(140 + sh * 1000 - 200, 0, 140 + sh * 1000, 0); g.addColorStop(0, '#EEEDE7'); g.addColorStop(0.5, '#F8F7F2'); g.addColorStop(1, '#EEEDE7');
    ctx.fillStyle = g; rr(330, yy + 38, 450, 26, 13); ctx.fill(); rr(480, yy + 80, 300, 20, 10); ctx.fill();
    ctx.restore();
  }
  // spinner
  const sp = P(T, 18.2, 18.4) * (1 - P(T, 19.6, 19.8));
  if (sp > 0) { ctx.save(); ctx.globalAlpha *= sp; ctx.strokeStyle = K.leaf; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(540, 1740, 34, T * 7, T * 7 + 4.2); ctx.stroke(); ctx.restore(); }
}
// 06 isometric Gulf map -> Saudi -> Qassim farms card
const ARAB = [[47.9, 29.5], [48.5, 28.0], [49.6, 26.9], [50.2, 26.2], [50.8, 25.0], [50.8, 24.7], [51.2, 26.1], [51.6, 25.3], [51.6, 24.5], [52.5, 24.2], [54.0, 24.1], [55.5, 25.5], [56.1, 26.2], [56.4, 25.0], [56.4, 24.6], [57.8, 23.7], [58.8, 23.5], [59.8, 22.5], [58.6, 20.5], [57.8, 19.0], [56.6, 18.0], [55.0, 17.0], [52.2, 15.6], [49.0, 14.6], [45.0, 13.0], [43.5, 12.7], [43.2, 13.3], [42.8, 15.3], [42.7, 16.5], [41.7, 17.9], [40.8, 19.7], [39.2, 21.5], [38.5, 23.6], [37.4, 24.7], [36.6, 26.0], [35.1, 28.0], [34.9, 29.5], [36.5, 29.9], [37.5, 30.5], [38.0, 31.5], [39.2, 32.2], [42.0, 31.0], [44.7, 29.2], [46.5, 29.1], [47.9, 29.5]];
const KW = [47.98, 29.37], QS = [43.97, 26.33];
const R6 = rng(61); const farms = []; while (farms.length < 34) { const lo = 38 + R6() * 20, la = 16 + R6() * 14; let ins = false; for (let i = 0, j = ARAB.length - 1; i < ARAB.length; j = i++) { const [xi, yi] = ARAB[i], [xj, yj] = ARAB[j]; if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) ins = !ins; } if (ins) farms.push([lo, la, R6()]); }
function s6(T) {
  bg(K.white, T);
  const mapOut = P(T, 28.3, 28.9);
  if (mapOut < 1) {
    const en = P(T, 19.9, 20.8), zoom = 1 + 1.4 * ioC(P(T, 27.0, 28.6));
    const tilt = lerp(0.2, 0.62, oC(en)), k = 38 * lerp(0.8, 1, oE(en)), cx = 540, cy = 1180;
    const flat = (lo, la) => [(lo - 47) * k * 0.9, -(la - 22.5) * k];
    const q0 = flat(QS[0], QS[1]);
    const pr = (lo, la, dz = 0) => { let [x, y] = flat(lo, la); x = (x - q0[0]) * zoom + q0[0] * (1 - (zoom - 1) / 1.4); y = (y - q0[1]) * zoom + q0[1] * (1 - (zoom - 1) / 1.4); return [cx + x, cy + y * Math.cos(tilt) + dz]; };
    ctx.save(); ctx.globalAlpha *= clamp(en * 2) * (1 - mapOut);
    const top = ARAB.map(p => pr(p[0], p[1])), side = ARAB.map(p => pr(p[0], p[1], 34 * zoom));
    ctx.save(); ctx.shadowColor = 'rgba(31,56,45,0.18)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 40;
    ctx.beginPath(); side.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = K.green2; ctx.fill(); ctx.restore();
    for (let i = 0; i < top.length - 1; i++) { ctx.beginPath(); ctx.moveTo(top[i][0], top[i][1]); ctx.lineTo(top[i + 1][0], top[i + 1][1]); ctx.lineTo(side[i + 1][0], side[i + 1][1]); ctx.lineTo(side[i][0], side[i][1]); ctx.closePath(); ctx.fillStyle = K.green2; ctx.fill(); }
    ctx.beginPath(); top.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = K.lightg; ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
    // Gulf label
    const gl = P(T, 22.9, 23.3) * (1 - P(T, 24.5, 24.9)); if (gl > 0) { const q = pr(52.4, 27.4); ctx.save(); ctx.globalAlpha *= gl; text('الخليج', q[0], q[1], 46, K.leaf, { w: 800 }); ctx.restore(); }
    // farms
    farms.forEach(([lo, la, r]) => { const p = P(T, 21.0 + r * 2.2, 21.25 + r * 2.2); if (p <= 0) return; const q = pr(lo, la); ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(oB(p), oB(p) * Math.cos(tilt) + 0.2); circle(0, 0, 11, K.leaf); ctx.restore(); });
    // Kuwait origin + journey
    const kq = pr(KW[0], KW[1]), qq = pr(QS[0], QS[1]);
    popIn(kq[0], kq[1], P(T, 24.65, 25.0), () => pinIcon(0, 0, 80, K.green), { dy: 120, s0: 0.5 });
    const jp = P(T, 24.9, 25.9);
    if (jp > 0) { const arc = quad(kq, [(kq[0] + qq[0]) / 2, Math.min(kq[1], qq[1]) - 170 * zoom], qq, 40); ctx.save(); ctx.setLineDash([16, 14]); ctx.strokeStyle = K.gold; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineDashOffset = -T * 40; if (pathPartial(arc, oC(jp))) ctx.stroke(); ctx.restore(); }
    const sp = P(T, 25.7, 26.1);
    if (sp > 0) { for (let r = 0; r < 2; r++) { const u = ((T - 25.7) * 0.9 + r * 0.5) % 1; ctx.save(); ctx.globalAlpha *= (1 - u) * sp; ctx.strokeStyle = K.gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(qq[0], qq[1], 20 + u * 110, (20 + u * 110) * Math.cos(tilt), 0, 0, 7); ctx.stroke(); ctx.restore(); } }
    popIn(qq[0], qq[1], sp, () => pinIcon(0, 0, 110, K.gold), { dy: 160, s0: 0.4 });
    chip(qq[0] - 10, qq[1] - 200, 'السعودية', P(T, 25.6, 26.0) * (1 - P(T, 26.9, 27.2)), { size: 40, bg: '#FFFFFF', col: K.green });
    ctx.restore();
  }
  // Qassim farms card
  const cp = P(T, 28.5, 29.0);
  if (cp > 0) {
    popIn(540, 1180, cp, () => {
      card(-420, -360, 840, 720, 40, '#FFFFFF', { blur: 60 });
      ctx.save(); rr(-390, -330, 780, 400, 28); ctx.clip();
      const sky = ctx.createLinearGradient(0, -330, 0, 70); sky.addColorStop(0, '#F6EBCB'); sky.addColorStop(1, '#FBF6E8'); ctx.fillStyle = sky; ctx.fillRect(-390, -330, 780, 400);
      circle(200, -200, 60, K.goldl);
      ctx.fillStyle = K.mint; ctx.beginPath(); ctx.ellipse(0, 90, 520, 90, 0, 0, 7); ctx.fill();
      [[-280, 230, 29.0], [-130, 300, 29.15], [30, 260, 29.3], [180, 320, 29.45], [310, 230, 29.6]].forEach(([x, h, t0]) => flatPalm(x, 40, h, P(T, t0, t0 + 0.9), { t: T + x, dates: P(T, t0 + 0.6, t0 + 1.3) }));
      ctx.restore();
      pinIcon(330, 170, 70, K.gold);
      text('بريدة · القصيم', 270, 160, 54, K.ink, { a: 'right', w: 800 });
      text('مهرجان التمور السنوي', 270, 225, 36, K.gray, { a: 'right', w: 500 });
      ['مزارع', 'حصاد', 'مزاد'].forEach((s, i) => chip(-300 + i * 170, 300, s, P(T, 29.5 + i * 0.15, 29.85 + i * 0.15), { size: 30, bg: K.lightg, col: K.green, flat: 1 }));
    }, { dy: 140, s0: 0.75 });
  }
}
// 07 biggest festival badge -> harvest (green)
function s7(T) {
  bg(K.green, T, true, true);
  const b = P(T, 30.95, 31.5), bo = P(T, 33.1, 33.5);
  if (b > 0 && bo < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - bo; ctx.translate(540, 1150); const s = oB(b) * (1 - 0.3 * iC(bo)); ctx.scale(s, s); ctx.rotate(Math.sin(T * 0.8) * 0.03);
    ctx.fillStyle = K.gold; ctx.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, r = i % 2 ? 300 : 330; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    circle(0, 0, 260, K.cream); ctx.strokeStyle = K.gold; ctx.lineWidth = 5; ctx.setLineDash([4, 12]); ctx.beginPath(); ctx.arc(0, 0, 230, T * 0.3, T * 0.3 + 7); ctx.stroke(); ctx.setLineDash([]);
    text('١', 0, 40, 220, K.green, { w: 800 });
    text('الأكبر في العالم', 0, 130, 44, K.goldd, { w: 800 });
    ctx.restore();
    const R = rng(8); for (let i = 0; i < 22; i++) { const u = P(T, 31.1, 32.6), a = R() * Math.PI * 2, d = 330 + u * (200 + R() * 260); if (u <= 0 || u >= 1) continue; ctx.save(); ctx.globalAlpha *= (1 - u) * (1 - bo); ctx.translate(540 + Math.cos(a) * d, 1150 + Math.sin(a) * d + u * u * 200); ctx.rotate(u * 8 + i); ctx.fillStyle = [K.gold, K.cream, K.mint][i % 3]; rr(-8, -16, 16, 32, 4); ctx.fill(); ctx.restore(); }
  }
  // harvest: real Fawakher date trays in a carousel + harvest chip
  const hp = P(T, 33.3, 33.8);
  if (hp > 0) {
    const sc = (T - 33.3) * 60;
    [['tray', 0], ['balls', 1], ['tray2', 2], ['nuts', 3]].forEach(([n, i]) => photoCard(n, 540 + (i - 1.5) * 470 + 235 - sc, 1080 + (i % 2) * 70, 400, 400, P(T, 33.35 + i * 0.15, 33.9 + i * 0.15), { rot: (i % 2 ? 0.05 : -0.05) }));
    chip(540, 1580, 'موسم الحصاد', P(T, 35.05, 35.45), { size: 46, bg: K.gold, col: K.ink, icon: (x, y, s) => { circle(x, y, s * 0.3, K.ink); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.strokeStyle = K.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4); ctx.lineTo(x + Math.cos(a) * s * 0.52, y + Math.sin(a) * s * 0.52); ctx.stroke(); } } });
  }
}
// 08 transport + sorting
function truck(x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = 'rgba(31,56,45,0.18)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  rr(-s * 0.95, -s * 0.62, s * 1.25, s * 0.62, s * 0.06); ctx.fillStyle = K.green; ctx.fill(); ctx.shadowColor = 'transparent';
  rr(s * 0.34, -s * 0.46, s * 0.5, s * 0.46, [s * 0.16, s * 0.06, s * 0.04, s * 0.04]); ctx.fillStyle = K.cream; ctx.fill();
  rr(s * 0.42, -s * 0.4, s * 0.28, s * 0.18, s * 0.04); ctx.fillStyle = '#BFD5E0'; ctx.fill();
  ctx.save(); ctx.translate(-s * 0.34, -s * 0.18); logoFan(s * 0.12, s * 0.06, s * 0.3, 1, K.goldl); ctx.restore();
  [[-s * 0.62], [s * 0.55]].forEach(([wx]) => { circle(wx, 0, s * 0.14, K.ink); circle(wx, 0, s * 0.06, '#C9C9C2'); });
  ctx.restore();
}
function s8(T) {
  bg(K.white, T);
  const a = 1 - P(T, 39.55, 39.85);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha *= a;
    const ry = 1300;
    ctx.fillStyle = '#E8E6DE'; rr(-20, ry, W + 40, 120, 0); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (let x = -((T * 500) % 140); x < W; x += 140) rr(x, ry + 54, 70, 12, 6), ctx.fill();
    const tx = lerp(1500, 560, oE(P(T, 37.25, 38.2))) + (T > 38.2 ? Math.sin(T * 30) * 2 : 0);
    // boxes on top (real box cards)
    photoCard('jood2', tx - 120, ry - 290, 150, 150, P(T, 38.0, 38.4), { dy: -160, s0: 0.3 });
    photoCard('caramel', tx + 60, ry - 290, 150, 150, P(T, 38.15, 38.55), { dy: -160, s0: 0.3 });
    truck(tx, ry + 10, 300);
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.globalAlpha *= 0.35 * P(T, 37.25, 37.6) * (1 - P(T, 38.0, 38.3)); ctx.fillStyle = K.leaf; rr(tx + 320 + k * 40, ry - 160 + k * 34, 120 - k * 20, 10, 5); ctx.fill(); ctx.restore(); }
    ctx.restore();
  }
  const b = P(T, 39.7, 40.2);
  if (b > 0) {
    const cols = [[810, 'الحجم', 41.25], [540, 'النوع', 41.75], [270, 'الجودة', 42.3]];
    cols.forEach(([x, label, tl], i) => {
      const p = P(T, 39.75 + i * 0.12, 40.3 + i * 0.12); if (p <= 0) return;
      const on = P(T, tl, tl + 0.35);
      popIn(x, 1180, p, () => {
        card(-120, -330, 240, 600, 34, on > 0 ? K.green : '#FFFFFF');
        text(label, 0, -240, 46, on > 0 ? K.cream : K.ink, { w: 800 });
        // icon per column
        if (i === 0) { [16, 24, 32].forEach((r, k) => dateIcon(-60 + k * 60, -120, r * 0.9, 0, on > 0 ? K.goldl : K.date)); }
        if (i === 1) { dateIcon(-50, -120, 28, -0.4, K.date); dateIcon(0, -120, 30, 0, K.date2); dateIcon(50, -120, 26, 0.4, '#C08A4E'); }
        if (i === 2) { ctx.fillStyle = on > 0 ? K.gold : K.goldd; ctx.beginPath(); for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 22 : 50; k ? ctx.lineTo(Math.cos(a) * r, -120 + Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, -120 + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
        // stacked sorted dates
        const n = Math.floor(10 * P(T, 40.3, 42.8));
        for (let k = 0; k < n; k++) dateIcon(-50 + (k % 3) * 50, 200 - Math.floor(k / 3) * 60, [18, 24, 30][i === 0 ? Math.floor(k / 3) % 3 : 1], (k % 2 - 0.5) * 0.6, i === 1 ? [K.date, K.date2, '#C08A4E'][k % 3] : K.date);
      }, { dy: 120, s0: 0.7 });
      checkBadge(x + 100, 870, 70, on);
    });
  }
}
// 09 dawn -> auction time
function s9(T) {
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, mixc('#E9EFE9', '#F7E3B8', P(T, 43.5, 45.5))); sky.addColorStop(1, '#FBF6EA');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const sy = lerp(1500, 1050, oE(P(T, 43.6, 45.0)));
  ctx.save(); ctx.translate(540, sy); ctx.rotate(T * 0.2); ctx.fillStyle = 'rgba(200,183,92,0.18)';
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(-30, -230); ctx.lineTo(30, -230); ctx.lineTo(70, -900); ctx.lineTo(-70, -900); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  circle(540, sy, 210, K.goldl); circle(540, sy, 170, K.gold);
  const hy = 1330;
  ctx.fillStyle = K.mint; ctx.beginPath(); ctx.moveTo(0, hy); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, hy - 50 * Math.sin(x / 240 + 0.4)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  flatPalm(160, hy - 10, 330, P(T, 43.7, 44.6), { t: T, c1: K.green2, c2: K.green, fronds: 8 });
  flatPalm(930, hy - 30, 420, P(T, 43.9, 44.8), { t: T + 3, c1: K.green2, c2: K.green, fronds: 8 });
  ctx.fillStyle = K.green2; ctx.beginPath(); ctx.moveTo(0, hy + 120); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, hy + 120 - 60 * Math.sin(x / 180 + 2)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  // auction clock card
  popIn(540, 1640, P(T, 45.0, 45.45), () => {
    card(-260, -100, 520, 200, 100, '#FFFFFF');
    circle(170, 0, 66, K.lightg); ctx.strokeStyle = K.green; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(170, 0, 46, 0, 7); ctx.stroke();
    const hand = lerp(-Math.PI * 0.95, -Math.PI / 2, ioC(P(T, 45.3, 46.6))); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170 + Math.cos(hand) * 34, Math.sin(hand) * 34); ctx.stroke(); ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170 + 22, 10); ctx.stroke();
    text('وقت المزاد', 70, 18, 50, K.ink, { a: 'right', w: 800 });
  }, { dy: 80, s0: 0.6 });
}
function mixc(a, b, t) { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; }
// 10 auction UI (dark green) + elite pick
const BIDS = [['مزايد ٢٧', 12400], ['مزايد ٠٨', 18750], ['مزايد ٤٥', 26300], ['مزايد ١٩', 34100], ['مزايد ٦١', 41900], ['مزايد ٣٣', 48750]];
function s10(T) {
  bg(K.dark, T, true, true);
  const fierce = P(T, 48.4, 48.9) * (1 - P(T, 50.2, 50.45)), sh = fierce * 5 * Math.sin(T * 60);
  const uiOut = P(T, 50.45, 50.85);
  if (uiOut < 1) {
    ctx.save(); ctx.translate(sh, 0); ctx.globalAlpha *= 1 - uiOut; ctx.translate(540, 1150); ctx.scale(1 - 0.15 * uiOut, 1 - 0.15 * uiOut); ctx.translate(-540, -1150);
    popIn(540, 1150, P(T, 47.3, 47.8), () => {
      card(-430, -480, 860, 960, 44, '#FFFFFF', { sh: 'rgba(0,0,0,0.35)' });
      text('المزاد', 360, -385, 54, K.ink, { a: 'right', w: 800 });
      const live = 0.6 + 0.4 * Math.sin(T * 8); circle(-330, -400, 12, `rgba(220,60,60,${live})`); text('مباشر', -300, -388, 34, K.ink, { a: 'left', w: 700 });
      const v = Math.floor(lerp(9000, 48750, ioC(P(T, 48.45, 50.25))) / 50) * 50;
      rr(-380, -320, 760, 190, 30); ctx.fillStyle = K.lightg; ctx.fill();
      text(v.toLocaleString('en-US'), 0, -195, 110, K.green, { w: 800, dir: 'ltr' });
      BIDS.forEach(([n, amt], i) => {
        const p = P(T, 48.5 + i * 0.27, 48.8 + i * 0.27); if (p <= 0) return;
        const yy = -80 + i * 92 - Math.max(0, (T - 48.5) * 0) ;
        ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate((1 - oE(p)) * 300, 0);
        rr(-380, yy, 760, 76, 20); ctx.fillStyle = i === BIDS.length - 1 && T > 50 ? 'rgba(200,183,92,0.25)' : '#F6F5F0'; ctx.fill();
        circle(330, yy + 38, 26, [K.leaf, K.gold, K.green2][i % 3]); text(n, 280, yy + 50, 36, K.ink, { a: 'right', w: 700 });
        text(amt.toLocaleString('en-US'), -350, yy + 50, 36, K.green, { a: 'left', w: 800, dir: 'ltr' });
        ctx.restore();
      });
    }, { dy: 120, s0: 0.8 });
    // paddles
    [[150, 560, '27'], [930, 590, '45'], [150, 1760, '19'], [930, 1740, '61']].forEach(([x, y, n], i) => popIn(x, y + Math.sin(T * 8 + i) * 12 * fierce, P(T, 48.5 + i * 0.25, 48.8 + i * 0.25), () => { ctx.rotate(Math.sin(T * 6 + i) * 0.15 * fierce); ctx.fillStyle = K.gold; rr(-9, 30, 18, 110, 9); ctx.fill(); circle(0, 0, 70, K.cream); text(n, 0, 22, 62, K.green, { w: 800, dir: 'ltr' }); }, { s0: 0.3 }));
    ctx.restore();
  }
  // elite pick: real VVIP box
  const e = P(T, 50.6, 51.1);
  if (e > 0) {
    ctx.save(); ctx.globalAlpha *= e; const g = ctx.createRadialGradient(540, 1150, 50, 540, 1150, 650); g.addColorStop(0, 'rgba(200,183,92,0.35)'); g.addColorStop(1, 'rgba(200,183,92,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 1500); ctx.restore();
    photoCard('vvip', 540, 1170, 620, 620, e, { zoom: P(T, 50.6, 52.7) });
    chip(540, 1560, 'نخبة', P(T, 51.0, 51.4), { size: 56, bg: K.gold, col: K.ink, w: 800 });
    for (let k = 0; k < 7; k++) { const a = T * 1.2 + k * 0.9, r = 400; ctx.save(); ctx.globalAlpha *= e * Math.abs(Math.sin(T * 3 + k)); ctx.translate(540 + Math.cos(a) * r, 1170 + Math.sin(a) * r); ctx.rotate(Math.PI / 4); ctx.fillStyle = K.goldl; ctx.fillRect(-8, -8, 16, 16); ctx.restore(); }
  }
}
// 11 gavel + "فواخر!"
function s11(T) {
  bg(K.dark, T, true, true);
  const hits = [53.05, 53.65];
  let ang;
  if (T < hits[0]) ang = lerp(0.2, 1.0, ioC(P(T, 52.65, 52.85))) * (1 - iC(P(T, 52.85, hits[0])));
  else if (T < hits[1]) { const u = P(T, hits[0], hits[0] + 0.25), v = P(T, hits[0] + 0.25, hits[1]); ang = u < 1 ? 0.7 * oC(u) : 0.7 * (1 - iC(v)); }
  else ang = 0.15 * oC(P(T, hits[1], hits[1] + 0.3));
  const imp = Math.max(...hits.map(h => (T >= h ? Math.exp(-(T - h) * 9) : 0)));
  ctx.save(); ctx.translate(Math.sin(T * 80) * 10 * imp, 0);
  popIn(560, 1290, P(T, 52.6, 52.9), () => { rr(-190, -40, 380, 80, 18); ctx.fillStyle = K.green2; ctx.fill(); rr(-220, 40, 440, 34, 14); ctx.fillStyle = K.green; ctx.fill(); }, { s0: 0.6 });
  ctx.save(); ctx.translate(900, 1080); ctx.rotate(-ang);
  rr(-360, -18, 360, 36, 18); ctx.fillStyle = K.gold; ctx.fill();
  ctx.translate(-360, 0); rr(-80, -110, 160, 220, 26); ctx.fillStyle = K.goldl; ctx.fill(); rr(-80, -70, 160, 22, 6); ctx.fillStyle = K.gold; ctx.fill(); rr(-80, 48, 160, 22, 6); ctx.fill();
  ctx.restore();
  hits.forEach(h => { const u = P(T, h, h + 0.6); if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha *= 1 - u; ctx.strokeStyle = K.goldl; ctx.lineWidth = 8 * (1 - u) + 2; ctx.beginPath(); ctx.ellipse(560, 1250, 80 + u * 480, 26 + u * 150, 0, 0, 7); ctx.stroke(); ctx.restore(); });
  const np = P(T, hits[1] + 0.02, hits[1] + 0.3);
  if (np > 0) { ctx.save(); ctx.translate(540, 760); const s = lerp(1.7, 1, oE(np)); ctx.scale(s, s); ctx.globalAlpha *= clamp(np * 3); text('فواخر!', 0, 0, 230, K.cream, { w: 800 }); ctx.restore(); popIn(540, 880, np, () => logoFan(60, 30, 120, 1, K.gold), { dy: 0, s0: 0.3 }); }
  ctx.restore();
}
// 12 blessing
function s12(T) {
  bg(K.cream, T);
  const lp = oC(P(T, 55.6, 57.4));
  for (let i = 0; i < 6; i++) { const x = 300 + i * 100 + Math.sin(T * 0.5 + i) * 15; ctx.fillStyle = `rgba(200,183,92,${0.12 * lp})`; ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 110, 1500); ctx.lineTo(x - 110, 1500); ctx.closePath(); ctx.fill(); }
  popIn(540, 1560, P(T, 54.6, 55.2), () => { ctx.fillStyle = K.mint; ctx.beginPath(); ctx.ellipse(0, 0, 420, 60, 0, 0, 7); ctx.fill(); }, { dy: 0, s0: 0.3, noBounce: 1 });
  flatPalm(540, 1560, 640, P(T, 55.0, 57.4), { t: T, dates: P(T, 57.2, 58.3) });
  // heart of passion rising
  const hp = P(T, 54.5, 55.4) * (1 - P(T, 56.0, 56.4));
  if (hp > 0) popIn(540, 1200 - 200 * oC(P(T, 54.6, 56.2)), hp, () => { ctx.fillStyle = K.gold; ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-80, -10, -50, -80, 0, -45); ctx.bezierCurveTo(50, -80, 80, -10, 0, 40); ctx.fill(); }, { s0: 0.3 });
}
// 13 logo + products + forever
function s13(T) {
  bg(K.white, T);
  const mv = ioC(P(T, 61.6, 62.4)), cy = lerp(1000, 640, mv), sc = lerp(1.25, 0.95, mv);
  logoFull(540, cy, sc, P(T, 58.8, 60.6));
  const tg = P(T, 60.2, 60.7);
  ctx.save(); ctx.globalAlpha *= tg; text('منزل جودة التمور', 540, cy + 240 * sc / 1.25, 56 * sc / 1.25 * 1.15, K.green, { w: 500, ls: `${lerp(24, 4, oE(tg))}px` }); ctx.restore();
  const pr = P(T, 61.9, 62.5);
  if (pr > 0) {
    const names = ['vip', 'jood1', 'creme', 'caramel', 'give', 'nuts', 'tray', 'jood2', 'balls'], scroll = (T - 61.9) * 80;
    names.forEach((n, i) => { const x = 1240 - i * 320 + scroll; if (x < -200 || x > 1300) return; photoCard(n, x, 1110 + (i % 2 ? 20 : -20), 270, 270, P(T, 61.9 + i * 0.1, 62.5 + i * 0.1), { rot: (i % 2 ? 0.04 : -0.04) }); });
  }
  const inf = P(T, 66.3, 67.0);
  if (inf > 0) { const ip = []; for (let i = 0; i <= 80; i++) { const t = i / 80 * Math.PI * 2, d = 1 + Math.sin(t) ** 2; ip.push([540 + 120 * Math.cos(t) / d, 1340 + 120 * Math.sin(t) * Math.cos(t) / d]); } ctx.save(); ctx.strokeStyle = K.gold; ctx.lineWidth = 12; ctx.lineCap = 'round'; if (pathPartial(ip, oC(inf))) ctx.stroke(); ctx.restore(); }
  const hd = P(T, 66.8, 67.3);
  ctx.save(); ctx.globalAlpha *= hd; text('@fawakher.kw  ·  fawakherkw.com', 540, 1790, 38, K.green, { f: 'Jost', w: 500, dir: 'ltr', ls: '2px' }); ctx.restore();
}

// ================= timeline & transitions =================
const SC = [[0, 6.0, s1], [6.0, 9.55, s2], [9.55, 14.9, s3], [14.9, 17.1, s4], [17.1, 19.85, s5], [19.85, 30.6, s6], [30.6, 37.0, s7], [37.0, 43.45, s8], [43.45, 47.2, s9], [47.2, 52.65, s10], [52.65, 54.5, s11], [54.5, 58.65, s12], [58.65, 99, s13]];
const TR = { 6.0: ['circle', K.green, [540, 1180]], 9.55: ['slide'], 14.9: ['circle', K.cream, [540, 1080]], 17.1: ['slide'], 19.85: ['circle', K.white, [540, 820]], 30.6: ['circle', K.green, [540, 1180]], 37.0: ['slide'], 43.45: ['slide'], 47.2: ['circle', K.dark, [540, 1640]], 54.5: ['circle', K.cream, [540, 1290]], 58.65: ['circle', K.white, [540, 1100]] };
const sceneAt = T => SC.find(s => T >= s[0] && T < s[1]) || SC[SC.length - 1];
function render(T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px'; ctx.shadowBlur = 0; ctx.setLineDash([]);
  let done = false;
  for (const k in TR) {
    const tb = +k, [type, col, c] = TR[k];
    if (T >= tb - 0.25 && T < tb + 0.3) {
      const p = ioC(P(T, tb - 0.25, tb + 0.3)), prev = sceneAt(tb - 0.001)[2], next = sceneAt(tb)[2];
      if (type === 'slide') {
        ctx.save(); ctx.translate(0, -p * H * 0.35); ctx.globalAlpha = 1 - p * 0.6; prev(T); ctx.restore();
        ctx.save(); ctx.translate(0, (1 - p) * H); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 60; next(T); ctx.restore();
      } else {
        ctx.save(); prev(T); ctx.restore();
        const r = 2300 * p;
        ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.clip(); next(T); ctx.restore();
        const r2 = 2300 * ioC(P(T, tb - 0.33, tb + 0.2));
        if (r2 > r + 2) { ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], r2, 0, 7); ctx.arc(c[0], c[1], r, 0, 7, true); ctx.fillStyle = K.gold; ctx.fill('evenodd'); ctx.restore(); }
      }
      done = true; break;
    }
  }
  if (!done) { ctx.save(); sceneAt(T)[2](T); ctx.restore(); }
  headings(T);
  const fi = 1 - P(T, 0, 0.35), fo = P(T, DUR - 0.5, DUR);
  if (fi > 0 || fo > 0) { ctx.fillStyle = `rgba(251,249,244,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
Promise.all([
  ...[300, 500, 700, 800].map(w => document.fonts.load(`${w} 40px ${AR}`, 'عربي')), document.fonts.load('300 40px Jost', 'Ab'), document.fonts.load('500 40px Jost', 'Ab'),
  ...IMG_LIST.map(n => new Promise(r => { const im = new Image(); im.onload = () => { IMG[n] = im; r(); }; im.onerror = r; im.src = 'prod/' + n + '.jpg'; })),
]).then(() => { render(0); window.ready = true; });
