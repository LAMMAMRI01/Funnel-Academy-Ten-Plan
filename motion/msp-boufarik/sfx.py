import numpy as np, wave, sys, re, json
sr=48000; DUR=48.6; N=int(sr*DUR); t=np.arange(N)/sr
# soft pad: C major add9, slow swell, gentle tremolo
f=[130.81,196.0,261.63,329.63,392.0]
pad=sum(np.sin(2*np.pi*fr*t+i)*(0.5 if i<2 else 0.3) for i,fr in enumerate(f))
pad*= (0.75+0.25*np.sin(2*np.pi*0.18*t))
env=np.clip(t/3,0,1)*np.clip((DUR-t)/2.5,0,1)
pad=pad*env*0.035
# pulse on the beat (100 bpm soft kick-like thump) from 15s to 34.6s
beat=np.zeros(N)
for bt in np.arange(15.3,34.6,0.6):
    i=int(bt*sr); L=int(0.18*sr); tt=np.arange(L)/sr
    beat[i:i+L]+=np.sin(2*np.pi*(90-40*tt/0.18)*tt)*np.exp(-tt*22)*0.10
# pen scratches
rng=np.random.default_rng(3)
def scratch(at,d,amp):
    i=int(at*sr); L=int(d*sr); n=rng.standard_normal(L)
    # crude band-pass: difference of moving averages
    k1=np.convolve(n,np.ones(3)/3,'same'); k2=np.convolve(n,np.ones(14)/14,'same')
    x=(k1-k2)*np.sin(np.linspace(0,np.pi,L))**0.7*amp
    out[i:i+L]+=x[:max(0,min(L,N-i))]
out=np.zeros(N)
times=json.loads(sys.argv[1])
for at,slow in times:
    d=0.24 if slow else 0.09
    scratch(at,d,0.22); scratch(at+d+0.03,d,0.22)
mix=pad+beat+out
w=wave.open(sys.argv[2],'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes()); w.close()
