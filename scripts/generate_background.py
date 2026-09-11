import os
import zlib
import struct
import binascii
import math
import random

os.makedirs("public/assets/background", exist_ok=True)

WIDTH = 1280
HEIGHT = 720

def write_png(filepath, width, height, rgba_data):
    raw_lines = bytearray()
    for y in range(height):
        raw_lines.append(0)
        raw_lines.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])
    compressed = zlib.compress(raw_lines)
    def make_chunk(chunk_type, data):
        length = len(data)
        crc = binascii.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I4s', length, chunk_type) + data + struct.pack('>I', crc)
    out = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    out.extend(make_chunk(b'IHDR', ihdr_data))
    out.extend(make_chunk(b'IDAT', compressed))
    out.extend(make_chunk(b'IEND', b''))
    with open(filepath, 'wb') as f: f.write(out)

px = bytearray(WIDTH * HEIGHT * 4)

def set_pixel(x, y, r, g, b, a=255):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        idx = (y * WIDTH + x) * 4
        px[idx] = r
        px[idx+1] = g
        px[idx+2] = b
        px[idx+3] = a

def blend_pixel(x, y, r, g, b, a_factor):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        idx = (y * WIDTH + x) * 4
        inv = 1.0 - a_factor
        px[idx] = int(px[idx] * inv + r * a_factor)
        px[idx+1] = int(px[idx+1] * inv + g * a_factor)
        px[idx+2] = int(px[idx+2] * inv + b * a_factor)

# Ground level
GROUND_Y = 540

# 1. Sky & Atmosphere gradient
for y in range(HEIGHT):
    for x in range(WIDTH):
        if y < GROUND_Y:
            t = y / GROUND_Y
            # Night sky with deep violet / crimson twilight gradient
            r = int(18 + 35 * t + 8 * math.sin(x * 0.005))
            g = int(12 + 18 * t)
            b = int(32 + 25 * t)
        else:
            # Below ground: dark stone foundations
            t = (y - GROUND_Y) / (HEIGHT - GROUND_Y)
            r = int(32 - 15 * t)
            g = int(30 - 15 * t)
            b = int(36 - 15 * t)
        set_pixel(x, y, r, g, b)

# 2. Crimson blood moon in background
moon_cx, moon_cy, moon_r = 640, 180, 85
for y in range(moon_cy - moon_r * 2, moon_cy + moon_r * 2):
    for x in range(moon_cx - moon_r * 2, moon_cx + moon_r * 2):
        dist = math.hypot(x - moon_cx, y - moon_cy)
        if dist < moon_r:
            # Crater texture
            crater = math.sin(x * 0.1) * math.cos(y * 0.1) * 15
            mr = min(255, int(210 + crater))
            mg = min(255, int(80 + crater * 0.5))
            mb = min(255, int(80 + crater * 0.5))
            set_pixel(x, y, mr, mg, mb)
        elif dist < moon_r * 1.8:
            # Moon halo glow
            factor = (1.0 - (dist - moon_r) / (moon_r * 0.8)) * 0.35
            blend_pixel(x, y, 220, 60, 60, factor)

# 3. Distant Colosseum gothic stone arches
random.seed(42)
for x in range(0, WIDTH, 160):
    arch_w = 120
    arch_h = 240
    base_y = GROUND_Y
    top_y = base_y - arch_h
    # Pillars
    for px_x in range(x, min(WIDTH, x + 25)):
        for py in range(top_y, base_y):
            stone = 40 + int((px_x % 8 == 0 or py % 16 == 0) * 15)
            set_pixel(px_x, py, stone, stone - 4, stone + 8)
    for px_x in range(x + arch_w - 25, min(WIDTH, x + arch_w)):
        for py in range(top_y, base_y):
            stone = 40 + int((px_x % 8 == 0 or py % 16 == 0) * 15)
            set_pixel(px_x, py, stone, stone - 4, stone + 8)
    # Arch curve on top
    for ax in range(x, min(WIDTH, x + arch_w)):
        rel = (ax - (x + arch_w // 2)) / (arch_w // 2)
        if abs(rel) <= 1.0:
            arch_curv = int(math.sqrt(max(0.0, 1.0 - rel * rel)) * 40)
            for ay in range(top_y - arch_curv, top_y + 15):
                set_pixel(ax, ay, 48, 44, 56)

# 4. Arena Pillars and Torches with glowing fire halos
torch_xs = [120, 360, 600, 840, 1080]
for tx in torch_xs:
    # Stone pillar
    for px_x in range(tx - 18, tx + 18):
        for py in range(GROUND_Y - 260, GROUND_Y):
            stone_base = 55 if (px_x == tx - 18 or px_x == tx + 17 or py % 20 == 0) else 75
            highlight = int(12 * (1.0 - abs(px_x - tx) / 18.0))
            set_pixel(px_x, py, stone_base + highlight, stone_base - 5 + highlight, stone_base + 10 + highlight)
    # Iron torch sconce
    ty = GROUND_Y - 270
    for px_x in range(tx - 10, tx + 10):
        for py in range(ty, ty + 15):
            set_pixel(px_x, py, 30, 28, 32)
    # Torch flame glow halo
    for gy in range(ty - 70, ty + 70):
        for gx in range(tx - 70, tx + 70):
            d = math.hypot(gx - tx, gy - (ty - 10))
            if d < 65:
                f = (1.0 - d / 65.0) ** 1.8 * 0.65
                blend_pixel(gx, gy, 255, 150, 40, f)
    # Torch flame core
    for fy in range(ty - 25, ty + 2):
        fw = int((ty - fy) * 0.35 + 2)
        for fx in range(tx - fw, tx + fw + 1):
            set_pixel(fx, fy, 255, 230, 120)

# 5. Arena Ground Platform (y=GROUND_Y to HEIGHT)
# Paved arena stones with blood stains and worn stone texture
for y in range(GROUND_Y, HEIGHT):
    for x in range(WIDTH):
        row = (y - GROUND_Y) // 18
        col = (x + (row % 2) * 28) // 56
        is_mortar = (y - GROUND_Y) % 18 == 0 or (x + (row % 2) * 28) % 56 == 0
        
        # Base stone tone with perspective shading
        depth_light = 1.0 - (y - GROUND_Y) / 180.0
        base = int(68 + 25 * depth_light)
        if is_mortar:
            set_pixel(x, y, int(base * 0.5), int(base * 0.48), int(base * 0.55))
        else:
            # Noise grain
            grain = ((x * 13 + y * 29) % 11) - 5
            set_pixel(x, y, base + grain, base - 6 + grain, base + 4 + grain)

# Edge top stone curb
for x in range(WIDTH):
    set_pixel(x, GROUND_Y, 130, 125, 140)
    set_pixel(x, GROUND_Y + 1, 95, 90, 105)

out_path = "public/assets/background/arena_bg.png"
write_png(out_path, WIDTH, HEIGHT, px)
print(f"Generated arena background at {out_path} ({WIDTH}x{HEIGHT})")
