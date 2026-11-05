#!/usr/bin/env python3
"""Side-by-side two-compound reel (biohackernetwork style).

Takes two 9:16 clips, crops each to a half-width panel, stacks them, and burns
on a per-panel NAME + ROLE header plus a shared bottom CTA/handle.

Usage:
    python3 tools/build_split_reel.py \
        --left  assets/images/marketing/split-reel/clip-a.mp4 \
        --right assets/images/marketing/split-reel/clip-b.mp4 \
        --output assets/images/marketing/split-reel/split.mp4 \
        --left-name "MOTS-c"  --left-role  "Energy Regulation" \
        --right-name "SS-31"  --right-role "Membrane Stabilization"
"""
import argparse, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
HALF = W // 2

REPO = Path(__file__).resolve().parent.parent
FONTS = REPO / "assets/fonts"
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
POPPINS = str(FONTS / "Poppins-SemiBold.ttf")

# Reference palette: desaturated steel blue headline, cooler gray role line.
HEAD = (104, 146, 186)
ROLE = (150, 170, 190)
CTA = (176, 190, 202)
HANDLE = (130, 145, 158)
FAINT = (105, 118, 130)

# Vertical anchors as a fraction of frame height, measured off the reference.
Y_HEAD = 0.125
Y_ROLE = 0.205
Y_CTA = 0.885
Y_HANDLE = 0.925
Y_DISC = 0.955


def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def font(path, size):
    return ImageFont.truetype(path, size)


def tw(f, s):
    return f.getbbox(s)[2] - f.getbbox(s)[0]


def fit_font(path, text, max_w, start):
    size = start
    while size > 18 and tw(font(path, size), text) > max_w:
        size -= 2
    return font(path, size)


def glow_text(base, xy, s, f, fill, glow, radius=14, alpha=150, shadow=True):
    """Soft colored glow + optional drop shadow, then the text itself."""
    x, y = xy
    if alpha:
        g = Image.new("RGBA", base.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).text((x, y), s, font=f, fill=glow + (alpha,))
        base.alpha_composite(g.filter(ImageFilter.GaussianBlur(radius)))
    if shadow:
        sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((x + 2, y + 3), s, font=f, fill=(0, 0, 0, 150))
        base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(3)))
    ImageDraw.Draw(base).text((x, y), s, font=f, fill=fill)


def panel_text(layer, cx, name, role):
    """Headline + role line centered on a panel's horizontal center."""
    hf = fit_font(IMPACT, name, HALF - 70, start=132)
    glow_text(layer, (cx - tw(hf, name) / 2, H * Y_HEAD), name, hf,
              HEAD + (235,), HEAD, radius=18, alpha=120)
    rf = fit_font(POPPINS, role, HALF - 50, start=40)
    glow_text(layer, (cx - tw(rf, role) / 2, H * Y_ROLE), role, rf,
              ROLE + (225,), (0, 0, 0), radius=10, alpha=0)


def scrim(layer, y0, y1, peak, top=True):
    """Vertical black gradient so text survives bright background art."""
    band = Image.new("L", (1, abs(y1 - y0)))
    n = band.height
    for i in range(n):
        t = i / max(n - 1, 1)
        # Gamma < 1 holds alpha further into the fade, so text near the middle
        # of the gradient still has something to sit on.
        band.putpixel((0, i), int(peak * ((1 - t) if top else t) ** 0.6))
    mask = band.resize((W, n))
    blk = Image.new("RGBA", (W, n), (0, 0, 0, 255))
    blk.putalpha(mask)
    layer.alpha_composite(blk, (0, min(y0, y1)))


def build_overlay(a, out):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # Text sits over AI art with unpredictable luminance; scrim both ends.
    scrim(layer, 0, int(H * 0.38), a.scrim, top=True)
    scrim(layer, int(H * 0.74), H, a.scrim, top=False)

    # Faint seam divider, matching the reference's thin light rule.
    d = ImageDraw.Draw(layer)
    d.line([(HALF, 0), (HALF, H)], fill=(190, 210, 230, 46), width=2)

    panel_text(layer, HALF / 2, a.left_name, a.left_role)
    panel_text(layer, HALF + HALF / 2, a.right_name, a.right_role)

    # Shared bottom block, centered across the full frame (crosses the seam).
    # Poppins has no arrow glyph, so the trailing arrow is drawn in Arial.
    cf, af = font(POPPINS, 42), font(ARIAL, 42)
    label, arrow = a.cta, ""
    if label and label[-1] in "↓↘⬇":
        label, arrow = label[:-1].rstrip(), label[-1]
    total = tw(cf, label) + (tw(af, arrow) + 14 if arrow else 0)
    cx = (W - total) / 2
    glow_text(layer, (cx, H * Y_CTA), label, cf, CTA + (225,), (0, 0, 0),
              radius=10, alpha=0)
    if arrow:
        glow_text(layer, (cx + tw(cf, label) + 14, H * Y_CTA), arrow, af,
                  CTA + (225,), (0, 0, 0), radius=10, alpha=0)

    hf = font(ARIAL, 24)
    d = ImageDraw.Draw(layer)
    d.text(((W - tw(hf, a.handle)) / 2, H * Y_HANDLE), a.handle,
           font=hf, fill=HANDLE + (210,))

    if a.disclaimer:
        df = font(ARIAL, 19)
        d.text(((W - tw(df, a.disclaimer)) / 2, H * Y_DISC), a.disclaimer,
               font=df, fill=FAINT + (170,))

    layer.save(out)
    return out


def main():
    ap = argparse.ArgumentParser(description="Two-compound side-by-side reel.")
    ap.add_argument("--left", required=True, type=Path, help="Left 9:16 clip.")
    ap.add_argument("--right", required=True, type=Path, help="Right 9:16 clip.")
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--left-name", required=True)
    ap.add_argument("--left-role", required=True)
    ap.add_argument("--right-name", required=True)
    ap.add_argument("--right-role", required=True)
    ap.add_argument("--cta", default="See Both Roles ↓")
    ap.add_argument("--handle", default="@33degreeshealing")
    ap.add_argument("--disclaimer", default="For research use only. Not for human consumption.",
                    help="Pass '' to omit.")
    ap.add_argument("--scrim", type=int, default=195,
                    help="Peak alpha of the top/bottom darkening gradients (0 to disable).")
    ap.add_argument("--left-crop-x", type=int, default=HALF // 2,
                    help="Left edge of the 540px crop taken from the left clip.")
    ap.add_argument("--right-crop-x", type=int, default=HALF // 2)
    ap.add_argument("--keep-overlay", action="store_true")
    a = ap.parse_args()

    for p in (a.left, a.right):
        if not p.exists():
            sys.exit(f"ERROR: clip not found: {p}")

    a.output.parent.mkdir(parents=True, exist_ok=True)
    ov = a.output.with_suffix(".overlay.png")
    build_overlay(a, ov)

    fc = (
        f"[0:v]crop={HALF}:{H}:{a.left_crop_x}:0[l];"
        f"[1:v]crop={HALF}:{H}:{a.right_crop_x}:0[r];"
        f"[l][r]hstack=inputs=2[bg];"
        f"[bg][2:v]overlay=0:0,format=yuv420p[v]"
    )
    cmd = [ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
           "-i", str(a.left), "-i", str(a.right), "-i", str(ov),
           "-filter_complex", fc, "-map", "[v]", "-an",
           "-c:v", "libx264", "-crf", "17", "-preset", "medium",
           str(a.output), "-y"]
    subprocess.run(cmd, check=True)

    if not a.keep_overlay:
        ov.unlink(missing_ok=True)
    print(f"Created: {a.output}")


if __name__ == "__main__":
    main()
