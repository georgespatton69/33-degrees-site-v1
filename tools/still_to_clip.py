#!/usr/bin/env python3
"""Turn a still image into a smooth, slow-moving 9:16 clip (Ken Burns push/pan).

Why this exists: ffmpeg's `zoompan` rounds its crop window to whole pixels every
frame. For the slow pushes this brand uses (~6% over 10s) the per-frame change is
a fraction of a pixel, so the image sits still for several frames and then jumps,
which reads as judder. Rendering at 2x and downscaling makes it worse, not better.

This renders each frame with PIL's `resize(..., box=<float coords>)`, which
resamples at true sub-pixel precision, so motion is perfectly even. Frames are
piped straight to ffmpeg as rawvideo (no temp files).

Usage:
    python3 tools/still_to_clip.py \
        --image assets/images/marketing/ss31-video/scene6-reignite.png \
        --output .tmp/clip.mp4 --seconds 10 --zoom 1.06

Pan: --pan-x / --pan-y are fractions of the leftover margin, -1..1, applied
linearly across the clip (0 = stay centered).
"""
import argparse, subprocess, sys
from pathlib import Path
from PIL import Image

W, H = 1080, 1920


def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def base_box(iw, ih):
    """Largest centered crop of the source matching the 9:16 target aspect."""
    target = W / H
    if iw / ih > target:          # source too wide -> limit by height
        bw, bh = ih * target, float(ih)
    else:                          # source too tall -> limit by width
        bw, bh = float(iw), iw / target
    return bw, bh


def main():
    ap = argparse.ArgumentParser(description="Still -> smooth 9:16 Ken Burns clip.")
    ap.add_argument("--image", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--seconds", type=float, default=10.0)
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--zoom", type=float, default=1.06,
                    help="End zoom. 1.06 = 6%% push. Use <1 to pull back.")
    ap.add_argument("--pan-x", type=float, default=0.0, help="-1..1 across available margin.")
    ap.add_argument("--pan-y", type=float, default=0.0, help="-1..1 across available margin.")
    ap.add_argument("--crf", type=int, default=17)
    a = ap.parse_args()

    if not a.image.exists():
        sys.exit(f"ERROR: not found: {a.image}")

    im = Image.open(a.image).convert("RGB")
    iw, ih = im.size
    bw, bh = base_box(iw, ih)
    n = max(int(round(a.seconds * a.fps)), 2)

    a.output.parent.mkdir(parents=True, exist_ok=True)
    cmd = [ffmpeg_exe(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(a.fps), "-i", "-",
           "-an", "-c:v", "libx264", "-crf", str(a.crf), "-preset", "slow",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(a.output)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                            stderr=subprocess.PIPE)

    try:
        for i in range(n):
            t = i / (n - 1)
            z = 1.0 + (a.zoom - 1.0) * t
            cw, ch = bw / z, bh / z
            # margin left over after the zoomed window, for panning
            mx, my = (iw - cw) / 2.0, (ih - ch) / 2.0
            cx = iw / 2.0 + a.pan_x * mx * t
            cy = ih / 2.0 + a.pan_y * my * t
            l, top = cx - cw / 2.0, cy - ch / 2.0
            # clamp inside the source without snapping to integers
            l = min(max(l, 0.0), iw - cw)
            top = min(max(top, 0.0), ih - ch)
            frame = im.resize((W, H), Image.LANCZOS, box=(l, top, l + cw, top + ch))
            proc.stdin.write(frame.tobytes())
    finally:
        proc.stdin.close()
        err = proc.stderr.read().decode(errors="replace")
        rc = proc.wait()

    if rc != 0:
        print(err[-2000:]); sys.exit(1)
    print(f"Created: {a.output}  ({n} frames, {a.seconds}s @ {a.fps}fps, zoom->{a.zoom})")


if __name__ == "__main__":
    main()
