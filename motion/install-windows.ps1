# motion-tools for Windows: ffmpeg, yt-dlp, Whisper (offline), Remotion, HyperFrames + MCP server.
# Run in PowerShell:
#   irm https://raw.githubusercontent.com/LAMMAMRI01/Funnel-Academy-Ten-Plan/claude/motion-video-start-77q5x2/motion/install-windows.ps1 | iex
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$Branch = 'claude/motion-video-start-77q5x2'
$Raw = "https://raw.githubusercontent.com/LAMMAMRI01/Funnel-Academy-Ten-Plan/$Branch/motion"
$T = Join-Path $env:USERPROFILE 'motion-tools'
$Srv = Join-Path $T 'mcp-server'
$Wh = Join-Path $T 'whisper'

function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}
# The Microsoft Store "python" alias in WindowsApps is a stub, not a real install.
function Need($cmd) { $c = Get-Command $cmd -ErrorAction SilentlyContinue; [bool]($c -and $c.Source -notlike '*\WindowsApps\*') }
function WingetInstall($id, $cmd) {
  if (Need $cmd) { Write-Host "$cmd already installed"; return }
  winget install --id $id -e --accept-source-agreements --accept-package-agreements --silent
  Refresh-Path
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'winget is missing: install "App Installer" from the Microsoft Store, then run this again.' }

Step 'Node.js, Python, ffmpeg'
WingetInstall 'OpenJS.NodeJS.LTS' 'node'
WingetInstall 'Python.Python.3.11' 'python'
WingetInstall 'Gyan.FFmpeg' 'ffmpeg'
Refresh-Path
foreach ($c in 'node', 'npm', 'python', 'ffmpeg') { if (-not (Need $c)) { throw "$c not found after install: close PowerShell, open a new one and run this again." } }

Step 'yt-dlp + Whisper runtime'
python -m pip install --upgrade --quiet pip
python -m pip install --upgrade --quiet yt-dlp sherpa-onnx numpy

Step 'Whisper model (small, ~600 MB download, one time)'
New-Item -ItemType Directory -Force -Path (Join-Path $Wh 'model') | Out-Null
if (-not (Test-Path (Join-Path $Wh 'model\small-encoder.int8.onnx'))) {
  $tb = Join-Path $env:TEMP 'whisper-small.tar.bz2'
  curl.exe -L --fail -o $tb 'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2'
  tar.exe -xjf $tb -C (Join-Path $Wh 'model') --strip-components=1
  Get-ChildItem (Join-Path $Wh 'model') | Where-Object { $_.Name -notmatch 'int8\.onnx$|tokens\.txt$' } | Remove-Item -Recurse -Force
  Remove-Item $tb -Force
}
Invoke-WebRequest "$Raw/mcp-server/whisper.py" -OutFile (Join-Path $Wh 'whisper.py')
$Bin = Join-Path $T 'bin'
New-Item -ItemType Directory -Force -Path $Bin | Out-Null
Set-Content -Encoding ASCII (Join-Path $Bin 'whisper.cmd') "@python `"$Wh\whisper.py`" %*"
$up = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($up -notlike "*$Bin*") { [Environment]::SetEnvironmentVariable('Path', "$up;$Bin", 'User') }
Refresh-Path

Step 'MCP server (Remotion + HyperFrames included)'
New-Item -ItemType Directory -Force -Path $Srv | Out-Null
foreach ($f in 'index.js', 'package.json', 'package-lock.json') { Invoke-WebRequest "$Raw/mcp-server/$f" -OutFile (Join-Path $Srv $f) }
Push-Location $Srv; npm install --no-audit --no-fund --loglevel=error; Pop-Location
$Index = Join-Path $Srv 'index.js'
$WhPy = Join-Path $Wh 'whisper.py'

Step 'Register with Claude'
if (Need 'claude') {
  try { claude mcp remove motion-tools --scope user *> $null } catch {}
  claude mcp add motion-tools --scope user -e "WHISPER_SCRIPT=$WhPy" -- node "$Index"
  Write-Host 'Added to Claude Code.'
}
$cfgDir = Join-Path $env:APPDATA 'Claude'
New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null
$cfg = Join-Path $cfgDir 'claude_desktop_config.json'
$j = if (Test-Path $cfg) { Get-Content $cfg -Raw | ConvertFrom-Json } else { [pscustomobject]@{} }
if (-not $j.PSObject.Properties['mcpServers']) { $j | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([pscustomobject]@{}) }
$entry = [pscustomobject]@{ command = 'node'; args = @($Index); env = [pscustomobject]@{ WHISPER_SCRIPT = $WhPy } }
$j.mcpServers | Add-Member -Force -NotePropertyName 'motion-tools' -NotePropertyValue $entry
$j | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $cfg
Write-Host "Added to Claude Desktop ($cfg)."

Step 'Quick test'
ffmpeg -hide_banner -loglevel error -y -f lavfi -i testsrc2=s=540x960:d=1 -pix_fmt yuv420p (Join-Path $env:TEMP 'mt_test.mp4'); Write-Host "ffmpeg   OK"
Write-Host ("yt-dlp   " + (python -m yt_dlp --version))
python $WhPy --help | Select-Object -First 1
node (Join-Path $Srv 'node_modules\hyperframes\bin\hyperframes.mjs') --version

Write-Host "`nDone. Restart Claude Desktop (or open a new Claude Code session) to use the 'motion-tools' MCP." -ForegroundColor Green
