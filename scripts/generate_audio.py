import os
import wave
import struct
import math
import random

os.makedirs("public/assets/audio", exist_ok=True)
SAMPLE_RATE = 44100

def write_wav(filename, samples):
    filepath = os.path.join("public/assets/audio", filename)
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        # Clamp samples between -32767 and 32767
        packed = bytearray()
        for s in samples:
            val = max(-32767, min(32767, int(s * 32767)))
            packed.extend(struct.pack('<h', val))
        wav_file.writeframes(packed)
    print(f"Generated {filepath}")

def gen_slash(duration=0.18, start_f=900, end_f=200):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = start_f * (1.0 - t) + end_f * t
        env = math.sin(t * math.pi) ** 0.8
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * 0.4
        tone = math.sin(phase) * 0.6
        samples.append((tone + noise) * env * 0.85)
    return samples

def gen_lunge(duration=0.25):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 300 + 400 * math.sin(t * math.pi)
        env = (1.0 - t) ** 0.7
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * (0.5 * (1.0 - t))
        tone = math.sin(phase) * 0.5
        samples.append((tone + noise) * env)
    return samples

def gen_slam(duration=0.45, intensity=1.0):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 140 * math.exp(-4.5 * t) + 40
        env = math.exp(-5.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        distortion = math.sin(phase)
        distortion = math.tanh(distortion * 2.5) * 0.7
        noise = (random.random() * 2.0 - 1.0) * 0.3 * math.exp(-8.0 * t)
        samples.append((distortion + noise) * env * intensity)
    return samples

def gen_hurt(pitch=350, duration=0.15):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = pitch * (1.0 - 0.7 * t)
        env = math.exp(-7.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * 0.2
        samples.append((math.sin(phase) + noise) * env * 0.8)
    return samples

def gen_bow_shoot(duration=0.2):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 800 * math.exp(-12.0 * t) + 250
        env = math.exp(-6.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        snap = (random.random() * 2.0 - 1.0) * 0.5 * math.exp(-30.0 * t)
        samples.append((math.sin(phase) * 0.6 + snap) * env)
    return samples

def gen_arrow_hit(duration=0.12):
    samples = []
    n = int(SAMPLE_RATE * duration)
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 600 * math.exp(-15.0 * t) + 120
        env = math.exp(-10.0 * t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        thud = (random.random() * 2.0 - 1.0) * 0.4 * math.exp(-15.0 * t)
        samples.append((math.sin(phase) * 0.6 + thud) * env)
    return samples

def gen_chime(notes, note_len=0.08):
    samples = []
    for freq in notes:
        n = int(SAMPLE_RATE * note_len)
        phase = 0.0
        for i in range(n):
            t = i / n
            env = math.exp(-4.0 * t)
            phase += 2.0 * math.pi * freq / SAMPLE_RATE
            harmonic = math.sin(phase * 2) * 0.3
            samples.append((math.sin(phase) * 0.7 + harmonic) * env * 0.6)
    return samples

def gen_click():
    n = int(SAMPLE_RATE * 0.04)
    samples = []
    phase = 0.0
    for i in range(n):
        t = i / n
        phase += 2.0 * math.pi * 1200 / SAMPLE_RATE
        env = (1.0 - t) ** 2
        samples.append(math.sin(phase) * env * 0.5)
    return samples

# Generate SFX files
write_wav("hero_slash1.wav", gen_slash(0.16, 950, 220))
write_wav("hero_slash2.wav", gen_slash(0.14, 1200, 300))
write_wav("hero_lunge.wav", gen_lunge(0.25))
write_wav("hero_slam.wav", gen_slam(0.5, 1.0))
write_wav("hero_hurt.wav", gen_hurt(280, 0.18))
write_wav("hero_defeat.wav", gen_chime([300, 240, 180, 120], 0.15))
write_wav("hero_respawn.wav", gen_chime([440, 554, 659, 880], 0.12))
write_wav("life_lost.wav", gen_chime([520, 390, 260], 0.14))

write_wav("swarmer_swing.wav", gen_slash(0.22, 500, 150))
write_wav("swarmer_hurt.wav", gen_hurt(520, 0.12))
write_wav("swarmer_dead.wav", gen_hurt(380, 0.22))

write_wav("archer_shoot.wav", gen_bow_shoot(0.2))
write_wav("arrow_hit.wav", gen_arrow_hit(0.12))

write_wav("boss_charge.wav", gen_chime([120, 150, 180, 240], 0.18))
write_wav("boss_slam.wav", gen_slam(0.65, 1.2))
write_wav("boss_hurt.wav", gen_slam(0.25, 0.6))
write_wav("boss_defeat.wav", gen_slam(0.8, 1.1))

write_wav("ui_click.wav", gen_click())
write_wav("game_over.wav", gen_chime([400, 340, 280, 200, 140], 0.22))
print("All audio files generated successfully!")
