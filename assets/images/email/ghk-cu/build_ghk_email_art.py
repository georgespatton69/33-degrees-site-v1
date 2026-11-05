#!/usr/bin/env python3
"""Rebuild the GHK-Cu campaign art with headline copy baked in.

WHY BAKED: these two blocks put white type over dark photography. Gmail's
dark mode inverts every colour declared in HTML but cannot invert a
photograph, so live white text flips to near-black and vanishes against the
still-dark image. No CSS fully prevents this in the Gmail app. Rasterising the
type into the JPEG makes it immune.

The rest of the email (spec cards, buttons, footer) keeps live HTML text and
is protected by the color-scheme declarations in campaign-editorial.html.
Only blocks where type sits ON photography get baked.

Values below mirror the CSS they replace so the baked art matches the desktop
preview: same font (Helvetica Neue), sizes, colours, and line heights.

    python3 assets/images/email/ghk-cu/build_ghk_email_art.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[4]
SRC = REPO / "assets/images/marketing/ghk-cu-carousel"
OUT = Path(__file__).resolve().parent

HELV = "/System/Library/Fonts/HelveticaNeue.ttc"
REGULAR, BOLD = 0, 1

W = 600
WHITE = (255, 255, 255)
EYEBROW = (158, 200, 232)
HERO_BODY = (219, 231, 240)
MOL_BODY = (227, 237, 248)


def font(size, index=REGULAR):
    return ImageFont.truetype(HELV, size, index=index)


def ramp(height, extent, strength, from_top):
    band = Image.new("L", (1, height), 0)
    n = max(int(height * extent), 1)
    for i in range(n):
        t = i / max(n - 1, 1)
        v = int(255 * strength * (1 - t) ** 0.6)
        band.putpixel((0, i if from_top else height - 1 - i), v)
    return band


def scrim(img, extent, strength, from_top=True):
    mask = ramp(img.height, extent, strength, from_top)
    return Image.composite(Image.new("RGB", img.size, (0, 0, 0)), img,
                           mask.resize(img.size))


def centered(draw, y, text, f, fill):
    """Draw one line centred on the canvas, anchored at the ascender top."""
    draw.text((W / 2, y), text, font=f, fill=fill, anchor="mt")


def tracked(draw, y, text, f, fill, spacing):
    """PIL has no letter-spacing, so place each glyph by hand. Used only for
    the eyebrow, whose wide tracking is a big part of the reference look."""
    widths = [f.getlength(c) for c in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = (W - total) / 2
    for ch, adv in zip(text, widths):
        draw.text((x, y), ch, font=f, fill=fill, anchor="lt")
        x += adv + spacing


def build_hero():
    img = Image.open(SRC / "bg4-lab.png").crop((0, 0, 928, 1021))
    img = img.convert("RGB").resize((W, 660), Image.LANCZOS)
    img = scrim(img, 0.62, 0.55, from_top=True)
    d = ImageDraw.Draw(img)

    y = 56
    tracked(d, y, "RESEARCH FOCUS", font(12, BOLD), EYEBROW, 3.4)
    y += 14 + 20

    f = font(46, BOLD)
    for line in ("A Closer Look", "at GHK‑Cu"):
        centered(d, y, line, f, WHITE)
        y += 50
    y += 22 - 4

    f = font(16)
    for line in ("GHK‑Cu is a copper binding tripeptide supplied",
                 "by 33 Degrees of Healing for laboratory research."):
        centered(d, y, line, f, HERO_BODY)
        y += 26
    y += 26

    centered(d, y, "Start with the compound itself.", font(16, BOLD), WHITE)

    out = OUT / "hero-v2.jpg"
    img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    return out


def build_molecule():
    img = Image.open(SRC / "bg2-molecule.png").crop((0, 230, 928, 1003))
    img = img.convert("RGB").resize((W, 500), Image.LANCZOS)
    # The chain sits up top; darken the lower half so the type has a seat.
    img = scrim(img, 0.55, 0.35, from_top=False)
    d = ImageDraw.Draw(img)

    y = 288
    f = font(32, BOLD)
    for line in ("Three amino acids.", "One copper ion."):
        centered(d, y, line, f, WHITE)
        y += 37
    y += 16

    f = font(15)
    for line in ("Glycine, histidine, lysine. The sequence binds a single",
                 "copper atom, and that complex has appeared in peer",
                 "reviewed literature since 1973."):
        centered(d, y, line, f, MOL_BODY)
        y += 26

    out = OUT / "molecule-v2.jpg"
    img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    return out


if __name__ == "__main__":
    for p in (build_hero(), build_molecule()):
        print(f"{p.relative_to(REPO)}  {p.stat().st_size / 1024:.0f}KB")
