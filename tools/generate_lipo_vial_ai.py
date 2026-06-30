"""Generate LIPO-C vial image by cloning the Semax vial and swapping label text.

Uses the existing semax.webp as the reference image — keeps shape,
proportions, cap, lighting, marble surface, bokeh background identical.
Only the label text changes.
"""
from google import genai
from google.genai import types
from PIL import Image
import os
import io
from pathlib import Path


def _load_env_key():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("GEMINI_API_KEY", "")


API_KEY = _load_env_key()
MODEL = "nano-banana-pro-preview"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets/images/products")
REFERENCE_PATH = os.path.join(OUTPUT_DIR, "semax.webp")

client = genai.Client(api_key=API_KEY)


def generate():
    prompt = """Take the attached product image (a 33 Degrees of Healing amber glass peptide vial) and produce a new image that is IDENTICAL in every visual respect EXCEPT for two text changes on the label:

CHANGE THESE TWO STRINGS ONLY:
1. Where the label currently says "Semax" — change it to "LIPO-C Blend"
2. Where the label currently shows "11MG" (the dose) — change it to "526MG/ML"

KEEP IDENTICAL:
- The vial shape, size, proportions, glass color (amber)
- The gold flip-off cap (same shape, size, color, finish)
- The black label position, size, and rounded edges
- The golden tree of life logo (unchanged, same position)
- The "33 DEGREES OF HEALING" text (unchanged, same font, size, position)
- The exact dark marble surface, golden bokeh background, lighting, rim glow, reflection
- The camera angle and framing

The only edits should be the two text strings on the label. Everything else must be a near-perfect visual match to the reference image."""

    with open(REFERENCE_PATH, "rb") as f:
        ref_bytes = f.read()

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=ref_bytes, mime_type="image/webp"),
            prompt,
        ],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )

    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img = Image.open(io.BytesIO(part.inline_data.data))
                img.save(os.path.join(OUTPUT_DIR, "lipo-c.png"), "PNG")
                img.save(os.path.join(OUTPUT_DIR, "lipo-c.webp"), "WEBP", quality=85)
                print(f"Created: lipo-c.webp ({img.size[0]}x{img.size[1]})")
                return True
    print("FAILED — no image in response")
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"Response text: {part.text[:300]}")
    return False


if __name__ == "__main__":
    print(f"Cloning {REFERENCE_PATH} with label text swap...")
    generate()
