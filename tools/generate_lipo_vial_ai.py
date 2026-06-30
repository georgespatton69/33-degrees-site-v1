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
    prompt = """Generate a photorealistic product image of a small amber glass PEPTIDE INJECTION VIAL for a research compound company called "33 Degrees of Healing". This must visually match a lineup of existing peptide vials (PT-141, Kisspeptin, Selank, Semax) shown alongside it on the website.

CRITICAL SHAPE & PROPORTION REQUIREMENTS:
- Small pharmaceutical-style amber/brown glass injection vial, NOT a supplement bottle
- TALLER than wide — roughly 2.5x taller than its diameter
- Has a distinct neck and shoulder (narrower at the top where the stopper sits)
- Small GOLD ALUMINUM FLIP-OFF CAP — the kind on injectable medication vials (small, rounded crown shape, NOT a flat screw-top)
- The vial is small enough to hold in two fingers

LABEL LAYOUT (must match the existing lineup exactly):
- Black rectangular label wrapping the middle of the vial body (does NOT cover the entire body)
- At the TOP of the label: the golden tree of life logo (from attached reference) — prominent and centered
- Below the logo: "33 DEGREES OF HEALING" in SMALL gold serif text (subtle, decorative)
- Below the brand: "LIPO-C BLEND" as the product name in MEDIUM-SIZED gold serif text (NOT huge — same scale as "PT-141" or "Kisspeptin" would be on a peptide vial)
- At the BOTTOM of the label: "526MG/ML" in tiny gold text
- The label should NOT have huge oversized product-name text

STAGING (match other vials — CRITICAL):
- FULL-BLEED DARK SCENE — entire image frame must be dark/black background, NO white borders, NO white margins, NO bright frame around the composition
- Vial sits on dark reflective marble surface that extends to the edges of the image
- Dramatic studio lighting with warm golden rim lighting along the vial edges
- Dark moody background with subtle gold bokeh particles
- Single vial, centered, with subtle reflection on the marble surface below
- Premium medical-grade injection-vial photography
- The composition should look like a tight close-up product shot, NOT a render of a vial on a podium with empty space around it

Use the attached label image strictly as brand-design reference for the tree logo and gold-on-black typography styling. The OUTPUT vial must look like a small pharmaceutical injection vial in the same family as the other research peptide vials, NOT a wider supplement bottle."""

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
