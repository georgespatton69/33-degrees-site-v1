"""Regenerate Methylene Blue and Tesofensine bottle images.

Both currently show a horizontal platform-edge line near the bottom of
the image (artifact of the generation prompt placing them on an elevated
slab). This re-runs them with explicit "continuous marble floor"
staging to match MT-2 / LIPO-C / other peptide vials.

Uses LIPO-C (semax-cloned) as the staging reference for the floor style,
then prompts the model to change the bottle to a tall pill bottle with
the right label.
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

client = genai.Client(api_key=API_KEY)

PRODUCTS = [
    {
        "slug": "methylene-blue",
        "product_name": "Methylene Blue",
        "dose_line": "20MG · 100 CAPSULES",
    },
    {
        "slug": "tesofensine",
        "product_name": "Tesofensine",
        "dose_line": "500MCG · 100 CAPSULES",
    },
]


def regenerate(product):
    # Use current Tesofensine label/bottle styling but ask for the LIPO-C-style floor
    # We'll feed Tesofensine as the LABEL+BOTTLE reference and explicitly call out
    # the surface change in the prompt.
    ref_path = os.path.join(OUTPUT_DIR, "tesofensine.webp")

    prompt = f"""Take the attached product image and produce a new image with TWO changes:

CHANGE 1 — Label text only:
- Where the label currently says "Tesofensine" → "{product['product_name']}"
- Where the label currently says "500MCG · 100 CAPSULES" → "{product['dose_line']}"

CHANGE 2 — Background/staging:
- REMOVE the elevated platform/slab the bottle is sitting on
- REPLACE it with a CONTINUOUS dark marble floor that extends naturally in all directions, with NO visible horizontal edge, NO platform front, NO divider line cutting across the lower portion of the image
- The marble surface should fade smoothly into the background, like the bottle is sitting on an infinite dark marble floor

KEEP IDENTICAL:
- The bottle shape, proportions, color (matte black tall cylindrical pill bottle)
- The cap (same color, flat-top shape)
- The gold pinstripe accent lines on the label (top and bottom)
- The golden tree of life logo (unchanged, same position)
- The "33 DEGREES OF HEALING" text (unchanged)
- The dark moody background, gold bokeh particles, golden rim lighting on the bottle
- The reflection beneath the bottle
- The camera angle and framing

The image should look like the bottle is on a continuous polished marble floor, NOT on a podium with a visible edge."""

    with open(ref_path, "rb") as f:
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
                img.save(os.path.join(OUTPUT_DIR, f"{product['slug']}.png"), "PNG")
                img.save(os.path.join(OUTPUT_DIR, f"{product['slug']}.webp"), "WEBP", quality=85)
                print(f"  Created: {product['slug']}.webp ({img.size[0]}x{img.size[1]})")
                return True
    print(f"  FAILED: {product['slug']}")
    return False


if __name__ == "__main__":
    for p in PRODUCTS:
        print(f"Regenerating {p['product_name']}...")
        regenerate(p)
