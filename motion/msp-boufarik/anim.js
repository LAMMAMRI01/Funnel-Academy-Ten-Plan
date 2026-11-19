// حركة مجتمع السلم — فيديو توضيحي لناخبي بوفاريك (القائمة 05، 23 مقعداً)
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const W = 1080, H = 1920, F = 'Alexandria';
const RED = '#C8261E', RED_D = '#7E1410', RED_L = '#E2402F', YEL = '#FFC93C', GRN = '#1E9A48', WHITE = '#FFFFFF', INK = '#3A0B08';

// ---------- easing ----------
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, b) => cl((t - a) / (b - a));
const oC = x => 1 - Math.pow(1 - x, 3);
const oE = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const ioC = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const oB = x => { const c = 1.7, d = c + 1; return x <= 0 ? 0 : 1 + d * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
// visible window: in over di, out over dout
const vis = (t, t0, t1, di = .5, dout = .4) => P(t, t0, t0 + di) * (1 - P(t, t1 - dout, t1));

// ---------- primitives ----------
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function shadow(on, blur = 40, oy = 16, a = .35) {
  ctx.shadowColor = on ? `rgba(40,0,0,${a})` : 'transparent'; ctx.shadowBlur = on ? blur : 0; ctx.shadowOffsetY = on ? oy : 0;
}
function txt(s, x, y, w, sz, col, align = 'center') {
  ctx.font = `${w} ${sz}px ${F}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.fillText(s, x, y);
}
function tw(s, w, sz) { ctx.font = `${w} ${sz}px ${F}`; return ctx.measureText(s).width; }
// text that rises in, masked
function riseText(t, t0, s, x, y, w, sz, col, d = .55) {
  const k = oC(P(t, t0, t0 + d)); if (k <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - sz, W, sz * 2); ctx.clip();
  ctx.globalAlpha *= k; txt(s, x, y + (1 - k) * sz * 1.1, w, sz, col); ctx.restore();
}
function pill(x, y, w, h, bg, s, sz, col, wgt = 800) {
  ctx.fillStyle = bg; rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); txt(s, x, y + 3, wgt, sz, col);
}
function drawX(cx, cy, s, k, col = '#D91E18', lw = 9) {
  // two strokes; k in 0..1
  const a = cl(k * 2), b = cl(k * 2 - 1);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (a > 0) { ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx - s + 2 * s * a, cy - s + 2 * s * a); ctx.stroke(); }
  if (b > 0) { ctx.beginPath(); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx + s - 2 * s * b, cy - s + 2 * s * b); ctx.stroke(); }
  ctx.restore();
}
function pen(x, y, rot = -0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); shadow(true, 20, 10, .35);
  ctx.fillStyle = '#1D2B53'; rr(-11, -190, 22, 160, 8); ctx.fill(); shadow(false);
  ctx.fillStyle = '#C9CED8'; rr(-11, -60, 22, 26, 3); ctx.fill();
  ctx.fillStyle = '#E8C9A0'; ctx.beginPath(); ctx.moveTo(-11, -34); ctx.lineTo(11, -34); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#D91E18'; ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(4, -11); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFC93C'; rr(-11, -196, 22, 14, 5); ctx.fill();
  ctx.restore();
}

// ---------- background ----------
function bg(t) {
  const g = ctx.createLinearGradient(0, 0, W * .4, H);
  g.addColorStop(0, RED_L); g.addColorStop(.55, RED); g.addColorStop(1, RED_D);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // soft floating circles
  ctx.save(); ctx.globalAlpha = .08; ctx.fillStyle = WHITE;
  const cs = [[900, 260, 330, .23], [120, 1450, 420, .17], [980, 1250, 260, .3], [200, 520, 160, .4]];
  for (const [x, y, r, sp] of cs) { ctx.beginPath(); ctx.arc(x + Math.sin(t * sp) * 30, y + Math.cos(t * sp * .8) * 40, r, 0, 7); ctx.fill(); }
  ctx.restore();
  // big background word: بوفاريك
  ctx.save(); ctx.globalAlpha = .07; ctx.translate(W / 2, H * .53); ctx.rotate(-Math.PI / 2);
  txt('بوفاريك', Math.sin(t * .15) * 60, 0, 900, 430, WHITE); ctx.restore();
}
function disclaimer(t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * .85;
  txt('مثال توضيحي: الأسماء مموّهة والاختيار عشوائي ولا يدلّ على تفضيل أي مترشح', W / 2, H - 52, 400, 25, WHITE);
  ctx.restore();
}

// ---------- scenes ----------
function logo(x, y, s, a = 1, spin = 0) {
  if (s <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(spin); ctx.scale(s, s);
  shadow(true, 60, 24, .4); ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(0, 0, 212, 0, 7); ctx.fill(); shadow(false);
  ctx.drawImage(IMG.logo, -190, -190, 380, 380);
  ctx.restore();
}

// 1) intro 0 – 5.9
function s1(t) {
  const a = 1 - P(t, 5.55, 5.95); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  riseText(t, .15, 'فيديو توضيحي للناخبين', W / 2, 330, 800, 46, YEL);
  const ls = oB(P(t, .25, 1.05));
  // ring burst
  const rk = P(t, .3, 1.4);
  if (rk > 0 && rk < 1) { ctx.save(); ctx.strokeStyle = YEL; ctx.globalAlpha *= 1 - rk; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(W / 2, 790, 220 + rk * 200, 0, 7); ctx.stroke(); ctx.restore(); }
  logo(W / 2, 790, ls * 1.05, 1, (1 - oC(P(t, .25, 1.2))) * -0.6);
  riseText(t, .9, 'حركة مجتمع السلم', W / 2, 1150, 900, 82, WHITE);
  riseText(t, 2.0, 'الانتخابات المحلية', W / 2, 1262, 600, 56, WHITE);
  const pk = oB(P(t, 3.3, 3.9));
  if (pk > 0) { ctx.save(); ctx.translate(W / 2, 1385); ctx.scale(pk, pk); shadow(true, 24, 8, .3); pill(0, 0, 420, 96, WHITE, '28 نوفمبر 2026', 50, RED_D, 900); shadow(false); ctx.restore(); }
  ctx.restore();
}

// 2) Boufarik 5.9 – 11.1
function s2(t) {
  const a = vis(t, 5.85, 11.15, .3, .35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  riseText(t, 6.0, 'إلى ناخبي', W / 2, 560, 600, 64, WHITE);
  // location pin + Boufarik
  const k = oB(P(t, 6.5, 7.2));
  ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k);
  ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, -40, 58, Math.PI * .85, Math.PI * 2.15); ctx.lineTo(0, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -40, 24, 0, 7); ctx.fill(); ctx.restore();
  const k2 = oE(P(t, 6.9, 7.7));
  ctx.save(); ctx.globalAlpha *= k2; ctx.translate(W / 2, 960); ctx.scale(lerp(1.3, 1, k2), lerp(1.3, 1, k2));
  shadow(true, 40, 14, .35); txt('بلدية بوفاريك', 0, 0, 900, 120, WHITE); shadow(false); ctx.restore();
  riseText(t, 7.4, 'ولاية البليدة', W / 2, 1090, 600, 46, 'rgba(255,255,255,.85)');
  // "how to vote correctly"
  const k3 = oB(P(t, 8.6, 9.2));
  if (k3 > 0) {
    ctx.save(); ctx.translate(W / 2, 1290); ctx.scale(k3, k3); shadow(true, 30, 12, .35);
    const s = 'هكذا تصوّت بطريقة صحيحة', w = tw(s, 900, 54) + 110;
    pill(0, 0, w, 120, YEL, s, 54, INK, 900); shadow(false); ctx.restore();
  }
  ctx.restore();
}

// 3) number 05 11.1 – 15.2
function s3(t) {
  const a = vis(t, 11.1, 15.25, .25, .35); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  riseText(t, 11.25, 'أولاً: تذكّر رقم قائمتنا', W / 2, 470, 800, 60, YEL);
  const k = oB(P(t, 11.6, 12.4));
  ctx.save(); ctx.translate(W / 2, 960); ctx.scale(k, k); ctx.rotate((1 - k) * .25);
  shadow(true, 70, 30, .45); ctx.fillStyle = WHITE; rr(-300, -330, 600, 660, 50); ctx.fill(); shadow(false);
  ctx.strokeStyle = RED; ctx.lineWidth = 16; rr(-250, -250, 500, 470, 26); ctx.stroke();
  ctx.font = `900 330px ${F}`; ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
  ctx.fillText('05', 0, -10);
  txt('رقم القائمة', 0, 275, 800, 46, RED_D);
  ctx.restore();
  // pulse rings around number when spoken (~13.6)
  for (let i = 0; i < 2; i++) {
    const rk = P(t, 13.4 + i * .35, 14.6 + i * .35);
    if (rk > 0 && rk < 1) { ctx.save(); ctx.globalAlpha *= (1 - rk) * .8; ctx.strokeStyle = YEL; ctx.lineWidth = 10; rr(W / 2 - 300 - rk * 90, 630 - rk * 90, 600 + rk * 180, 660 + rk * 180, 50 + rk * 40); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}

// ---------- ballot scenes 15.2 – 34.6 ----------
const BS = 0.84, BW = 1049 * BS, BH = 1500 * BS;            // displayed ballot size
const BX = (W - BW) / 2, BY = 300;                          // ballot top-left (camera space)
const boxY = i => BY + (386 + 41.76 * (i - 1)) * BS;        // box centre (row 1..26)
const boxX = BX + 551 * BS;
const SKIP = new Set([5, 12, 19]);                          // 3 rows left empty (26 − 3 = 23)
const ORDER = []; for (let i = 1; i <= 26; i++) if (!SKIP.has(i)) ORDER.push(i);
// mark times: first three slow, the rest fast
const MARK_T = ORDER.map((r, j) => j < 3 ? 23.15 + j * 1.45 : 28.55 + (j - 3) * 0.27);
const MARK_D = j => j < 3 ? .55 : .2;

function camera(t) {
  // zoom on the box column while explaining, then back to the full sheet
  const zin = ioC(P(t, 19.7, 20.8)), zout = ioC(P(t, 28.3, 29.2));
  const z = lerp(1, 1.85, zin * (1 - zout));
  // focus follows the slow marks (rows 1..4)
  const fy = lerp(boxY(3), boxY(5), ioC(P(t, 23, 27.5)));
  const fx = boxX + 150;
  const cx = lerp(W / 2, fx, zin * (1 - zout)), cy = lerp(BY + BH / 2, fy, zin * (1 - zout));
  return { z, cx, cy };
}

function ballot(t) {
  const a = vis(t, 15.25, 34.75, .5, .45); if (a <= 0) return;
  const enter = oE(P(t, 15.3, 16.3));
  const cam = camera(t);
  ctx.save(); ctx.globalAlpha = a;
  // scene title (screen space)
  const title = t < 19.6 ? ['خذ ورقة القائمة رقم 05', 'ابحث عن ورقة حركة مجتمع السلم', 15.4]
    : t < 28.4 ? ['ضع علامة X في المربع', 'أمام كل مترشح تختاره', 19.75]
    : ['اختر من 1 إلى 23 مترشحاً', 'كحدّ أقصى', 28.45];
  ctx.save(); ctx.globalAlpha *= vis(t, title[2], 34.7, .3, .3) * (t < 19.6 ? 1 - P(t, 19.45, 19.6) : t < 28.4 ? 1 - P(t, 28.25, 28.4) : 1);
  riseText(t, title[2], title[0], W / 2, 120, 900, 66, WHITE, .45);
  riseText(t, title[2] + .15, title[1], W / 2, 205, 600, 40, YEL, .45);
  ctx.restore();

  // ---- camera space ----
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 255, W, 1420); ctx.clip();
  ctx.translate(W / 2, BY + BH / 2 + (1 - enter) * 1400);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.cx, -cam.cy);
  ctx.rotate((1 - enter) * -0.08);
  shadow(true, 60, 26, .45); ctx.fillStyle = WHITE; ctx.fillRect(BX, BY, BW, BH); shadow(false);
  ctx.drawImage(IMG.ballot, BX, BY, BW, BH);

  // highlight of the "05" stamp and party line when spoken
  const hk = vis(t, 17.2, 19.7, .3, .3);
  if (hk > 0) {
    ctx.save(); ctx.globalAlpha *= hk; ctx.strokeStyle = YEL; ctx.lineWidth = 9;
    rr(BX + 752 * BS, BY + 14 * BS, 268 * BS, 196 * BS, 14); ctx.stroke();
    rr(BX + 330 * BS, BY + 290 * BS, 390 * BS, 56 * BS, 12); ctx.stroke(); ctx.restore();
  }
  // box column highlight (19.8 – 23)
  const ck = vis(t, 20.4, 23.2, .4, .4);
  if (ck > 0) {
    ctx.save(); ctx.globalAlpha *= ck; ctx.strokeStyle = YEL; ctx.lineWidth = 6;
    rr(boxX - 40, boxY(1) - 26, 80, boxY(26) - boxY(1) + 52, 12); ctx.stroke();
    // pulse on first boxes
    for (let i = 1; i <= 6; i++) {
      const p = (Math.sin((t - 20.6) * 6 - i * .6) + 1) / 2;
      ctx.globalAlpha = ck * (.25 + .5 * p); ctx.fillStyle = YEL; ctx.fillRect(boxX - 26 * BS / .84 * .84, boxY(i) - 14, 52, 28);
    }
    ctx.restore();
  }
  // row highlights + X marks
  let count = 0, penPos = null;
  ORDER.forEach((r, j) => {
    const t0 = MARK_T[j], k = P(t, t0, t0 + MARK_D(j));
    if (k <= 0) { if (!penPos && t > t0 - (j < 3 ? .9 : .27) && t0 > 0) penPos = [boxX, boxY(r), 0, P(t, t0 - (j < 3 ? .9 : .27), t0)]; return; }
    if (k >= 1) count++;
    const y = boxY(r);
    ctx.save(); ctx.globalAlpha *= .32 * oC(k); ctx.fillStyle = '#F2B98F';
    ctx.fillRect(BX + 40 * BS, y - 19, BW - 80 * BS, 38); ctx.restore();
    drawX(boxX, y, 12, k, '#D91E18', 6);
    if (k < 1) penPos = [boxX, y, k, 1];
  });
  // pen (camera space, so it follows the zoom)
  const pv = vis(t, 22.6, 34.2, .35, .4);
  if (pv > 0 && penPos) {
    const [px, py, k, arrive] = penPos;
    // while drawing: wiggle along X strokes; between marks: glide
    let ox = 0, oy = 0;
    if (k > 0 && k < 1) { const a2 = cl(k * 2), b2 = cl(k * 2 - 1); if (k < .5) { ox = -12 + 24 * a2; oy = -12 + 24 * a2; } else { ox = 12 - 24 * b2; oy = -12 + 24 * b2; } }
    const prevY = penPos.prevY;
    ctx.save(); ctx.globalAlpha *= pv;
    pen(px + ox + 6, py + oy + (1 - oC(arrive)) * -40, -0.55); ctx.restore();
  }
  ctx.restore();   // camera

  // counter (screen space)
  const cvis = vis(t, 22.9, 34.75, .4, .4);
  if (cvis > 0) {
    ctx.save(); ctx.globalAlpha *= cvis;
    const done = count >= 23, pop = done ? oB(P(t, MARK_T[22] + .2, MARK_T[22] + .7)) : 1;
    ctx.translate(W / 2, 1745); shadow(true, 30, 10, .35);
    ctx.fillStyle = done ? YEL : WHITE; rr(-330, -78, 660, 156, 40); ctx.fill(); shadow(false);
    txt(done ? 'اكتمل اختيارك ✓' : 'المترشحون المختارون', 0, -36, 600, 34, done ? INK : RED_D);
    ctx.save(); ctx.scale(pop, pop); ctx.direction = 'ltr';
    ctx.font = `900 66px ${F}`; ctx.fillStyle = done ? INK : RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${count} / 23`, 0, 30); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

// 4) rules 34.6 – 39.9
function rules(t) {
  const a = vis(t, 34.6, 40.0, .3, .4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  riseText(t, 34.7, 'تذكّر دائماً', W / 2, 470, 900, 76, YEL);
  const items = [
    ['ضع علامة X بوضوح داخل المربع', 34.95, false],
    ['اختر من 1 إلى 23 مترشحاً كحدّ أقصى', 35.6, false],
    ['لا تتجاوز 23 مترشحاً', 35.95, true],
    ['لا تكتب أي شيء آخر على الورقة', 37.6, true],
  ];
  items.forEach(([s, t0, warn], i) => {
    const k = oE(P(t, t0, t0 + .55)); if (k <= 0) return;
    const y = 690 + i * 190, x = W / 2 + (1 - k) * 700;
    ctx.save(); ctx.globalAlpha *= k; shadow(true, 30, 12, .3);
    ctx.fillStyle = WHITE; rr(x - 450, y - 70, 900, 140, 36); ctx.fill(); shadow(false);
    ctx.fillStyle = warn ? RED : GRN; ctx.beginPath(); ctx.arc(x + 375, y, 44, 0, 7); ctx.fill();
    ctx.strokeStyle = WHITE; ctx.lineWidth = 9; ctx.lineCap = 'round';
    if (warn) { ctx.beginPath(); ctx.moveTo(x + 357, y - 18); ctx.lineTo(x + 393, y + 18); ctx.moveTo(x + 393, y - 18); ctx.lineTo(x + 357, y + 18); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(x + 355, y + 2); ctx.lineTo(x + 370, y + 18); ctx.lineTo(x + 397, y - 16); ctx.stroke(); }
    txt(s, x + 310, y + 4, 800, 40, INK, 'right');
    ctx.restore();
  });
  ctx.restore();
}

// 5) end card 39.9 – end
function endCard(t) {
  const a = P(t, 39.9, 40.4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const pk = oB(P(t, 40.1, 40.7));
  if (pk > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(pk, pk); shadow(true, 24, 8, .3); pill(0, 0, 470, 104, WHITE, 'يوم 28 نوفمبر 2026', 48, RED_D, 900); shadow(false); ctx.restore(); }
  riseText(t, 41.2, 'صوّتوا للقائمة رقم', W / 2, 530, 800, 66, WHITE);
  const k = oB(P(t, 43.4, 44.1));
  if (k > 0) {
    ctx.save(); ctx.translate(W / 2, 800); ctx.scale(k, k); shadow(true, 60, 24, .45);
    ctx.font = `900 360px ${F}`; ctx.fillStyle = YEL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
    ctx.fillText('05', 0, 0); shadow(false); ctx.restore();
  }
  logo(W / 2, 1250, oB(P(t, 45.0, 45.8)) * .8);
  riseText(t, 45.4, 'حركة مجتمع السلم', W / 2, 1520, 900, 74, WHITE);
  riseText(t, 45.8, 'بلدية بوفاريك', W / 2, 1615, 600, 46, YEL);
  ctx.restore();
}

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t);
  s1(t); s2(t); s3(t); ballot(t); rules(t); endCard(t);
  disclaimer(t, vis(t, 15.4, 34.75, .5, .4));
  // global fade in/out
  const fi = 1 - P(t, 0, .35), fo = P(t, DUR - .6, DUR);
  if (fi > 0 || fo > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
}
const DUR = 48.6;

const IMG = {};
const load = (k, s) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = s; });
Promise.all([load('logo', 'logo.png'), load('ballot', 'ballot.png'),
  ...[400, 600, 800, 900].map(w => document.fonts.load(`${w} 40px ${F}`, 'عربي 05'))])
  .then(() => { render(0); window.ready = true; });
