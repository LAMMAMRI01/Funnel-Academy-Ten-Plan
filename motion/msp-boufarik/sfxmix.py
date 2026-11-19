import numpy as np, subprocess, json, wave, sys
V, out = sys.argv[1], sys.argv[2]
sr = 48000; DUR = 48.6; N = int(sr * DUR)
def load(name):
    raw = subprocess.run(['ffmpeg','-v','error','-i',f'{V}/sfx/{name}.mp3','-ac','2','-ar',str(sr),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)
S = {k: load(k) for k in ['whoosh','pop','tick','paper','impact','ding','alert','success']}
for k in S:  # normalize each effect to the same peak
    S[k] = S[k] / (np.abs(S[k]).max() + 1e-9)
mix = np.zeros((N, 2), np.float32)
def put(name, at, db):
    x = S[name] * 10 ** (db / 20); i = int(at * sr); L = min(len(x), N - i)
    if L > 0: mix[i:i+L] += x[:L]
marks = json.load(open(f'{V}/marks.json'))
ev = [
 ('whoosh',.15,-14),('impact',.35,-16),('pop',.95,-18),('pop',2.05,-20),('pop',3.35,-17),
 ('whoosh',5.8,-14),('pop',6.55,-17),('whoosh',6.95,-20),('pop',8.65,-16),
 ('whoosh',11.05,-14),('impact',11.6,-13),('ding',13.45,-22),
 ('whoosh',15.2,-15),('paper',15.35,-14),('ding',17.25,-20),
 ('whoosh',19.65,-16),('pop',20.45,-20),('whoosh',28.25,-17),
 ('success',33.9,-14),
 ('whoosh',34.55,-14),('ding',34.98,-18),('ding',35.63,-18),('alert',35.98,-18),('alert',37.63,-18),
 ('whoosh',39.85,-14),('pop',40.15,-17),('impact',43.4,-12),('pop',45.05,-16),('ding',45.45,-20),
]
for n, at, db in ev: put(n, at, db)
for at, slow in marks: put('tick', at + .05, -17 if slow else -21)
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
print('events', len(ev) + len(marks))
