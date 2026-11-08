#!/usr/bin/env python3
"""
Post 1 V4 FINAL - Renewal Notice
- Pure flat navy background (no lines/stripes)
- DHL: remove WHITE bg (white box → transparent, keep blue logo content)
- Pineapple: remove NAVY bg (keep brand's orange rounded box)
- Logos 130px height
- All 3 bullets visible above CTA bar
- Inter Display Black for bold headlines
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

W, H = 1080, 1350
BG    = (8, 18, 45)
GOLD  = (255, 185, 0)
WHITE = (255, 255, 255)
RED   = (210, 35, 35)
DARK  = (5, 12, 32)
MUTED = (160, 170, 195)
FONT_DIR = "/usr/share/fonts/opentype/inter/"

def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)

def centered_text(draw, y, text, f, color=WHITE):
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y), text, font=f, fill=color)
    return bbox[3] - bbox[1]

def draw_pill(draw, cx, cy, text, f, fill, text_color=WHITE, px=36, py=18):
    bbox = draw.textbbox((0,0), text, font=f)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    pw, ph = tw + px*2, th + py*2
    x0, y0 = cx - pw//2, cy - ph//2
    r = ph // 2
    draw.rectangle([x0+r, y0, x0+pw-r, y0+ph], fill=fill)
    draw.rectangle([x0, y0+r, x0+pw, y0+ph-r], fill=fill)
    for ex, ey in [(x0, y0), (x0+pw-2*r, y0), (x0, y0+ph-2*r), (x0+pw-2*r, y0+ph-2*r)]:
        draw.ellipse([ex, ey, ex+2*r, ey+2*r], fill=fill)
    draw.text((x0 + px, y0 + py), text, font=f, fill=text_color)

def remove_color_bg(img_path, bg_color, tolerance=45, fade_range=30):
    """Remove a specific background color, returning RGBA with transparent bg."""
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    bg = np.array(bg_color, dtype=np.float32)
    dist = np.sqrt((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)
    alpha = arr[:,:,3].copy()
    alpha[dist < tolerance] = 0
    partial = (dist >= tolerance) & (dist < tolerance + fade_range)
    alpha[partial] = ((dist[partial] - tolerance) / fade_range * 255).clip(0, 255)
    arr[:,:,3] = alpha
    return Image.fromarray(arr.astype(np.uint8))

# ═══════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════
img = Image.new("RGB", (W, H), BG)

# 1. BACKGROUND — flat navy with subtle vignette (no stripes/lines)
arr = np.array(img).astype(np.float32)
Y_g, X_g = np.mgrid[0:H, 0:W]
d = np.sqrt(((X_g-W/2)/(W/2))**2 + ((Y_g-H/2)/(H*0.65))**2)
vig = np.clip(1.0 - d*0.14, 0.86, 1.0)
for c in range(3):
    arr[:,:,c] *= vig
img = Image.fromarray(arr.astype(np.uint8))
draw = ImageDraw.Draw(img, "RGBA")

# 2. TOP BAR (y=0–178)
draw.rectangle([0, 0, W, 178], fill=(11, 22, 54))
draw.rectangle([0, 173, W, 178], fill=GOLD)

LOGO_H = 130
logo_y = (173 - LOGO_H) // 2  # = 21

# DHL logo: the original file has white card design — place it on a white rounded pill
# so it integrates cleanly
dhl_src = Image.open("social/profile/dhl-logo.png").convert("RGB")
# Create white pill background sized for the logo
PILL_H = LOGO_H
dhl_scaled_w = int(dhl_src.width * PILL_H / dhl_src.height)
dhl_scaled = dhl_src.resize((dhl_scaled_w, PILL_H), Image.LANCZOS)

# Create white rounded pill container
pill_w = dhl_scaled_w + 20
pill_img = Image.new("RGBA", (pill_w, PILL_H), (0,0,0,0))
pd = ImageDraw.Draw(pill_img)
r_p = 16
pd.rectangle([r_p, 0, pill_w-r_p, PILL_H], fill=(255,255,255,255))
pd.rectangle([0, r_p, pill_w, PILL_H-r_p], fill=(255,255,255,255))
pd.ellipse([0,0,r_p*2,r_p*2], fill=(255,255,255,255))
pd.ellipse([pill_w-r_p*2,0,pill_w,r_p*2], fill=(255,255,255,255))
pd.ellipse([0,PILL_H-r_p*2,r_p*2,PILL_H], fill=(255,255,255,255))
pd.ellipse([pill_w-r_p*2,PILL_H-r_p*2,pill_w,PILL_H], fill=(255,255,255,255))
# Paste logo onto white pill
pill_img.paste(dhl_scaled, (10, 0))
img.paste(pill_img, (55, logo_y), pill_img)

# Pineapple: crop to exact orange content area (rows 28-99, cols 76-266)
# Then paste onto a matching nav bg pill
pine_src = Image.open("social/profile/pineapple-logo.png").convert("RGB")
pine_content = pine_src.crop((76, 28, 267, 100))  # exact orange content bounds
pine_w_scaled = int(pine_content.width * LOGO_H / pine_content.height)
pine_r = pine_content.resize((pine_w_scaled, LOGO_H), Image.LANCZOS)
img.paste(pine_r, (W - pine_w_scaled - 55, logo_y))

draw = ImageDraw.Draw(img, "RGBA")

# 3. URGENCY PILL
draw_pill(draw, W//2, 228, "⚠  RENEWAL NOTICE", font("InterDisplay-Bold.otf", 32), RED)

# 4. GIANT HEADLINE
f_h1 = font("InterDisplay-Black.otf", 148)
f_h2 = font("InterDisplay-Black.otf", 116)
centered_text(draw, 272, "YOUR BANK", f_h1, WHITE)
centered_text(draw, 428, "WANTS YOU", f_h1, GOLD)
centered_text(draw, 583, "TO SIGN.", f_h2, WHITE)

# 5. GOLD RULE
draw.rectangle([75, 715, W-75, 722], fill=GOLD)

# 6. HOOK LINE
centered_text(draw, 736, "DON'T. Here's why:", font("InterDisplay-Bold.otf", 60), WHITE)

# 7. BULLETS — 3 items, all must fit y=810 to y=1040 (230px each = 90 spacing)
f_bt   = font("InterDisplay-Bold.otf", 34)
f_bsub = font("Inter-Regular.otf", 26)
f_num  = font("InterDisplay-Black.otf", 38)

bullets = [
    ("1", "Banks profit from early renewals.",  "They lock you in before better rates hit."),
    ("2", "You have 120 days to shop.",          "Compare 20+ lenders. Keep your options open."),
    ("3", "One call could save you $6,000+.",    "On a $500K mortgage over 5 years."),
]

by = 806
for num, title, sub in bullets:
    cr = 24
    cxc = 80 + cr
    cyc = by + cr + 2
    draw.ellipse([cxc-cr, cyc-cr, cxc+cr, cyc+cr], fill=GOLD)
    nb = draw.textbbox((0,0), num, font=f_num)
    nw, nh = nb[2]-nb[0], nb[3]-nb[1]
    draw.text((cxc - nw//2, cyc - nh//2 - 1), num, font=f_num, fill=DARK)
    tx = 80 + cr*2 + 18
    draw.text((tx, by), title, font=f_bt, fill=WHITE)
    draw.text((tx, by + 40), sub, font=f_bsub, fill=MUTED)
    by += 96   # compact: title(34px) + gap(6) + sub(26px) + gap = 96

# 8. GOLD CTA BAR (starts at y=1098 — after 3 bullets + padding)
draw.rectangle([0, 1098, W, 1178], fill=GOLD)
centered_text(draw, 1118, "DM me before you sign anything.", font("InterDisplay-Black.otf", 44), DARK)

# 9. FOOTER
draw.rectangle([0, 1178, W, H], fill=(4, 10, 28))

try:
    hs = Image.open("social/profile/vik-headshot.jpg").convert("RGB")
    hs_sz = 148
    hs = hs.resize((hs_sz, hs_sz), Image.LANCZOS)
    mask = Image.new("L", (hs_sz, hs_sz), 0)
    ImageDraw.Draw(mask).ellipse([0,0,hs_sz,hs_sz], fill=255)
    hx, hy = 52, 1188
    draw.ellipse([hx-4, hy-4, hx+hs_sz+4, hy+hs_sz+4], fill=GOLD)
    img.paste(hs, (hx, hy), mask)
except Exception as e:
    print(f"Headshot: {e}")

nx = 52 + 148 + 22
draw.text((nx, 1196), "Vikas (Vik) Sharma", font=font("InterDisplay-Bold.otf", 36), fill=WHITE)
draw.text((nx, 1240), "Mortgage Broker", font=font("Inter-Regular.otf", 25), fill=GOLD)
draw.text((nx, 1272), "Pineapple Financial | FSRA #M09001351", font=font("Inter-Regular.otf", 23), fill=MUTED)
draw.text((52, 1318), "Life & Health Insurance Agent (LLQP), ON | FSRA #25243352",
          font=font("Inter-Regular.otf", 16), fill=(95,105,130))

out = "social/2026-11/post1-renewal-v4.png"
os.makedirs("social/2026-11", exist_ok=True)
img.save(out, "PNG", optimize=True)
print(f"✓ {out} ({os.path.getsize(out)//1024}KB) {img.size}")
