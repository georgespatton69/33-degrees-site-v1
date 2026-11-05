#!/usr/bin/env python3
"""Crop/resize source art into email-weight JPEGs.

Email clients punish heavy payloads and Gmail clips messages over ~102KB of
HTML, so campaign art gets flattened to sRGB JPEG at the exact pixel size the
template renders it, rather than shipping the 1MB PNGs we generate for print
and reels.

Usage:
    python3 tools/prep_email_images.py \
        --src assets/images/marketing/ghk-cu-carousel/bg4-lab.png \
        --out assets/images/email/ghk-cu/hero.jpg \
        --crop 0,0,928,1021 --size 600x660
"""
import argparse
import sys
from pathlib import Path

from PIL import Image


def parse_crop(s):
    parts = [int(v) for v in s.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("--crop needs left,top,right,bottom")
    return tuple(parts)


def parse_size(s):
    w, _, h = s.lower().partition("x")
    return int(w), int(h)


def parse_edge(s):
    """'top:0.55:0.45' -> ('top', 0.55, 0.45) — edge, extent, strength."""
    parts = s.split(":")
    if len(parts) != 3 or parts[0] not in ("top", "bottom"):
        raise argparse.ArgumentTypeError(
            "expected top|bottom:extent:strength, e.g. top:0.55:0.45")
    return parts[0], float(parts[1]), float(parts[2])


def ramp(height, extent, strength, from_top):
    """A 1px-wide alpha ramp: opaque at the edge, clear by `extent` in."""
    band = Image.new("L", (1, height), 0)
    n = max(int(height * extent), 1)
    for i in range(n):
        t = i / max(n - 1, 1)
        # Gamma < 1 holds alpha further into the fade, so type near the middle
        # of the gradient still has something to sit on.
        v = int(255 * strength * (1 - t) ** 0.6)
        band.putpixel((0, i if from_top else height - 1 - i), v)
    return band


def apply_scrim(img, edge, extent, strength):
    """Darken one edge so white type stays legible over busy photography."""
    mask = ramp(img.height, extent, strength, edge == "top")
    black = Image.new("RGB", img.size, (0, 0, 0))
    return Image.composite(black, img, mask.resize(img.size))


def apply_feather(img, edge, extent, strength, color):
    """Fade one edge into a flat colour so the photo blends into the panel."""
    mask = ramp(img.height, extent, strength, edge == "top")
    flat = Image.new("RGB", img.size, color)
    return Image.composite(flat, img, mask.resize(img.size))


def parse_color(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def main():
    ap = argparse.ArgumentParser(description="Prep art for HTML email.")
    ap.add_argument("--src", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--crop", type=parse_crop,
                    help="left,top,right,bottom in source pixels (optional).")
    ap.add_argument("--size", required=True, type=parse_size,
                    help="Final WxH, e.g. 600x660.")
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--scrim", type=parse_edge, action="append", default=[],
                    metavar="EDGE:EXTENT:STRENGTH",
                    help="Darken an edge, e.g. top:0.55:0.45. Repeatable.")
    ap.add_argument("--feather", type=parse_edge, action="append", default=[],
                    metavar="EDGE:EXTENT:STRENGTH",
                    help="Fade an edge into --feather-color. Repeatable.")
    ap.add_argument("--feather-color", type=parse_color, default=(255, 255, 255),
                    help="Hex colour the feather fades into, e.g. #eaf3ef.")
    a = ap.parse_args()

    if not a.src.exists():
        sys.exit(f"ERROR: source not found: {a.src}")

    img = Image.open(a.src)
    if a.crop:
        img = img.crop(a.crop)

    # Flatten alpha onto white; JPEG has no alpha channel and Pillow would
    # otherwise refuse the RGBA save outright.
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        flat = Image.new("RGB", img.size, (255, 255, 255))
        flat.paste(img, mask=img.split()[-1])
        img = flat
    else:
        img = img.convert("RGB")

    img = img.resize(a.size, Image.LANCZOS)

    # After the resize, so extents are a fraction of the final frame.
    for edge, extent, strength in a.scrim:
        img = apply_scrim(img, edge, extent, strength)
    for edge, extent, strength in a.feather:
        img = apply_feather(img, edge, extent, strength, a.feather_color)

    a.out.parent.mkdir(parents=True, exist_ok=True)
    img.save(a.out, "JPEG", quality=a.quality, optimize=True, progressive=True)

    kb = a.out.stat().st_size / 1024
    print(f"{a.out}  {a.size[0]}x{a.size[1]}  {kb:.0f}KB")


if __name__ == "__main__":
    main()
