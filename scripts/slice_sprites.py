import os
import sys
import zlib
import struct
import binascii
from collections import deque

def unfilter_png(filepath):
    with open(filepath, 'rb') as f:
        signature = f.read(8)
        assert signature == b'\x89PNG\r\n\x1a\n'
        chunks = []
        while True:
            header = f.read(8)
            if not header or len(header) < 8: break
            length, chunk_type = struct.unpack('>I4s', header)
            data = f.read(length)
            crc = f.read(4)
            chunks.append((chunk_type, data))
            if chunk_type == b'IEND': break
    ihdr = [c for c in chunks if c[0] == b'IHDR'][0][1]
    width, height, bit_depth, color_type, comp, filt, inter = struct.unpack('>IIBBBBB', ihdr)
    idat = b''.join([c[1] for c in chunks if c[0] == b'IDAT'])
    raw = zlib.decompress(idat)
    bpp = 4
    stride = width * bpp + 1

    def paeth(a, b, c):
        p = a + b - c
        pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
        if pa <= pb and pa <= pc: return a
        elif pb <= pc: return b
        else: return c

    pixels = bytearray(width * height * 4)
    prev_row = bytearray(width * 4)
    for y in range(height):
        row_offset = y * stride
        filter_type = raw[row_offset]
        row_raw = raw[row_offset + 1 : row_offset + stride]
        curr_row = bytearray(width * 4)
        for x in range(width * 4):
            val = row_raw[x]
            a = curr_row[x - bpp] if x >= bpp else 0
            b = prev_row[x]
            c = prev_row[x - bpp] if x >= bpp else 0
            if filter_type == 0: recon = val
            elif filter_type == 1: recon = (val + a) & 0xFF
            elif filter_type == 2: recon = (val + b) & 0xFF
            elif filter_type == 3: recon = (val + ((a + b) // 2)) & 0xFF
            elif filter_type == 4: recon = (val + paeth(a, b, c)) & 0xFF
            else: recon = val
            curr_row[x] = recon
        pixels[y * width * 4 : (y + 1) * width * 4] = curr_row
        prev_row = curr_row
    return width, height, pixels

def write_png(filepath, width, height, rgba_data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
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

def is_background_pixel(r, g, b):
    # Background checkerboard or light gray / white background
    if abs(r - g) <= 9 and abs(g - b) <= 9 and r >= 200:
        return True
    if r >= 238 and g >= 238 and b >= 238:
        return True
    return False

def crop_pure_character(src_w, src_h, src_px, inner_box):
    x1, y1, x2, y2 = inner_box
    x1 = max(0, min(src_w - 1, x1))
    x2 = max(0, min(src_w, x2))
    y1 = max(0, min(src_h - 1, y1))
    y2 = max(0, min(src_h, y2))
    w = x2 - x1
    h = y2 - y1
    if w <= 0 or h <= 0: return 1, 1, bytearray(4)

    # Initial extraction with background & border line removal
    cell_px = bytearray(w * h * 4)
    for cy in range(h):
        for cx in range(w):
            s_idx = ((y1 + cy) * src_w + (x1 + cx)) * 4
            d_idx = (cy * w + cx) * 4
            r, g, b, a = src_px[s_idx:s_idx+4]
            if is_background_pixel(r, g, b):
                cell_px[d_idx:d_idx+4] = (0, 0, 0, 0)
            else:
                # Discard pure gray border/grid line remnants
                if abs(r - g) <= 6 and abs(g - b) <= 6 and 110 <= r <= 245:
                    cell_px[d_idx:d_idx+4] = (0, 0, 0, 0)
                else:
                    cell_px[d_idx:d_idx+4] = (r, g, b, 255)

    # Connected component labeling: keep only the character and significant weapon/slash arcs
    visited = [False] * (w * h)
    components = []

    for cy in range(h):
        for cx in range(w):
            idx = cy * w + cx
            if visited[idx] or cell_px[idx * 4 + 3] == 0:
                continue

            comp_pixels = []
            queue = deque([(cx, cy)])
            visited[idx] = True

            while queue:
                qx, qy = queue.popleft()
                comp_pixels.append((qx, qy))
                for dx, dy in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(1,-1),(-1,1),(1,1)]:
                    nx, ny = qx + dx, qy + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        nidx = ny * w + nx
                        if not visited[nidx] and cell_px[nidx * 4 + 3] > 0:
                            visited[nidx] = True
                            queue.append((nx, ny))

            components.append(comp_pixels)

    if not components:
        return w, h, cell_px

    components.sort(key=len, reverse=True)
    main_size = len(components[0])

    # Discard any noise / letter remnants < 35 pixels unless it's part of a small entity like arrow
    keep_mask = [[False] * w for _ in range(h)]
    for comp in components:
        if len(comp) >= max(35, main_size * 0.04):
            for cx, cy in comp:
                keep_mask[cy][cx] = True

    for cy in range(h):
        for cx in range(w):
            if not keep_mask[cy][cx]:
                idx = (cy * w + cx) * 4
                cell_px[idx:idx+4] = (0, 0, 0, 0)

    # Tight bounding box
    min_x, max_x, min_y, max_y = w, 0, h, 0
    non_empty = 0
    for cy in range(h):
        for cx in range(w):
            if cell_px[(cy * w + cx) * 4 + 3] > 0:
                non_empty += 1
                if cx < min_x: min_x = cx
                if cx > max_x: max_x = cx
                if cy < min_y: min_y = cy
                if cy > max_y: max_y = cy

    if non_empty == 0:
        return w, h, cell_px

    pad = 2
    out_x1 = max(0, min_x - pad)
    out_y1 = max(0, min_y - pad)
    out_x2 = min(w, max_x + 1 + pad)
    out_y2 = min(h, max_y + 1 + pad)
    out_w = out_x2 - out_x1
    out_h = out_y2 - out_y1

    out_px = bytearray(out_w * out_h * 4)
    for cy in range(out_h):
        for cx in range(out_w):
            s_idx = ((out_y1 + cy) * w + (out_x1 + cx)) * 4
            d_idx = (cy * out_w + cx) * 4
            out_px[d_idx:d_idx+4] = cell_px[s_idx:s_idx+4]

    return out_w, out_h, out_px

def slice_hero(sheet_path, out_dir):
    w, h, px = unfilter_png(sheet_path)
    print(f"Slicing pure hero from {sheet_path} to {out_dir}")

    # 1. Idle (6 frames): strictly y in [54, 142] (below header text "Idle (6)")
    idle_x = [22, 94, 176, 258, 341, 424, 508]
    for i in range(6):
        cw, ch, cpx = crop_pure_character(w, h, px, (idle_x[i], 54, idle_x[i+1], 142))
        write_png(f"{out_dir}/idle_{i+1}.png", cw, ch, cpx)

    # 2. Run (8 frames): strictly below header text
    # Row 1: y in [54, 142]
    run_x_r1 = [530, 642, 728, 822, 924]
    for i in range(4):
        cw, ch, cpx = crop_pure_character(w, h, px, (run_x_r1[i], 54, run_x_r1[i+1], 142))
        write_png(f"{out_dir}/run_{i+1}.png", cw, ch, cpx)

    # Row 2: y in [148, 236]
    run_x_r2 = [530, 642, 728, 822, 924]
    for i in range(4):
        cw, ch, cpx = crop_pure_character(w, h, px, (run_x_r2[i], 148, run_x_r2[i+1], 236))
        write_png(f"{out_dir}/run_{i+5}.png", cw, ch, cpx)

    # 3. Attack (6 frames): strictly y in [283, 416] (below header text "Attack (6)")
    atk_x = [22, 146, 286, 456, 606, 760, 882]
    for i in range(6):
        cw, ch, cpx = crop_pure_character(w, h, px, (atk_x[i], 283, atk_x[i+1], 416))
        write_png(f"{out_dir}/attack_{i+1}.png", cw, ch, cpx)

    # 4. Hurt (3 frames): strictly y in [453, 550] (below header text "Hurt (Damage)")
    hurt_x = [22, 132, 252, 372]
    for i in range(3):
        cw, ch, cpx = crop_pure_character(w, h, px, (hurt_x[i], 453, hurt_x[i+1], 550))
        write_png(f"{out_dir}/hurt_{i+1}.png", cw, ch, cpx)

    # 5. Defeat (2 frames): strictly y in [453, 550] (below header text "Defeat (Fall)")
    cw1, ch1, cpx1 = crop_pure_character(w, h, px, (624, 453, 736, 550))
    write_png(f"{out_dir}/defeat_almost_fallen.png", cw1, ch1, cpx1)

    cw2, ch2, cpx2 = crop_pure_character(w, h, px, (744, 453, 886, 550))
    write_png(f"{out_dir}/defeat_fallen.png", cw2, ch2, cpx2)

def slice_swarmer(sheet_path, out_dir):
    w, h, px = unfilter_png(sheet_path)
    print(f"Slicing pure Swarmer to {out_dir}")

    # Walk 1..4: strictly y in [38, 124] (skips header text "2. The Swarmer (Grunt)")
    walk_boxes = [(24, 38, 86, 124), (92, 38, 154, 124), (160, 38, 222, 124), (228, 38, 290, 124)]
    for i, box in enumerate(walk_boxes):
        cw, ch, cpx = crop_pure_character(w, h, px, box)
        write_png(f"{out_dir}/walk_{i+1}.png", cw, ch, cpx)

    # Attack (windup, swing, follow): strictly y in [38, 124] (skips header text "Attack / Wind-up")
    atk_boxes = [(410, 38, 476, 124), (484, 38, 560, 124), (568, 38, 636, 124)]
    names = ["windup", "swing", "follow"]
    for i, name in enumerate(names):
        cw, ch, cpx = crop_pure_character(w, h, px, atk_boxes[i])
        write_png(f"{out_dir}/{name}.png", cw, ch, cpx)

    # Hurt & Dead: strictly y in [38, 124] (skips header text "Hurt / Death")
    d_boxes = [(658, 38, 724, 124), (732, 38, 802, 124)]
    d_names = ["hurt", "dead"]
    for i, name in enumerate(d_names):
        cw, ch, cpx = crop_pure_character(w, h, px, d_boxes[i])
        write_png(f"{out_dir}/{name}.png", cw, ch, cpx)

def slice_archer_and_boss(sheet_path, archer_dir, boss_dir):
    w, h, px = unfilter_png(sheet_path)
    print(f"Slicing pure Archer to {archer_dir} and pure Boss to {boss_dir}")

    # Archer (top half: strictly y in [40, 134] - skips all top text "Walk / Move", "Attack / Wind-up", etc.)
    a_walk_boxes = [(24, 40, 98, 134), (106, 40, 166, 134), (174, 40, 233, 134)]
    for i, box in enumerate(a_walk_boxes):
        cw, ch, cpx = crop_pure_character(w, h, px, box)
        write_png(f"{archer_dir}/walk_{i+1}.png", cw, ch, cpx)

    # Shoot
    a_shoot_boxes = [(250, 40, 338, 134), (348, 40, 422, 134), (430, 40, 516, 134), (568, 40, 656, 134)]
    s_names = ["aim_1", "aim_2", "release", "recoil"]
    for i, name in enumerate(s_names):
        cw, ch, cpx = crop_pure_character(w, h, px, a_shoot_boxes[i])
        write_png(f"{archer_dir}/{name}.png", cw, ch, cpx)

    # Crisp Arrow
    arr_w, arr_h = 20, 6
    arr_px = bytearray(arr_w * arr_h * 4)
    for y in range(arr_h):
        for x in range(arr_w):
            idx = (y * arr_w + x) * 4
            if y in (2, 3) and x < 16:
                arr_px[idx:idx+4] = (160, 120, 80, 255)
            elif x >= 15:
                if abs(y - 2.5) <= (19 - x):
                    arr_px[idx:idx+4] = (220, 220, 230, 255)
            elif x <= 3 and (y in (1, 4)):
                arr_px[idx:idx+4] = (240, 240, 240, 255)
    write_png(f"{archer_dir}/arrow.png", arr_w, arr_h, arr_px)

    # Death: strictly y in [40, 134]
    a_death_boxes = [(664, 40, 746, 134), (754, 40, 836, 134), (844, 40, 895, 134)]
    ad_names = ["hurt", "stumble", "dead"]
    for i, name in enumerate(ad_names):
        cw, ch, cpx = crop_pure_character(w, h, px, a_death_boxes[i])
        write_png(f"{archer_dir}/{name}.png", cw, ch, cpx)

    # Boss (bottom half: strictly y in [172, 275] - skips all headers "4. The Juggernaut...", "Heavy Strike", etc.)
    bw, bh, bpx = crop_pure_character(w, h, px, (24, 172, 112, 275))
    write_png(f"{boss_dir}/stance.png", bw, bh, bpx)

    # Heavy Slam
    b_slam_boxes = [(122, 172, 232, 275), (240, 172, 336, 275), (460, 172, 566, 275)]
    bs_names = ["windup", "charge", "slam"]
    for i, name in enumerate(bs_names):
        cw, ch, cpx = crop_pure_character(w, h, px, b_slam_boxes[i])
        write_png(f"{boss_dir}/{name}.png", cw, ch, cpx)

    # Death
    b_death_boxes = [(574, 172, 670, 275), (678, 172, 790, 275), (798, 172, 892, 275)]
    bd_names = ["hurt", "kneel", "collapse"]
    for i, name in enumerate(bd_names):
        cw, ch, cpx = crop_pure_character(w, h, px, b_death_boxes[i])
        write_png(f"{boss_dir}/{name}.png", cw, ch, cpx)

if __name__ == '__main__':
    base_brain = "/Users/subhdeepkaur/.gemini/antigravity/brain/7d777871-c167-4b96-9b3f-a6dd533427e3/.user_uploaded"
    slice_hero(f"{base_brain}/media_1789018652050.png", "public/assets/sprites/hero_female")
    slice_hero(f"{base_brain}/media_1789018661906.png", "public/assets/sprites/hero_male")
    slice_swarmer(f"{base_brain}/media_1789018671767.png", "public/assets/sprites/swarmer")
    slice_archer_and_boss(f"{base_brain}/media_1789018679792.png", "public/assets/sprites/archer", "public/assets/sprites/boss")
    print("Pure sprite slicing complete!")
