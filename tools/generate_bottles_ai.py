"""Generate product bottle images using Nano Banana Pro via google.genai SDK."""
from google import genai
from google.genai import types
from PIL import Image
import os
import io
import time
import base64

API_KEY = "AIzaSyAo3oyb7hrMVVjKcqtS4zAdbzUJZ-tEutA"
MODEL = "nano-banana-pro-preview"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets/images/products")
LABEL_PATH = os.path.expanduser("~/Desktop/33 degrees/Reta Label.png")

client = genai.Client(api_key=API_KEY)

PRODUCTS = [
    ("retatrutide", "Retatrutide 10MG"),
    ("bpc-157", "BPC-157"),
    ("tb-500", "TB-500"),
    ("wolverine-stack", "Wolverine Stack"),
    ("mots-c", "MOTS-c 10MG"),
    ("nad-plus", "NAD+ 1000MG"),
    ("epithalon", "Epithalon 10MG"),
    ("glow-blend", "Glow Blend 50MG"),
    ("ipamorelin", "Ipamorelin 10MG"),
    ("ghk-cu", "GHK-CU"),
    ("tesamorelin", "Tesamorelin 10MG"),
    ("ss-31", "SS-31 10MG"),
    ("aod-9604", "AOD 9604 10MG"),
]

# Load label reference
label_img = Image.open(LABEL_PATH)


def generate_bottle(product_id, product_name):
    """Generate a single product bottle image."""
    prompt = f"""Generate a photorealistic product image of a premium amber glass pharmaceutical vial/bottle for a peptide research company called "33 Degrees of Healing".

Use the attached label image as reference for the brand design — it shows the golden tree of life logo and brand styling.

The bottle should:
- Be an amber/brown glass pharmaceutical vial with a gold aluminum flip-off cap
- Have a black label with the golden tree of life logo (from reference) and the text "33 DEGREES OF HEALING" and "{product_name}" in gold text
- Be sitting on a dark reflective surface like black marble or dark wood
- Have dramatic studio lighting with warm golden rim lighting
- Dark moody background with subtle golden bokeh/particles
- Premium, medical-grade, luxurious look
- High-end supplement product photography style
- Single bottle, centered, with slight reflection on surface below

Overall aesthetic: dark, premium, scientific with gold accents."""

    # Upload label as reference
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

    # Extract image from response
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img_data = part.inline_data.data
                img = Image.open(io.BytesIO(img_data))
                output_path = os.path.join(OUTPUT_DIR, f"{product_id}.png")
                img.save(output_path, "PNG")
                print(f"  Created: {product_id}.png ({img.size[0]}x{img.size[1]})")
                return True

    print(f"  FAILED: {product_id} - no image in response")
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"  Response text: {part.text[:200]}")
    return False


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating product bottles via Nano Banana Pro...")
    print(f"Using label reference: {LABEL_PATH}\n")

    successes = 0
    for i, (pid, name) in enumerate(PRODUCTS):
        print(f"[{i+1}/{len(PRODUCTS)}] Generating {name}...")
        try:
            success = generate_bottle(pid, name)
            if success:
                successes += 1
            else:
                print(f"  Retrying {name}...")
                time.sleep(5)
                if generate_bottle(pid, name):
                    successes += 1
        except Exception as e:
            print(f"  ERROR: {e}")

        # Rate limiting
        if i < len(PRODUCTS) - 1:
            time.sleep(4)

    print(f"\nDone! {successes}/{len(PRODUCTS)} bottles generated.")
