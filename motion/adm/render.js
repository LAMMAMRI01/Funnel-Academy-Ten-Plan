// node render.js preview t1,t2  |  node render.js full <video> <out.mp4>
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const VID = '/root/.claude/uploads/a6363546-7ebe-52c0-a8c1-21a984bd818b/2eb68ed4-IMG_2185.MOV';
(async () => {
  const [mode, a1, a2] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  const grab = t => page.evaluate(t => { render(t); return document.getElementById('cv').toDataURL('image/png').split(',')[1]; }, t);
  if (mode === 'preview') {
    fs.mkdirSync(path.join(__dirname, 'prev'), { recursive: true });
    for (const t of a1.split(',').map(Number)) {
      const ov = path.join(__dirname, 'prev', 'ov.png');
      fs.writeFileSync(ov, Buffer.from(await grab(t), 'base64'));
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', VID, '-i', ov, '-filter_complex',
        '[0:v]scale=1080:1920:flags=lanczos[b];[b][1:v]overlay=0:0,scale=540:960', '-frames:v', '1',
        path.join(__dirname, 'prev', `t${t.toFixed(2)}.jpg`)]);
    }
  } else {
    const fps = 30, N = Math.round(Number(process.env.DUR || 32.1) * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', a1, '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-filter_complex', '[0:v]scale=1080:1920:flags=lanczos,fps=30[b];[b][1:v]overlay=0:0:eof_action=pass:format=auto[v]',
      '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'copy', '-movflags', '+faststart', a2], { stdio: ['pipe', 'inherit', 'inherit'] });
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
