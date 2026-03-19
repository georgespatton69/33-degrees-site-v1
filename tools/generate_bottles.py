"""Generate amber glass vial product images with 33 Degrees labels."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

LOGO_PATH = os.path.expanduser("~/Desktop/33 degrees/SVG Company Logo.png")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets/images/products")

PRODUCTS = [
    ("retatrutide", "Retatrutide", "10MG | 30MG | 60MG"),
    ("bpc-157", "BPC-157", "Research Peptide"),
    ("tb-500", "TB-500", "Research Peptide"),
    ("wolverine-stack", "Wolverine Stack", "BPC-157 & TB-500 | 10MG"),
    ("mots-c", "MOTS-c", "10MG | 40MG"),
    ("nad-plus", "NAD+", "1000MG"),
    ("epithalon", "Epithalon", "10MG"),
    ("glow-blend", "Glow Blend", "BPC-157+TB-500+GHK-CU"),
    ("ipamorelin", "Ipamorelin", "10MG"),
    ("ghk-cu", "GHK-CU", "Copper Peptide"),
    ("tesamorelin", "Tesamorelin", "10MG"),
    ("ss-31", "SS-31", "10MG"),
    ("aod-9604", "AOD 9604", "10MG"),
]

W, H = 400, 560

def draw_rounded_bottle(draw, img, cx, top, bottom, width, radius):
    """Draw an amber glass bottle with rounded bottom and 3D shading."""
    left = cx - width // 2
    right = cx + width // 2

    # Main body - dark amber base
    draw.rounded_rectangle(
        [left, top, right, bottom],
        radius=radius, fill=(80, 50, 8)
    )

    # Glass gradient layers for 3D cylindrical look
    layers = [
        (3, (90, 58, 10)),
        (8, (100, 65, 12)),
        (15, (115, 75, 15)),
        (22, (125, 82, 18)),
        (30, (130, 85, 18)),
    ]
    for inset, color in layers:
        if inset * 2 >= width:
            break
        draw.rounded_rectangle(
            [left + inset, top + inset // 2, right - inset, bottom - inset // 2],
            radius=max(radius - inset // 2, 4), fill=color
        )

    # Left dark edge (shadow side)
    for i in range(12):
        alpha = 40 - i * 3
        if alpha <= 0:
            break
        draw.line(
            [(left + i, top + radius), (left + i, bottom - radius)],
            fill=(40, 25, 5, alpha), width=1
        )

    # Right highlight edge (light side)
    for i in range(8):
        alpha = 30 - i * 3
        if alpha <= 0:
            break
        draw.line(
            [(right - 4 - i, top + radius), (right - 4 - i, bottom - radius)],
            fill=(180, 130, 40, alpha), width=1
        )

    # Central glass highlight strip
    highlight_x = cx - width // 6
    for i in range(10):
        alpha = 25 - i * 2
        if alpha <= 0:
            break
        draw.line(
            [(highlight_x + i, top + 20), (highlight_x + i, bottom - 20)],
            fill=(200, 160, 60, alpha), width=1
        )


def create_bottle(product_id, name, subtitle):
    """Create a single amber vial product image."""
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = W // 2
    bottle_w = 170
    bottle_top = 150
    bottle_bottom = 490
    bottle_radius = 24

    # --- Shadow ---
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        [cx - bottle_w // 2 + 10, bottle_top + 12,
         cx + bottle_w // 2 + 10, bottle_bottom + 12],
        radius=bottle_radius, fill=(0, 0, 0, 60)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    img = Image.alpha_composite(img, shadow)
    draw = ImageDraw.Draw(img)

    # --- Cap (dark brown/black flip-off cap) ---
    cap_w = 56
    cap_h = 28
    cap_top = 95
    draw.rounded_rectangle(
        [cx - cap_w // 2, cap_top, cx + cap_w // 2, cap_top + cap_h],
        radius=4, fill=(35, 28, 18)
    )
    # Cap top highlight
    draw.rounded_rectangle(
        [cx - cap_w // 2 + 4, cap_top + 2, cx + cap_w // 2 - 4, cap_top + 7],
        radius=2, fill=(55, 42, 25)
    )
    # Metal crimp ring
    crimp_w = 62
    crimp_h = 12
    crimp_top = cap_top + cap_h - 2
    draw.rounded_rectangle(
        [cx - crimp_w // 2, crimp_top, cx + crimp_w // 2, crimp_top + crimp_h],
        radius=3, fill=(160, 140, 100)
    )
    draw.rounded_rectangle(
        [cx - crimp_w // 2 + 2, crimp_top + 2, cx + crimp_w // 2 - 2, crimp_top + 5],
        radius=2, fill=(190, 170, 120)
    )

    # --- Neck ---
    neck_w = 44
    neck_top = crimp_top + crimp_h - 2
    neck_bottom = bottle_top + 12
    draw.rectangle(
        [cx - neck_w // 2, neck_top, cx + neck_w // 2, neck_bottom],
        fill=(95, 62, 10)
    )
    # Neck highlight
    draw.rectangle(
        [cx - neck_w // 6, neck_top, cx - neck_w // 6 + 6, neck_bottom],
        fill=(120, 80, 18, 60)
    )

    # Shoulder taper
    for y in range(neck_bottom, neck_bottom + 20):
        progress = (y - neck_bottom) / 20
        w = int(neck_w // 2 + (bottle_w // 2 - neck_w // 2) * progress)
        draw.line([(cx - w, y), (cx + w, y)], fill=(100, 65, 12), width=1)

    # --- Bottle body ---
    draw_rounded_bottle(draw, img, cx, bottle_top + 18, bottle_bottom, bottle_w, bottle_radius)

    # --- Label ---
    label_margin = 20
    label_x = cx - bottle_w // 2 + label_margin
    label_w = bottle_w - label_margin * 2
    label_top = 210
    label_bottom = 455
    label_r = 8

    # Label background
    draw.rounded_rectangle(
        [label_x, label_top, label_x + label_w, label_bottom],
        radius=label_r, fill=(12, 10, 6)
    )
    # Label gold border
    draw.rounded_rectangle(
        [label_x, label_top, label_x + label_w, label_bottom],
        radius=label_r, outline=(212, 168, 67, 180), width=1
    )

    # Inner border line
    inner_margin = 4
    draw.rounded_rectangle(
        [label_x + inner_margin, label_top + inner_margin,
         label_x + label_w - inner_margin, label_bottom - inner_margin],
        radius=label_r - 2, outline=(212, 168, 67, 60), width=1
    )

    # --- Logo on label ---
    try:
        logo = Image.open(LOGO_PATH).convert('RGBA')
        logo_target_w = label_w - 30
        max_logo_h = 100
        logo_ratio = min(logo_target_w / logo.width, max_logo_h / logo.height)
        logo_w = int(logo.width * logo_ratio)
        logo_h = int(logo.height * logo_ratio)
        logo = logo.resize((logo_w, logo_h), Image.LANCZOS)

        logo_x = label_x + (label_w - logo_w) // 2
        logo_y = label_top + 12
        img.paste(logo, (logo_x, logo_y), logo)
        draw = ImageDraw.Draw(img)
    except Exception as e:
        print(f"  Warning: Could not load logo: {e}")

    # --- Text ---
    font_paths = [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Times.ttc",
    ]
    sub_font_paths = [
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Times.ttc",
    ]

    name_font = None
    sub_font = None
    for fp in font_paths:
        try:
            name_font = ImageFont.truetype(fp, 20)
            break
        except:
            continue
    for fp in sub_font_paths:
        try:
            sub_font = ImageFont.truetype(fp, 11)
            break
        except:
            continue

    if not name_font:
        name_font = ImageFont.load_default()
    if not sub_font:
        sub_font = ImageFont.load_default()

    # Gold separator line
    sep_y = label_top + 125
    line_margin = 20
    draw.line(
        [label_x + line_margin, sep_y, label_x + label_w - line_margin, sep_y],
        fill=(212, 168, 67, 150), width=1
    )

    # Product name - auto-size to fit
    for size in [22, 18, 15, 13, 11]:
        try:
            test_font = ImageFont.truetype(font_paths[0], size)
        except:
            test_font = name_font
        bbox = draw.textbbox((0, 0), name, font=test_font)
        tw = bbox[2] - bbox[0]
        if tw <= label_w - 16:
            name_font = test_font
            break

    name_bbox = draw.textbbox((0, 0), name, font=name_font)
    name_w_px = name_bbox[2] - name_bbox[0]
    name_x = label_x + (label_w - name_w_px) // 2
    name_y = sep_y + 12
    draw.text((name_x, name_y), name, fill=(212, 168, 67), font=name_font)

    # Subtitle
    for size in [11, 10, 9, 8]:
        try:
            test_font = ImageFont.truetype(sub_font_paths[0], size)
        except:
            test_font = sub_font
        bbox = draw.textbbox((0, 0), subtitle, font=test_font)
        tw = bbox[2] - bbox[0]
        if tw <= label_w - 12:
            sub_font = test_font
            break

    sub_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sub_w_px = sub_bbox[2] - sub_bbox[0]
    sub_x = label_x + (label_w - sub_w_px) // 2
    sub_y = name_y + 28
    draw.text((sub_x, sub_y), subtitle, fill=(170, 140, 90), font=sub_font)

    # --- Ambient glow underneath ---
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(40, 0, -1):
        gd.ellipse(
            [cx - r * 3, bottle_bottom - 10 - r // 2,
             cx + r * 3, bottle_bottom - 10 + r // 2],
            fill=(212, 168, 67, 2)
        )
    img = Image.alpha_composite(img, glow)

    # Save
    output_path = os.path.join(OUTPUT_DIR, f"{product_id}.png")
    img.save(output_path, "PNG", optimize=True)
    print(f"  Created: {product_id}.png")


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating amber vial product images...")
    for pid, name, sub in PRODUCTS:
        create_bottle(pid, name, sub)
    print(f"\nDone! {len(PRODUCTS)} bottles created.")
