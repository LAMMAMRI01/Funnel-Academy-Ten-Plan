// ADM — motion overlay on top of the original footage (transparent canvas)
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const W = 1080, H = 1920;
const TEAL = '#196B6A', TEAL_D = '#0F4A49', YEL = '#FFB700', WHITE = '#FFFFFF';
const F = 'Montserrat';

// ---------- easing ----------
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, b) => cl((t - a) / (b - a));
const oC = x => 1 - Math.pow(1 - x, 3);
const oE = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const ioC = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const oB = x => { const c = 1.9, d = c + 1; return x <= 0 ? 0 : 1 + d * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
// in/out window: returns [pin, pout] (pout 0 = still visible)
const win = (t, t0, t1, di = .45, dout = .35) => [P(t, t0, t0 + di), P(t, t1 - dout, t1)];

// ---------- primitives ----------
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function shadow(on, blur = 30, oy = 10, a = .28) {
  if (on) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; }
  else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
}
function font(w, s) { ctx.font = `${w} ${s}px ${F}`; }
function tw(s, w, sz, ls = 0) { font(w, sz); ctx.letterSpacing = ls + 'px'; const m = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return m; }
function txt(s, x, y, w, sz, col, align = 'left', ls = 0) {
  font(w, sz); ctx.letterSpacing = ls + 'px'; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}

// ---------- icons (centered at x,y, size s) ----------
function icon(name, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = s * .1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const k = s / 2;
  if (name === 'camera') {
    rr(-k, -k * .55, 2 * k, k * 1.35, k * .22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-k * .35, -k * .55); ctx.lineTo(-k * .22, -k * .8); ctx.lineTo(k * .22, -k * .8); ctx.lineTo(k * .35, -k * .55); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, k * .12, k * .4, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(k * .68, -k * .3, k * .07, 0, 7); ctx.fill();
  } else if (name === 'check') {
    ctx.lineWidth = s * .16; ctx.beginPath(); ctx.moveTo(-k * .6, 0); ctx.lineTo(-k * .15, k * .45); ctx.lineTo(k * .65, -k * .45); ctx.stroke();
  } else if (name === 'doc') {
    ctx.beginPath(); ctx.moveTo(-k * .65, -k); ctx.lineTo(k * .3, -k); ctx.lineTo(k * .7, -k * .6); ctx.lineTo(k * .7, k); ctx.lineTo(-k * .65, k); ctx.closePath(); ctx.stroke();
    for (const yy of [-.25, .15, .55]) { ctx.beginPath(); ctx.moveTo(-k * .35, k * yy); ctx.lineTo(k * .4, k * yy); ctx.stroke(); }
  } else if (name === 'chat') {
    rr(-k, -k * .8, 2 * k, k * 1.3, k * .35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-k * .45, k * .5); ctx.lineTo(-k * .6, k * .95); ctx.lineTo(-k * .05, k * .5); ctx.stroke();
    for (const xx of [-.45, 0, .45]) { ctx.beginPath(); ctx.arc(k * xx, -k * .15, k * .09, 0, 7); ctx.fill(); }
  } else if (name === 'star') {
    star(0, 0, k, k * .45); ctx.fill();
  } else if (name === 'sliders') {
    for (const [yy, kx] of [[-.6, .35], [0, -.35], [.6, .15]]) {
      ctx.beginPath(); ctx.moveTo(-k, k * yy); ctx.lineTo(k, k * yy); ctx.stroke();
      ctx.beginPath(); ctx.arc(k * kx, k * yy, k * .2, 0, 7); ctx.fill();
    }
  } else if (name === 'arrow') {
    ctx.lineWidth = s * .15; ctx.beginPath(); ctx.moveTo(-k * .6, 0); ctx.lineTo(k * .55, 0); ctx.moveTo(k * .1, -k * .5); ctx.lineTo(k * .6, 0); ctx.lineTo(k * .1, k * .5); ctx.stroke();
  } else if (name === 'hand') { // "pratique" — target
    ctx.beginPath(); ctx.arc(0, 0, k * .85, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, k * .45, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, k * .12, 0, 7); ctx.fill();
  } else if (name === 'tooth' || name === 'toothT') {
    const im = name === 'tooth' ? IMG.toothW : IMG.toothT; const h = s * 1.15, w = h * im.width / im.height;
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
}
function star(x, y, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath();
}

// ---------- components ----------
// chip: circle with icon pops, pill unrolls to the right, text slides in
function chip(t, o) {
  const { x, y, t0, t1, text, ic, style = 'white', h = 92, sz = 38 } = o;
  const [pi, po] = win(t, t0, t1, .55, .38);
  if (pi <= 0 || po >= 1) return;
  const bg = style === 'white' ? WHITE : TEAL, fg = style === 'white' ? TEAL : WHITE;
  const cbg = style === 'white' ? TEAL : YEL, cfg = style === 'white' ? WHITE : TEAL;
  const tw_ = tw(text, 800, sz, 1);
  const full = h + 26 + tw_ + 38;
  const sc = oB(P(pi, 0, .55)) * (1 - ioC(P(po, .45, 1)));
  const ex = oE(P(pi, .2, 1)) * (1 - ioC(P(po, 0, .7)));
  const r = h / 2;
  ctx.save();
  // pill
  if (ex > 0) {
    const w = h + (full - h) * ex;
    shadow(true); ctx.fillStyle = bg; rr(x, y - r, w, h, r); ctx.fill(); shadow(false);
    ctx.save(); rr(x, y - r, w, h, r); ctx.clip();
    const tx = x + h + 22 - (1 - ex) * 60;
    ctx.globalAlpha = ex; txt(text, tx, y + 2, 800, sz, fg, 'left', 1);
    ctx.restore();
  }
  // icon circle
  if (sc > 0) {
    ctx.save(); ctx.translate(x + r, y); ctx.scale(sc, sc);
    ctx.fillStyle = cbg; ctx.beginPath(); ctx.arc(0, 0, r - 8, 0, 7); ctx.fill();
    const rot = (1 - oC(P(pi, 0, .6))) * -1.2; ctx.rotate(rot);
    icon(ic, 0, 0, h * .42, cfg);
    ctx.restore();
  }
  ctx.restore();
}

// title box: yellow bar grows, teal panel wipes, text rises (masked)
function titleBox(t, o) {
  const { x, y, t0, t1, l1, l2, t2 = t0 + .5, s1 = 58, s2 = 32, ic } = o;
  const [pi, po] = win(t, t0, t1, .7, .45);
  if (pi <= 0 || po >= 1) return;
  const padX = 40, icW = ic ? 96 : 0;
  const w1 = tw(l1, 900, s1, 1), w2 = l2 ? tw(l2, 600, s2, .5) : 0;
  const Wd = Math.max(w1, w2) + padX * 2 + icW, Hd = l2 ? s1 + s2 + 78 : s1 + 60;
  const bar = oE(P(pi, 0, .45)) * (1 - ioC(P(po, .55, 1)));
  const wipe = oE(P(pi, .15, 1)) * (1 - ioC(P(po, 0, .8)));
  ctx.save();
  if (wipe > 0) {
    shadow(true, 40, 14, .3); ctx.fillStyle = TEAL; rr(x, y, Wd * wipe, Hd, 18); ctx.fill(); shadow(false);
    ctx.save(); rr(x, y, Wd * wipe, Hd, 18); ctx.clip();
    const cx = x + padX + icW;
    const k1 = oC(P(t, t0 + .3, t0 + .8));
    ctx.globalAlpha = k1;
    txt(l1, cx, y + 30 + s1 / 2 + (1 - k1) * 50, 900, s1, WHITE, 'left', 1);
    if (l2) {
      const k2 = oC(P(t, t2, t2 + .5));
      ctx.globalAlpha = k2;
      txt(l2, cx, y + 30 + s1 + 18 + s2 / 2 + (1 - k2) * 40, 600, s2, YEL, 'left', .5);
    }
    if (ic) {
      ctx.globalAlpha = 1;
      const ks = oB(P(t, t0 + .25, t0 + .75));
      ctx.save(); ctx.translate(x + padX + 34, y + Hd / 2); ctx.scale(ks, ks);
      ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fill();
      icon(ic, 0, 0, 40, TEAL); ctx.restore();
    }
    ctx.restore();
  }
  if (bar > 0) { ctx.fillStyle = YEL; rr(x - 22, y + Hd * (1 - bar) / 2, 12, Hd * bar, 6); ctx.fill(); }
  ctx.restore();
}

// camera viewfinder HUD (corners + REC + exposure readout + focus box)
function viewfinder(t, t0, t1, opts = {}) {
  const [pi, po] = win(t, t0, t1, .5, .35);
  if (pi <= 0 || po >= 1) return;
  const a = oC(pi) * (1 - po);
  const m = 54 + (1 - oE(pi)) * 70 + ioC(po) * 40, L = 90;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = WHITE; ctx.lineWidth = 6; ctx.lineCap = 'round';
  shadow(true, 12, 0, .35);
  const corners = [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath(); ctx.moveTo(cx, cy + sy * L); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * L, cy); ctx.stroke();
  }
  // focus box (center, snaps)
  if (opts.focus) {
    const fk = P(t, opts.focus, opts.focus + .35);
    if (fk > 0) {
      const s = lerp(260, 170, oB(fk)), fx = opts.fx || W / 2, fy = opts.fy || 760;
      const blink = fk >= 1 && Math.floor((t - opts.focus) * 6) % 2 === 0 && t - opts.focus < 1.0;
      ctx.strokeStyle = fk >= 1 ? YEL : WHITE; ctx.lineWidth = 5;
      const q = s / 2, l = 34;
      if (!blink || fk < 1) for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        ctx.beginPath(); ctx.moveTo(fx + sx * q, fy + sy * (q - l)); ctx.lineTo(fx + sx * q, fy + sy * q); ctx.lineTo(fx + sx * (q - l), fy + sy * q); ctx.stroke();
      }
    }
  }
  shadow(false);
  // bottom readout (below captions)
  const by = H - m - 38;
  const recOn = Math.floor(t * 2) % 2 === 0;
  ctx.fillStyle = '#FF3B30'; ctx.globalAlpha = a * (recOn ? 1 : .25);
  ctx.beginPath(); ctx.arc(m + 40, by, 13, 0, 7); ctx.fill();
  ctx.globalAlpha = a; shadow(true, 10, 0, .5);
  txt('REC', m + 66, by + 1, 800, 30, WHITE, 'left', 2);
  const fr = Math.floor(t * 30) % 30, sec = Math.floor(t);
  txt(`00:00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, m + 150, by + 1, 600, 28, WHITE, 'left', 1);
  const ex = opts.exposure ? opts.exposure(t) : 'ISO 100   f/8   1/125';
  txt(ex, W - m - 40, by + 1, 800, 28, WHITE, 'right', 1.5);
  shadow(false);
  ctx.restore();
}

// white shutter flash
function flash(t, at, s = .55) {
  const k = P(t, at, at + .22); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = s * (1 - oC(k)); ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// small heading label with yellow underline
function label(t, x, y, t0, t1, s) {
  const [pi, po] = win(t, t0, t1, .4, .3);
  if (pi <= 0 || po >= 1) return;
  ctx.save(); ctx.globalAlpha = oC(pi) * (1 - po); shadow(true, 14, 2, .5);
  txt(s, x, y + (1 - oC(pi)) * 20, 800, 30, WHITE, 'left', 5); shadow(false);
  const lw = tw(s, 800, 30, 5) * oE(P(pi, .3, 1)) * (1 - ioC(po));
  ctx.fillStyle = YEL; rr(x, y + 26, lw, 6, 3); ctx.fill();
  ctx.restore();
}

// ---------- persistent brand elements ----------
function logoBug(t) {
  const pi = P(t, .35, .9), po = P(t, 31.45, 31.85);
  if (pi <= 0 || po >= 1) return;
  const s = oB(pi) * (1 - ioC(po));
  ctx.save(); ctx.translate(W - 112, 128); ctx.scale(s, s);
  shadow(true, 24, 8, .3); ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fill(); shadow(false);
  ctx.strokeStyle = YEL; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cl(t / 31.8)); ctx.stroke();
  const h = 70, w = h * IMG.toothW.width / IMG.toothW.height; ctx.drawImage(IMG.toothW, -w / 2, -h / 2 - 2, w, h);
  ctx.restore();
}

// ---------- timeline ----------
const LX = 84; // left margin for cards
function render(t) {
  ctx.clearRect(0, 0, W, H);

  // 0 — intro name card
  titleBox(t, { x: LX, y: 92, t0: .2, t1: 3.3, l1: 'DR. MECHICHE RIAD', l2: 'Formateur agréé en photographie dentaire', t2: 1.25, s1: 56, s2: 30 });

  // 1 — audience
  label(t, LX, 112, 3.55, 6.9, 'VOUS ÊTES');
  chip(t, { x: LX, y: 222, t0: 3.85, t1: 6.75, text: 'Dentiste', ic: 'tooth', style: 'white' });
  chip(t, { x: LX, y: 330, t0: 4.75, t1: 6.85, text: 'Orthodontiste', ic: 'tooth', style: 'white' });
  chip(t, { x: LX, y: 438, t0: 5.55, t1: 6.95, text: 'Prothésiste', ic: 'tooth', style: 'white' });

  // 2 — "un outil incontournable" + viewfinder
  viewfinder(t, 6.6, 9.55, { focus: 8.05, fy: 900 });
  flash(t, 8.0, .5);
  titleBox(t, { x: LX, y: 150, t0: 7.25, t1: 9.5, l1: 'LA PHOTO', l2: 'Un outil incontournable', t2: 7.9, s1: 60, s2: 36, ic: 'camera' });

  // 3 — documenter / communiquer / valoriser
  chip(t, { x: LX, y: 150, t0: 9.6, t1: 14.0, text: 'Documenter', ic: 'doc', style: 'teal' });
  chip(t, { x: LX, y: 258, t0: 10.45, t1: 14.1, text: 'Communiquer', ic: 'chat', style: 'teal' });
  chip(t, { x: LX, y: 366, t0: 11.85, t1: 14.2, text: 'Valoriser votre savoir-faire', ic: 'star', style: 'teal', sz: 34 });

  // 4 — formation pratique & accessible
  label(t, LX, 112, 14.35, 17.15, 'LA FORMATION');
  chip(t, { x: LX, y: 222, t0: 14.75, t1: 17.05, text: 'Pratique', ic: 'hand', style: 'white' });
  chip(t, { x: LX, y: 330, t0: 15.85, t1: 17.15, text: 'Accessible', ic: 'check', style: 'white' });

  // 5 — bon matériel / bons réglages
  viewfinder(t, 17.25, 19.95, {
    focus: 17.6, fy: 820, exposure: t => {
      const k = oC(P(t, 19.05, 19.6));
      const iso = Math.round(lerp(400, 100, k) / 50) * 50, sp = Math.round(lerp(60, 160, k) / 10) * 10, ap = lerp(4, 11, k).toFixed(0);
      return `ISO ${iso}   f/${ap}   1/${sp}`;
    }
  });
  flash(t, 18.7, .4);
  chip(t, { x: LX, y: 160, t0: 17.95, t1: 20.15, text: 'Bon matériel', ic: 'camera', style: 'white' });
  chip(t, { x: LX, y: 268, t0: 19.0, t1: 20.25, text: 'Bons réglages', ic: 'sliders', style: 'white' });

  // 6 — intra / extra / haute qualité
  chip(t, { x: LX, y: 150, t0: 20.75, t1: 23.35, text: 'Intrabuccales', ic: 'tooth', style: 'teal' });
  chip(t, { x: LX, y: 258, t0: 21.65, t1: 23.42, text: 'Extrabuccales', ic: 'tooth', style: 'teal' });
  hq(t, LX, 368, 22.55, 23.48);

  // 7 — documentation claire & professionnelle
  viewfinder(t, 24.45, 27.35, { focus: 26.3, fy: 860 });
  flash(t, 25.17, .45); flash(t, 26.27, .45);
  titleBox(t, { x: LX, y: 150, t0: 24.6, t1: 27.3, l1: 'DOCUMENTATION', l2: 'Claire & professionnelle', t2: 25.6, s1: 54, s2: 36, ic: 'doc' });

  // 8 — CTA
  cta(t);

  logoBug(t);
  progress(t);
}

// "haute qualité" — five stars popping in sequence + label
function hq(t, x, y, t0, t1) {
  const [pi, po] = win(t, t0, t1, .8, .3);
  if (pi <= 0 || po >= 1) return;
  const out = 1 - ioC(po);
  const lw = tw('HAUTE QUALITÉ', 900, 34, 3);
  const Wd = 46 + 5 * 50 + 24 + lw + 40;
  const ex = oE(P(pi, 0, .6)) * out;
  ctx.save();
  shadow(true); ctx.fillStyle = YEL; rr(x, y - 46, Wd * ex, 92, 46); ctx.fill(); shadow(false);
  ctx.save(); rr(x, y - 46, Wd * ex, 92, 46); ctx.clip();
  for (let i = 0; i < 5; i++) {
    const k = oB(P(t, t0 + .15 + i * .08, t0 + .45 + i * .08)) * out;
    if (k <= 0) continue;
    ctx.save(); ctx.translate(x + 46 + i * 50, y); ctx.scale(k, k); ctx.rotate((1 - k) * 1.5);
    ctx.fillStyle = TEAL; star(0, 0, 21, 9); ctx.fill(); ctx.restore();
  }
  const kt = oC(P(t, t0 + .45, t0 + .8)) * out;
  ctx.globalAlpha = kt; txt('HAUTE QUALITÉ', x + 46 + 5 * 50, y + 2 + (1 - kt) * 30, 900, 34, TEAL_D, 'left', 3);
  ctx.restore(); ctx.restore();
}

function cta(t) {
  const t0 = 27.5, t1 = 31.8;
  const [pi, po] = win(t, t0, t1, .6, .4);
  if (pi <= 0 || po >= 1) return;
  const out = 1 - ioC(po);
  const x = LX, y = 120, h = 120;
  const label_ = 'REJOIGNEZ-NOUS';
  const lw = tw(label_, 900, 54, 2);
  const Wd = lw + 70 + h;
  const ex = oE(P(pi, .1, 1)) * out;
  ctx.save();
  // main pill
  shadow(true, 40, 14, .32); ctx.fillStyle = TEAL; rr(x, y, Wd * ex, h, h / 2); ctx.fill(); shadow(false);
  ctx.save(); rr(x, y, Wd * ex, h, h / 2); ctx.clip();
  const kt = oC(P(t, t0 + .25, t0 + .7));
  ctx.globalAlpha = kt; txt(label_, x + 48 - (1 - kt) * 40, y + h / 2 + 2, 900, 54, WHITE, 'left', 2);
  ctx.restore();
  // arrow circle (nudges)
  const ks = oB(P(t, t0 + .45, t0 + .95)) * out;
  if (ks > 0) {
    const nud = Math.sin(Math.max(0, t - t0 - 1) * 5) * 8 * (t > t0 + 1 ? 1 : 0);
    ctx.save(); ctx.translate(x + Wd - h / 2, y + h / 2); ctx.scale(ks, ks);
    ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, 0, h / 2 - 12, 0, 7); ctx.fill();
    icon('arrow', nud, 0, 56, TEAL); ctx.restore();
  }
  // subline with highlight
  const ks2 = P(t, 28.45, 29.0);
  if (ks2 > 0) {
    const s1 = 'Maîtrisez la photographie', s2 = 'dentaire';
    const y2 = y + h + 66, a2 = oC(ks2) * out;
    ctx.globalAlpha = a2; shadow(true, 16, 3, .55);
    txt(s1, x + 8, y2 + (1 - oC(ks2)) * 30, 800, 44, WHITE, 'left', .5); shadow(false);
    const hw = tw(s2, 900, 46, 1) + 36;
    const hk = oE(P(t, 29.05, 29.5)) * out;
    ctx.fillStyle = YEL; rr(x, y2 + 40, hw * hk, 70, 12); ctx.fill();
    ctx.globalAlpha = oC(P(t, 29.2, 29.55)) * out;
    txt(s2, x + 18, y2 + 77, 900, 46, TEAL_D, 'left', 1);
    ctx.globalAlpha = 1;
  }
  // website pill
  const kw = P(t, 30.15, 30.6);
  if (kw > 0) {
    const s = 'admformation.com', ww = tw(s, 800, 34, 1) + 70, yw = y + h + 66 + 40, xw = x + tw('dentaire', 900, 46, 1) + 36 + 22;
    const e = oE(kw) * out;
    shadow(true); ctx.fillStyle = WHITE; rr(xw, yw, ww * e, 70, 35); ctx.fill(); shadow(false);
    ctx.save(); rr(xw, yw, ww * e, 70, 35); ctx.clip();
    ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(xw + 35, yw + 35, 10, 0, 7); ctx.fill();
    txt(s, xw + 56, yw + 37, 800, 34, TEAL, 'left', 1); ctx.restore();
  }
  ctx.restore();
}

function progress(t) {
  const a = 1 - P(t, 31.55, 31.9); if (a <= 0 || t < .1) return;
  const k = cl(t / 31.8);
  ctx.save(); ctx.globalAlpha = a * oC(P(t, .1, .6));
  ctx.fillStyle = 'rgba(25,107,106,.55)'; ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = YEL; ctx.fillRect(0, 0, W * k, 10);
  ctx.restore();
}

// ---------- boot ----------
const IMG = {};
function load(k, src) { return new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = src; }); }
Promise.all([
  load('toothW', 'tooth_w.png'), load('toothT', 'tooth_t.png'),
  ...[600, 800, 900].map(w => document.fonts.load(`${w} 40px ${F}`, 'Aé')),
]).then(() => { render(0); window.ready = true; });
