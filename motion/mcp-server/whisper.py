#!/usr/bin/env python3
"""whisper <media> [--lang ar|fr|en|...] [--srt out.srt]  — offline Whisper-small, timestamped segments."""
import re, subprocess, argparse, os, sys, numpy as np, sherpa_onnx
sys.stdout.reconfigure(encoding="utf-8")  # Arabic output on Windows consoles
ap = argparse.ArgumentParser(); ap.add_argument('media'); ap.add_argument('--lang', default='ar'); ap.add_argument('--srt')
a = ap.parse_args()
D = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'model') + '/'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=D+'small-encoder.int8.onnx', decoder=D+'small-decoder.int8.onnx',
      tokens=D+'small-tokens.txt', language=a.lang, task='transcribe', num_threads=4)
raw = subprocess.run(['ffmpeg','-v','error','-i',a.media,'-ac','1','-ar','16000','-f','f32le','-'], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32); dur = len(x)/16000
log = subprocess.run(['ffmpeg','-i',a.media,'-af','silencedetect=n=-32dB:d=0.3','-f','null','-'], capture_output=True, text=True).stderr
st = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', log)]
cuts = [0.0] + [(s+e)/2 for s, e in zip(st, en)] + [dur]
segs = []
for s, e in zip(cuts, cuts[1:]):
    if segs and e - segs[-1][0] < 6: segs[-1][1] = e
    else: segs.append([s, e])
out = []
for s, e in segs:
    while e - s > 25: out.append((s, s+25)); s += 25
    out.append((s, e))
fmt = lambda t: f"{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(t*1000%1000):03}"
srt = []
for s, e in out:
    seg = x[int(s*16000):int(e*16000)]
    if len(seg) < 1600: continue
    sm = rec.create_stream(); sm.accept_waveform(16000, seg); rec.decode_stream(sm)
    t = sm.result.text.strip()
    if not t: continue
    print(f"[{s:6.2f} - {e:6.2f}] {t}", flush=True)
    srt.append(f"{len(srt)+1}\n{fmt(s)} --> {fmt(e)}\n{t}\n")
if a.srt: open(a.srt, 'w', encoding='utf-8').write('\n'.join(srt))
