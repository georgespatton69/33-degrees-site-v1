"""Generate pill-bottle (capsule) product images via Nano Banana Pro.

Mirrors generate_bottles_ai.py but produces even-sized cylindrical pill
bottles instead of pharmaceutical vials. Same brand styling — gold tree
of life logo on a black label, dark moody background, gold rim lighting.
"""
from google import genai
from google.genai import types
from PIL import Image
import os
import io
import time
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
LABEL_PATH = os.path.expanduser("~/Desktop/33 degrees/Reta Label.png")

client = genai.Client(api_key=API_KEY)

PRODUCTS = [
    ("methylene-blue", "Methylene Blue", "20MG · 100 CAPSULES"),
    ("tesofensine", "Tesofensine", "500MCG · 100 CAPSULES"),
]


def generate_pill_bottle(product_id, product_name, dose_line):
    prompt = f"""Generate a photorealistic product image of a premium pill bottle (capsule supplement bottle) for a research compound company called "33 Degrees of Healing".

Use the attached label image as reference for the brand design — golden tree of life logo, gold-on-black typography, premium medical aesthetic.

The bottle should:
- Be a SOLID OPAQUE CYLINDRICAL PILL BOTTLE — even diameter from top to bottom (NOT a tapered vial, NOT a pharmacy amber prescription bottle). Think a modern supplement/nutraceutical bottle: straight-sided cylinder, ~2.5x as tall as wide, flat top, flat bottom.
- Be matte black or deep amber-black in color (NOT clear glass — you should not see inside)
- Have a clean flat-top screw cap, same color as the bottle, with a subtle gold pinstripe at the seam
- Wrap-around black label covering most of the body with:
  - The golden tree of life logo from reference at top center
  - "33 DEGREES OF HEALING" in gold serif text below the logo
  - "{product_name}" as the prominent product name in larger gold text
  - "{dose_line}" in smaller gold text below the product name
- Sit on a dark reflective surface — black marble or dark wood
- Have dramatic studio lighting with warm golden rim lighting along the edges
- Dark moody background with subtle gold bokeh/particles
- Be centered, single bottle, with subtle reflection on the surface below
- High-end supplement product photography style

Overall aesthetic: dark, premium, scientific, gold accents — match a luxury nutraceutical brand."""

    with open(LABEL_PATH, "rb") as f:
        label_bytes = f.read()

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=label_bytes, mime_type="image/png"),
            prompt,
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img = Image.open(io.BytesIO(part.inline_data.data))
                # Save as PNG, then convert to WebP to match site convention
                png_path = os.path.join(OUTPUT_DIR, f"{product_id}.png")
                webp_path = os.path.join(OUTPUT_DIR, f"{product_id}.webp")
                img.save(png_path, "PNG")
                img.save(webp_path, "WEBP", quality=85)
                print(f"  Created: {product_id}.webp ({img.size[0]}x{img.size[1]})")
                return True

    print(f"  FAILED: {product_id} - no image in response")
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"  Response text: {part.text[:200]}")
    return False


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating pill-bottle images via Nano Banana Pro...\n")
    successes = 0
    for i, (pid, name, dose) in enumerate(PRODUCTS):
        print(f"[{i+1}/{len(PRODUCTS)}] {name}...")
        try:
            if generate_pill_bottle(pid, name, dose):
                successes += 1
            else:
                print(f"  Retrying {name}...")
                time.sleep(5)
                if generate_pill_bottle(pid, name, dose):
                    successes += 1
        except Exception as e:
            print(f"  ERROR: {e}")
        if i < len(PRODUCTS) - 1:
            time.sleep(4)

    print(f"\nDone! {successes}/{len(PRODUCTS)} bottles generated.")
