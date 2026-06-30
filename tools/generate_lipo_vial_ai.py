"""Generate LIPO-C vial image — amber glass peptide-style vial (NOT capsule)."""
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
LABEL_PATH = os.path.expanduser("~/Desktop/33 degrees/Reta Label.png")

client = genai.Client(api_key=API_KEY)


def generate():
    prompt = """Generate a photorealistic product image of a premium amber glass pharmaceutical vial/bottle for a research compound company called "33 Degrees of Healing".

Use the attached label image as reference for the brand design — golden tree of life logo, gold-on-black typography.

The bottle should:
- Be an amber/brown glass pharmaceutical vial with a gold aluminum flip-off cap
- Have a black label with the golden tree of life logo (from reference), the text "33 DEGREES OF HEALING" in small gold serif at top, then "LIPO-C BLEND" as the prominent product name in large gold text, then "526MG/ML" in smaller gold text below
- Be sitting on a dark reflective surface like black marble or dark wood
- Have dramatic studio lighting with warm golden rim lighting
- Dark moody background with subtle golden bokeh/particles
- Premium, medical-grade, luxurious look
- High-end supplement product photography style
- Single bottle, centered, with slight reflection on surface below

Overall aesthetic: dark, premium, scientific with gold accents — should match a series of other peptide vials in the same lineup."""

    with open(LABEL_PATH, "rb") as f:
        label_bytes = f.read()

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=label_bytes, mime_type="image/png"),
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
    return False


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating LIPO-C vial via Nano Banana Pro...")
    generate()
