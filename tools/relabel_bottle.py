#!/usr/bin/env python3
"""Swap the product name on an existing 33 Degrees bottle render.

Every bottle shot shares one template: amber vial, gold cap, black label with the
tree-of-life emblem, "33 DEGREES / OF HEALING", and the product name in gold caps
on the bottom line. A new SKU only needs that last line changed, so there is no
reason to regenerate the whole photograph -- we repaint one band of the label.

The band is rebuilt by interpolating the clean label rows just above and below
the text, which preserves both the vertical gradient and the left-to-right
cylinder shading. The replacement text is drawn with a per-pixel gold ramp and a
slight arc so it sits on the curve of the glass the way the original does.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

TIMES = "/System/Library/Fonts/Times.ttc"
BOLD = 1


def find_name_band(a, x0=150, x1=370):
    """Locate the product-name line: the third cluster of gold rows on the label."""
    rows = []
    for y in range(int(a.shape[0] * 0.50), int(a.shape[0] * 0.80)):
        r = a[y, x0:x1]
        hot = ((r[:, 0] > 150) & (r[:, 1] > 120) & (r[:, 2] < 170) & (r.sum(1) > 330)).sum()
        rows.append((y, hot))
    clusters, cur = [], []
    for y, hot in rows:
        if hot > 5:
            cur.append(y)
        elif cur:
            if len(cur) >= 4:
                clusters.append((cur[0], cur[-1]))
            cur = []
    if cur and len(cur) >= 4:
        clusters.append((cur[0], cur[-1]))
    # clusters: [33 DEGREES, OF HEALING, PRODUCT NAME, (glass glow)]
    if len(clusters) < 3:
        raise SystemExit(f"could not find the name line; clusters={clusters}")
    return clusters[0], clusters[2]


def find_reflection_band(a, h, lo=316, hi=None):
    """Locate the mirrored name in the reflection: the rows that sit clearly
    above the reflected label's own steady glow."""
    hi = hi or h - 1
    hot = []
    for y in range(lo, hi):
        r = a[y, 200:320]
        n = ((r[:, 0] > 95) & (r[:, 1] > 70) & (r[:, 2] < 140) & (r.sum(1) > 200)).sum()
        hot.append((y, int(n)))
    base = float(np.median([n for _, n in hot]))
    rows = [y for y, n in hot if n > base * 1.55]
    if not rows:
        raise SystemExit("could not find the reflected name band")
    # keep the run containing the strongest row
    peak = max(hot, key=lambda t: t[1])[0]
    r0 = r1 = peak
    rs = set(rows)
    while r0 - 1 in rs:
        r0 -= 1
    while r1 + 1 in rs:
        r1 += 1
    return r0, r1


def gold_text(text, font, w, h, cx, baseline_y, arc):
    """Draw `text` centred at cx with a gold vertical ramp and a slight arc."""
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    # measure, then place each glyph so we can bend the line
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths)
    x = cx - total / 2
    for ch, cw in zip(text, widths):
        # normalised -1..1 across the line; edges dip on a cylinder
        t = ((x + cw / 2) - cx) / max(total / 2, 1)
        dy = arc * (t * t)
        d.text((x, baseline_y + dy), ch, font=font, fill=255, anchor="ls")
        x += cw
    return layer


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--src", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--text", required=True)
    p.add_argument("--size", type=int, default=0, help="font px; 0 = match original cap height")
    p.add_argument("--arc", type=float, default=1.6)
    p.add_argument("--pad", type=int, default=3, help="extra rows cleared around the band")
    p.add_argument("--no-reflect", dest="reflect", action="store_false",
                   help="leave the mirrored name in the marble reflection alone")
    p.add_argument("--reflect-alpha", type=float, default=0.42)
    p.add_argument("--reflect-blur", type=float, default=0.6)
    p.add_argument("--reflect-pad", type=int, default=2)
    p.add_argument("--fit", type=float, default=0.95,
                   help="max name width as a fraction of the '33 DEGREES' line")
    args = p.parse_args()

    im = Image.open(args.src).convert("RGB")
    a = np.array(im).astype(int)
    h, w, _ = a.shape
    (b0, b1), (y0, y1) = find_name_band(a)
    cap_h = y1 - y0 + 1

    # --- rebuild the label background across the text band -------------------
    top, bot = y0 - args.pad, y1 + args.pad
    src = np.array(im).astype(float)
    row_above = src[top - 1].copy()
    row_below = src[bot + 1].copy()
    for i, y in enumerate(range(top, bot + 1)):
        t = (i + 1) / (bot - top + 2)
        src[y] = row_above * (1 - t) + row_below * t
    clean = Image.fromarray(src.astype(np.uint8))

    # --- draw the new name ---------------------------------------------------
    # Times' cap height is ~0.66 em, so solve for the em that reproduces cap_h.
    size = args.size or max(int(round(cap_h / 0.662)), 8)
    font = ImageFont.truetype(TIMES, size, index=BOLD)

    # Two different lines answer two different questions.
    #
    # Centre: the outgoing name line. Every SKU's name is centred on the label by
    # design, and measuring it gives x~259 on all three source renders. The
    # "33 DEGREES" line is NOT a usable centre -- its oversized "33" drags its
    # measured centre to x~270, which visibly shoves the new text right.
    #
    # Width: the "33 DEGREES" line, because it is the widest element the designer
    # fitted on the label, so it defines the usable text column. The outgoing name
    # is useless here -- "GHK-CU" is half the length of "AHK-CU 100MG", so sizing
    # to it would run the replacement off the label onto the lit edge of the glass.
    def extent(r0, r1, lo=170, hi=350):
        band = a[r0:r1 + 1, lo:hi]
        hot = ((band[:, :, 0] > 140) & (band[:, :, 1] > 110)
               & (band[:, :, 2] < 180) & (band.sum(2) > 300))
        c = np.where(hot.any(0))[0]
        if not len(c):
            raise SystemExit(f"no text found in rows {r0}..{r1}")
        return float(c.min() + lo), float(c.max() + lo)

    nl, nr = extent(y0, y1)
    cx = (nl + nr) / 2
    bl, br = extent(b0, b1)
    max_w = (br - bl) * args.fit

    probe = ImageDraw.Draw(Image.new("L", (1, 1)))
    while size > 6 and probe.textlength(args.text, font=font) > max_w:
        size -= 1
        font = ImageFont.truetype(TIMES, size, index=BOLD)
    text_w = probe.textlength(args.text, font=font)

    mask = gold_text(args.text, font, w, h, cx, y1 + 1, args.arc)

    # gold ramp: brighter through the middle of the glyph, warmer at the feet
    grad = Image.new("RGB", (w, h))
    g = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        t = np.clip((y - y0) / max(cap_h, 1), 0, 1)
        g[y] = (
            int(201 + 30 * (1 - t)),
            int(166 + 33 * (1 - t)),
            int(86 + 24 * (1 - t)),
        )
    grad = Image.fromarray(g)

    out = clean.copy()
    out.paste(grad, (0, 0), mask)

    # --- the mirrored name in the marble reflection --------------------------
    # The vial stands on polished stone, so the label is mirrored below it and
    # the old product name stays legible there -- faint, but it brightens right
    # up and it is the giveaway that matters most for RA Water, which sits
    # beside Bacteriostatic Water on the ARA-290 page. Repaint it the same way:
    # rebuild the band, then drop in the new text flipped, blurred and dimmed.
    if args.reflect:
        r0, r1 = find_reflection_band(a, h)
        # Clear wider than we repaint. The detector finds only the rows that
        # clear the reflected label's glow, which can be a couple of rows
        # narrower than the old text actually runs -- leave those and the tops
        # and tails of the previous name ghost through behind the new one.
        c0, c1 = r0 - args.reflect_pad, r1 + args.reflect_pad
        src2 = np.array(out).astype(float)
        ra, rb = src2[c0 - 1].copy(), src2[c1 + 1].copy()
        for i, y in enumerate(range(c0, c1 + 1)):
            t = (i + 1) / (c1 - c0 + 2)
            src2[y] = ra * (1 - t) + rb * t
        out = Image.fromarray(src2.astype(np.uint8))

        strip = mask.crop((0, y0 - 1, w, y1 + 2)).transpose(Image.FLIP_TOP_BOTTOM)
        band_h = r1 - r0 + 1
        if strip.height != band_h:
            strip = strip.resize((w, band_h), Image.LANCZOS)
        strip = strip.filter(ImageFilter.GaussianBlur(args.reflect_blur))
        strip = strip.point(lambda v: int(v * args.reflect_alpha))

        full = Image.new("L", (w, h), 0)
        full.paste(strip, (0, r0))
        dim = Image.fromarray((np.array(grad).astype(float) * 0.78).astype(np.uint8))
        out.paste(dim, (0, 0), full)

    out.save(args.out)
    print(f"{args.src} -> {args.out}: band y[{y0}:{y1}] cap={cap_h}px font={size}px "
          f"cx={cx:.0f} width={text_w:.0f}/{max_w:.0f} '{args.text}'"
          + (f" reflection y[{r0}:{r1}]" if args.reflect else " (reflection untouched)"))


if __name__ == "__main__":
    main()
