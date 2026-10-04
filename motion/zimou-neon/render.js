// usage: node render.js preview t1,t2,...  |  node render.js full <audio.mp4> <out.mp4>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [mode, a1, a2] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  const grab = t => page.evaluate(t => { render(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.94).split(',')[1]; }, t);

  if (mode === 'preview') {
    fs.mkdirSync(path.join(__dirname, 'prev'), { recursive: true });
    for (const t of a1.split(',').map(Number)) {
      fs.writeFileSync(path.join(__dirname, 'prev', `t${t.toFixed(2)}.jpg`), Buffer.from(await grab(t), 'base64'));
    }
  } else {
    const fps = 30, dur = 41.5667, N = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-i', a1, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', a2], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) {
      const buf = Buffer.from(await grab(f / fps), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', a2);
  }
  await browser.close();
})();
