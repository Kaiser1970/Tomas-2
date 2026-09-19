"""Genera los 6 tonos de recordatorio (WAV) que usa Android en res/raw.
Reproduce los mismos tonos sintetizados de src/services/audioService.ts.
Uso: python3 tools/generate_tones.py
"""
import wave, struct, math, os

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res', 'raw')

def osc(kind, phase):
    p = phase % 1.0
    if kind == 'sine':
        return math.sin(2 * math.pi * p)
    if kind == 'triangle':
        return 4 * abs(p - 0.5) - 1
    if kind == 'square':
        return 1.0 if p < 0.5 else -1.0
    return 0.0

def note(buf, start, dur, freq, kind, gain, end_gain=0.001, freq_end=None, attack=0.0):
    n0 = int(start * SR)
    n = int(dur * SR)
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = freq if freq_end is None else freq * (freq_end / freq) ** (t / dur)
        phase += f / SR
        if attack and t < attack:
            g = gain * (t / attack)
        else:
            frac = (t - attack) / max(dur - attack, 1e-6)
            g = gain * (end_gain / gain) ** frac
        idx = n0 + i
        if idx < len(buf):
            buf[idx] += osc(kind, phase) * g

def render(events, total):
    buf = [0.0] * int(total * SR)
    for e in events:
        note(buf, **e)
    peak = max(max(abs(x) for x in buf), 1e-6)
    return [x / peak * 0.9 for x in buf]

def repeat(events, offsets):
    out = []
    for off in offsets:
        for e in events:
            e2 = dict(e); e2['start'] = e['start'] + off
            out.append(e2)
    return out

TONES = {
    'campana_zen': ([
        dict(start=0, dur=1.8, freq=523.25, kind='sine', gain=0.3),
        dict(start=0, dur=1.8, freq=1046.5, kind='triangle', gain=0.3),
    ], 2.2, [0, 2.4]),
    'pulso_clinico': ([
        dict(start=0.00, dur=0.3, freq=659.25, kind='sine', gain=0.25),
        dict(start=0.14, dur=0.3, freq=880.0, kind='sine', gain=0.25),
    ], 0.6, [0, 0.9, 1.8]),
    'carillon_suave': ([
        dict(start=i * 0.12, dur=0.8, freq=f, kind='sine', gain=0.2)
        for i, f in enumerate([523.25, 659.25, 783.99, 1046.5])
    ], 1.4, [0, 1.6]),
    'melodia_alerta': ([
        dict(start=i * 0.15, dur=0.4, freq=f, kind='triangle', gain=0.25)
        for i, f in enumerate([659.25, 830.61, 987.77])
    ], 0.9, [0, 1.0, 2.0]),
    'bip_digital': ([
        dict(start=i * 0.1, dur=0.06, freq=800, kind='square', gain=0.12)
        for i in range(2)
    ], 0.3, [0, 0.5, 1.0, 1.5]),
    'flauta_calma': ([
        dict(start=0, dur=1.2, freq=440, kind='sine', gain=0.25, freq_end=880, attack=0.2),
    ], 1.4, [0, 1.6]),
}

os.makedirs(OUT, exist_ok=True)
for name, (events, base_len, offsets) in TONES.items():
    total = max(offsets) + base_len + 0.2
    data = render(repeat(events, offsets), total)
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(x * 32767)) for x in data))
    print(name, round(total, 1), 's')
