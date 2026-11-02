#!/usr/bin/env node
// motion-tools MCP: ffmpeg, yt-dlp, Whisper, Remotion and HyperFrames over stdio.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.REMOTION_CHROME || process.env.PUPPETEER_EXECUTABLE_PATH || '';
const TIMEOUT = Number(process.env.MOTION_TIMEOUT_MS || 30 * 60 * 1000);

// Run a command without a shell; return combined output (tail-trimmed).
function run(cmd, args, { cwd, timeout = TIMEOUT } = {}) {
  return new Promise(resolve => {
    const p = spawn(cmd, args, { cwd, env: process.env });
    let out = '';
    const add = d => { out += d; if (out.length > 200000) out = out.slice(-100000); };
    p.stdout.on('data', add); p.stderr.on('data', add);
    const timer = setTimeout(() => { p.kill('SIGKILL'); out += `\n[killed after ${timeout} ms]`; }, timeout);
    p.on('error', e => { clearTimeout(timer); resolve({ code: -1, out: `${cmd}: ${e.message}` }); });
    p.on('close', code => { clearTimeout(timer); resolve({ code, out }); });
  });
}
const reply = ({ code, out }, max = 8000) => ({
  content: [{ type: 'text', text: `exit ${code}\n${out.length > max ? '…' + out.slice(-max) : out}` }],
  isError: code !== 0,
});

const server = new McpServer({ name: 'motion-tools', version: '1.0.0' });

server.tool('ffmpeg', 'Run ffmpeg with the given arguments (no shell). Always include -y when overwriting.',
  { args: z.array(z.string()).describe('ffmpeg arguments, e.g. ["-y","-i","in.mov","out.mp4"]'), cwd: z.string().optional() },
  async ({ args, cwd }) => reply(await run('ffmpeg', ['-hide_banner', ...args], { cwd })));

server.tool('ffprobe', 'Inspect a media file: duration, streams, resolution, codecs (JSON).',
  { file: z.string() },
  async ({ file }) => reply(await run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]), 20000));

server.tool('yt_dlp', 'Download a video or audio with yt-dlp.',
  {
    url: z.string(), out_dir: z.string().default('.'),
    audio_only: z.boolean().default(false), max_height: z.number().int().optional(),
  },
  async ({ url, out_dir, audio_only, max_height }) => {
    const a = ['-P', out_dir, '-o', '%(title).80s [%(id)s].%(ext)s', '--no-playlist'];
    if (audio_only) a.push('-x', '--audio-format', 'mp3');
    else if (max_height) a.push('-f', `bv*[height<=${max_height}]+ba/b[height<=${max_height}]`, '--merge-output-format', 'mp4');
    return reply(await run('yt-dlp', [...a, url]));
  });

server.tool('whisper', 'Transcribe speech in an audio/video file with timestamps; optional .srt output.',
  { file: z.string(), lang: z.string().default('ar').describe('ar, fr, en, …'), srt: z.string().optional() },
  async ({ file, lang, srt }) => reply(await run('whisper', [file, '--lang', lang, ...(srt ? ['--srt', srt] : [])]), 30000));

server.tool('remotion_render', 'Render a Remotion composition from a project folder.',
  {
    project_dir: z.string(), entry: z.string().default('src/index.ts'), composition: z.string(), out: z.string(),
    props: z.record(z.any()).optional().describe('input props as an object'),
  },
  async ({ project_dir, entry, composition, out, props }) => {
    const a = ['remotion', 'render', entry, composition, out, '--log=error'];
    if (CHROME) a.push(`--browser-executable=${CHROME}`);
    if (props) a.push(`--props=${JSON.stringify(props)}`);
    return reply(await run('npx', a, { cwd: project_dir }));
  });

server.tool('hyperframes_init', 'Create a new HyperFrames (HTML + GSAP) project.',
  {
    parent_dir: z.string(), name: z.string(),
    resolution: z.enum(['portrait', 'landscape', 'square', 'portrait-4k', 'landscape-4k']).default('portrait'),
    example: z.string().default('blank'),
  },
  async ({ parent_dir, name, resolution, example }) => {
    const r = await run('npx', ['hyperframes', 'init', name, '--example', example, '--resolution', resolution, '--non-interactive', '--skip-skills'], { cwd: parent_dir });
    // Offline GSAP: when GSAP_LOCAL points to gsap.min.js, use it instead of the CDN.
    const html = path.join(parent_dir, name, 'index.html');
    if (r.code === 0 && process.env.GSAP_LOCAL && fs.existsSync(html)) {
      fs.copyFileSync(process.env.GSAP_LOCAL, path.join(parent_dir, name, 'gsap.min.js'));
      fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@[^"']*\/gsap\.min\.js/g, 'gsap.min.js'));
      r.out += '\n[gsap.min.js copied locally]';
    }
    return reply(r);
  });

server.tool('hyperframes_render', 'Render a HyperFrames project to video.',
  { project_dir: z.string(), out: z.string(), format: z.enum(['mp4', 'webm', 'mov', 'gif']).default('mp4') },
  async ({ project_dir, out, format }) => reply(await run('npx',
    ['hyperframes', 'render', '-o', out, '--format', format, '--quiet'], { cwd: project_dir })));

server.tool('check_tools', 'Show which motion tools are installed and their versions.', {},
  async () => {
    const checks = [['ffmpeg', ['-version']], ['yt-dlp', ['--version']], ['whisper', ['--help']],
      ['npx', ['-y', '-p', '@remotion/cli@4', 'remotion', 'versions']], ['npx', ['hyperframes', '--version']]];
    const lines = [];
    for (const [c, a] of checks) {
      const r = await run(c, a, { timeout: 60000 });
      lines.push(`${r.code === 0 ? 'OK ' : 'ERR'} ${[c, ...a].join(' ')} → ${r.out.trim().split('\n')[0].slice(0, 120)}`);
    }
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  });

await server.connect(new StdioServerTransport());
