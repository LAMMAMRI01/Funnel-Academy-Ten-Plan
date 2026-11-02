# motion-tools MCP

One MCP server for: **ffmpeg, ffprobe, yt-dlp, Whisper, Remotion, HyperFrames**.

## Tools
| Tool | What it does |
|---|---|
| `ffmpeg` / `ffprobe` | Run ffmpeg, inspect a media file |
| `yt_dlp` | Download a video (or audio only) |
| `whisper` | Transcribe with timestamps (+ `.srt`) |
| `remotion_render` | Render a Remotion composition |
| `hyperframes_init` / `hyperframes_render` | Create and render HyperFrames projects |
| `check_tools` | Show what is installed |

## Windows: one command
Open **PowerShell** and run:
```powershell
irm https://raw.githubusercontent.com/LAMMAMRI01/Funnel-Academy-Ten-Plan/claude/motion-video-start-77q5x2/motion/install-windows.ps1 | iex
```
It installs Node.js, Python, ffmpeg, yt-dlp, the Whisper model, Remotion and HyperFrames,
then registers `motion-tools` in Claude Desktop and Claude Code. Restart Claude afterwards.

## Install (manual / Linux)
```bash
cd motion/mcp-server && npm install
```
Requires ffmpeg, yt-dlp, and a `whisper` command on PATH (see `../setup-tools.sh`).

## Claude Code
```bash
claude mcp add motion-tools -- node /ABSOLUTE/PATH/motion/mcp-server/index.js
```

## Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "motion-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/motion/mcp-server/index.js"],
      "env": {
        "REMOTION_CHROME": "",
        "GSAP_LOCAL": ""
      }
    }
  }
}
```
`REMOTION_CHROME`: path to a Chrome/Chromium binary (optional).
`GSAP_LOCAL`: path to a local `gsap.min.js` when the jsDelivr CDN is blocked (optional).
