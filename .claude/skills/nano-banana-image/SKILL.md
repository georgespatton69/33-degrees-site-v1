---
name: nano-banana-image
description: Generate marketing/product images with Google's Nano Banana (Gemini image model). Use this whenever the user wants to create, generate, or "craft" an image, product render, bottle shot, hero image, social/Instagram visual, or any AI-generated picture — especially product bottles on nice backgrounds for 33 Degrees. Also use when the user says "nano banana", "generate an image", "make me a render", or references composing a product onto a new background. Reference images keep brand/product consistency.
---

# Nano Banana Image Generation

Generate photoreal product and marketing images via Google's Nano Banana (Gemini
image model), with optional reference images so brand and product details stay
consistent across shots.

## When to use

Any request to create an AI image: product bottle renders, hero shots, social
posts (Instagram carousels/spotlights), background swaps, lifestyle composites.
For 33 Degrees specifically, this is the way to produce on-brand bottle imagery.

## Key idea: reference images drive consistency

Nano Banana can take one or more reference images alongside the text prompt. This
is what makes results usable instead of generic:

- **Brand label** — `~/Desktop/33 degrees/Reta Label.png` carries the gold
  tree-of-life logo and "33 DEGREES OF HEALING" styling. Pass it so generated
  bottles match the brand.
- **Existing product shot** — e.g. `assets/images/products/ghk-cu.webp`. Pass the
  real bottle so the model preserves its design and just restyles the scene
  ("place THIS bottle on a new background") rather than inventing a new bottle.

Prefer reusing the existing product `.webp` as a reference whenever the goal is a
new background/scene for an existing SKU — it keeps the render faithful to what's
already on the site.

## How to run

The API key is read from `GEMINI_API_KEY` (environment or the project `.env`).

```bash
python .claude/skills/nano-banana-image/scripts/generate_image.py \
  --prompt "<vivid scene description>" \
  --output assets/images/marketing/<name>.png \
  --ref assets/images/products/<sku>.webp \
  --ref "$HOME/Desktop/33 degrees/Reta Label.png"
```

`--ref` is repeatable and optional. Output is PNG; convert to WebP afterward if
it's going on the site (the project optimizes images to WebP — see image
optimization conventions).

## Writing good prompts

Be concrete about subject, surface, lighting, background, and mood. The brand
look that's worked well: amber/brown glass pharmaceutical vial, gold flip-off
cap, dark reflective surface (black marble), warm golden rim light, subtle golden
bokeh, premium medical-grade feel. For lighter social templates, a clean
marble/neutral background with soft daylight reads better than the dark moody
look — match the destination template.

After generating, look at the result. If it's off (wrong label text, distorted
bottle, busy background), refine the prompt or add a stronger reference image and
rerun — iterating on the prompt is cheaper than over-specifying up front.

## Compliance note (33 Degrees)

These are research-compound visuals. Keep imagery research/lab-framed; don't add
text overlays that imply human use, consumption, or health benefits. Bottle +
clean scene only — claims live nowhere in the art.
