#!/usr/bin/env python3
"""Generate images with Google's Nano Banana (Gemini image model).

Reusable CLI: give it a text prompt, optional reference image(s), and an output
path. Reference images let you keep brand/product consistency — the model treats
them as visual context (e.g. "place THIS bottle on a new background").

Usage:
    python generate_image.py \
        --prompt "A premium amber vial on dark marble with golden bokeh" \
        --output ../../../assets/images/marketing/ghk-hero.png \
        --ref /path/to/bottle.webp \
        --ref /path/to/label.png

Env:
    GEMINI_API_KEY   read from environment, or from the nearest .env walking up.
"""
import argparse
import io
import os
import sys
import time
from pathlib import Path

from google import genai
from google.genai import types
from PIL import Image

DEFAULT_MODEL = "nano-banana-pro-preview"


def load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    # Walk up from CWD looking for a .env with GEMINI_API_KEY=...
    here = Path.cwd()
    for d in [here, *here.parents]:
        env = d / ".env"
        if env.exists():
            for line in env.read_text().splitlines():
                line = line.strip()
                if line.startswith("GEMINI_API_KEY=") and not line.startswith("#"):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    sys.exit("ERROR: GEMINI_API_KEY not set (env or .env).")


def mime_for(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }.get(ext, "image/png")


def generate(prompt: str, output: Path, refs: list[Path], model: str, retries: int = 2) -> bool:
    client = genai.Client(api_key=load_api_key())

    parts = []
    for ref in refs:
        parts.append(types.Part.from_bytes(data=ref.read_bytes(), mime_type=mime_for(ref)))
    parts.append(prompt)

    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=parts,
                config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
            )
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                        img = Image.open(io.BytesIO(part.inline_data.data))
                        output.parent.mkdir(parents=True, exist_ok=True)
                        img.save(output)
                        print(f"Created: {output} ({img.size[0]}x{img.size[1]})")
                        return True
                # No image — surface any text the model returned (often a refusal/why)
                for part in response.candidates[0].content.parts:
                    if part.text:
                        print(f"No image returned. Model said: {part.text[:300]}")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
        if attempt < retries:
            time.sleep(5)
    return False


def main():
    ap = argparse.ArgumentParser(description="Generate an image with Nano Banana (Gemini).")
    ap.add_argument("--prompt", required=True, help="Text description of the image.")
    ap.add_argument("--output", required=True, type=Path, help="Where to save the PNG.")
    ap.add_argument("--ref", action="append", default=[], type=Path,
                    help="Reference image for visual consistency (repeatable).")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"Model id (default {DEFAULT_MODEL}).")
    args = ap.parse_args()

    for ref in args.ref:
        if not ref.exists():
            sys.exit(f"ERROR: reference image not found: {ref}")

    ok = generate(args.prompt, args.output, args.ref, args.model)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
