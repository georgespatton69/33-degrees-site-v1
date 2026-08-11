# 4 Draft (Hidden) Product Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Glutathione, Pinealon, Thymosin Alpha-1, and Oxytocin as fully hidden, no-price draft product pages that exist at their URLs but are unlinked and non-indexed until launch.

**Architecture:** Each product is a static `products/<slug>/index.html` cloned from the existing PDP template (`products/epithalon/index.html`), with the commerce block replaced by a "Coming Soon" price placeholder and a `noindex` meta tag. No changes to catalog, nav, homepage, or sitemap. Branded bottle images generated via the nano-banana skill.

**Tech Stack:** Static HTML/CSS, GitHub Pages, nano-banana (Gemini image gen), git.

## Global Constraints

- Copy rules: research-framed only; no health claims; no personal pronouns; no action verbs/imperatives; no "stack"/"healing" naming; no flat benefit claims; only defensible peer-reviewed framing.
- Purity language is **99%** site-wide (never 98%).
- Do NOT link these 4 slugs from `compounds/index.html`, `index.html`, nav menus, or `sitemap.xml`.
- Every draft page includes `<meta name="robots" content="noindex, follow">`.
- Price slot shows `Coming Soon`; no variant selector, no Add-to-Cart button, no inline add-to-cart script.
- Keep shared CSS/JS `?v=N` query strings identical to the source template (no CSS/JS changes in this plan).
- Commit + push after completion so it goes live (fully hidden, so safe).

### Product reference table

| Product | Slug | Size badge | PDP tag | Image file |
| --- | --- | --- | --- | --- |
| Glutathione 1500MG | `glutathione` | 1500mg | Cellular Aging | `assets/images/products/glutathione.webp` |
| Pinealon 10MG | `pinealon` | 10mg | Cellular Aging | `assets/images/products/pinealon.webp` |
| Thymosin Alpha-1 10MG | `thymosin-alpha-1` | 10mg | Immunology &amp; Recovery | `assets/images/products/thymosin-alpha-1.webp` |
| Oxytocin acetate 2mg | `oxytocin` | 2mg | Cellular Energy | `assets/images/products/oxytocin.webp` |

---

### Task 1: Generate 4 branded bottle images

**Files:**
- Create: `assets/images/products/glutathione.webp`
- Create: `assets/images/products/pinealon.webp`
- Create: `assets/images/products/thymosin-alpha-1.webp`
- Create: `assets/images/products/oxytocin.webp`

**Interfaces:**
- Produces: four `.webp` bottle images at the paths above, matching the visual style/dimensions of existing `assets/images/products/*.webp` (e.g. `epithalon.webp`), each with the correct label text.

- [ ] **Step 1:** Invoke the `nano-banana-image` skill. For each product, clone an existing 33D bottle image as the reference and swap ONLY the label text to the product name + size (e.g. "Glutathione 1500mg"). Follow the established pattern (memory: clone + swap label, don't describe from scratch).
- [ ] **Step 2:** Save each output to its path in the reference table as `.webp`.
- [ ] **Step 3 (verify):** Run `ls -la assets/images/products/{glutathione,pinealon,thymosin-alpha-1,oxytocin}.webp` — expect all 4 present, non-zero size.
- [ ] **Step 4 (visual check):** Show the 4 images to the user for approval before building pages. Regenerate any the user rejects.

---

### Task 2: Build the Glutathione page (establishes draft template)

**Files:**
- Create: `products/glutathione/index.html`
- Reference: `products/epithalon/index.html` (source template)

**Interfaces:**
- Consumes: `assets/images/products/glutathione.webp` from Task 1.
- Produces: the canonical "draft page" shape reused by Tasks 3–5 — a full PDP with `noindex` meta, `Coming Soon` price placeholder, and no commerce controls.

- [ ] **Step 1:** Copy `products/epithalon/index.html` to `products/glutathione/index.html` as a starting point.
- [ ] **Step 2:** Update `<head>`: `<title>`, meta description, canonical URL, OG/Twitter title+description+`og:url`+image, and BreadcrumbList JSON-LD — all to Glutathione / `/products/glutathione/` / `glutathione.webp`. Keep the two font preconnects, stylesheet `?v` values, and script includes identical to source.
- [ ] **Step 3:** Add `<meta name="robots" content="noindex, follow">` inside `<head>` (right after the description meta).
- [ ] **Step 4:** In the PDP left column, set `<img src="/assets/images/products/glutathione.webp" alt="Glutathione">`, and update `.pdp-compound-card` (`.pdp-card-total` → `1500mg`, `.pdp-card-compounds` → `Glutathione 1500mg`).
- [ ] **Step 5:** In the PDP right column: set `data-product-detail="glutathione"`, `.pdp-tag` → `Cellular Aging`, `.pdp-title` → `Glutathione`, `.pdp-subtitle` → a research-framed subtitle.
- [ ] **Step 6:** Replace the price/commerce block: set `.pdp-price-row` value to `<span class="product-detail-price pdp-price">Coming Soon</span>`; DELETE the `.product-variants` div, the `#add-to-cart` button, the `.product-lab-results` div, and the inline `add-to-cart` `<script>` block near the bottom. Keep the trust badges, share widget, glossary + share `<script>`s, and the `cart.js`/`api.js`/`search.js`/`age-gate.js`/`schema.js` includes.
- [ ] **Step 7:** Rewrite the `.pdp-info` sections (What It Is, How It Works mechanism flow, What Researchers Study It For, Common Research Protocols, community box, stat cards) with research-framed Glutathione copy. Draft content: Glutathione is a tripeptide (Glu-Cys-Gly); research examines its role in cellular redox balance, oxidative-stress pathways, and detoxification enzyme systems. Use glossary-term tooltips where a term needs defining.
- [ ] **Step 8 (COPY REVIEW GATE):** Show the drafted Glutathione copy to the user for approval before proceeding. Apply edits.
- [ ] **Step 9 (verify):** Run:
  ```bash
  grep -c 'noindex' products/glutathione/index.html          # expect >=1
  grep -c 'Coming Soon' products/glutathione/index.html       # expect >=1
  grep -c 'add-to-cart' products/glutathione/index.html       # expect 0
  grep -c 'glutathione.webp' products/glutathione/index.html  # expect >=2
  ```
- [ ] **Step 10 (render):** Open `products/glutathione/index.html` in a browser (or the /run skill) and confirm image, all info sections, and footer render with no broken layout.
- [ ] **Step 11: Commit**
  ```bash
  git add products/glutathione/ assets/images/products/glutathione.webp
  git commit -m "Add Glutathione as hidden draft product page"
  ```

---

### Task 3: Build the Pinealon page

**Files:**
- Create: `products/pinealon/index.html`
- Reference: `products/glutathione/index.html` (draft template from Task 2)

**Interfaces:**
- Consumes: `assets/images/products/pinealon.webp`; the draft-page shape from Task 2.

- [ ] **Step 1:** Copy `products/glutathione/index.html` to `products/pinealon/index.html`.
- [ ] **Step 2:** Swap all head metadata (title, description, canonical, OG/Twitter, JSON-LD) to Pinealon / `/products/pinealon/` / `pinealon.webp`. Keep the `noindex` meta.
- [ ] **Step 3:** Swap image (`pinealon.webp`, alt `Pinealon`), `.pdp-compound-card` (`10mg`, `Pinealon 10mg`), `data-product-detail="pinealon"`, `.pdp-tag` → `Cellular Aging`, `.pdp-title` → `Pinealon`, subtitle, and confirm price still reads `Coming Soon` with no commerce controls.
- [ ] **Step 4:** Rewrite `.pdp-info` with research-framed Pinealon copy. Draft content: Pinealon is a synthetic tripeptide (Glu-Asp-Arg) studied for mechanisms in neuronal cell models, cognitive-research paradigms, and pineal/antioxidant pathways.
- [ ] **Step 5 (COPY REVIEW GATE):** Show drafted Pinealon copy to user; apply edits.
- [ ] **Step 6 (verify):** Run the four greps from Task 2 Step 9 against `products/pinealon/index.html` with `pinealon.webp` (expect noindex>=1, "Coming Soon">=1, add-to-cart==0, image>=2).
- [ ] **Step 7 (render):** Confirm the page renders cleanly.
- [ ] **Step 8: Commit**
  ```bash
  git add products/pinealon/
  git commit -m "Add Pinealon as hidden draft product page"
  ```

---

### Task 4: Build the Thymosin Alpha-1 page

**Files:**
- Create: `products/thymosin-alpha-1/index.html`
- Reference: `products/glutathione/index.html`

**Interfaces:**
- Consumes: `assets/images/products/thymosin-alpha-1.webp`; the draft-page shape from Task 2.

- [ ] **Step 1:** Copy `products/glutathione/index.html` to `products/thymosin-alpha-1/index.html`.
- [ ] **Step 2:** Swap all head metadata to Thymosin Alpha-1 / `/products/thymosin-alpha-1/` / `thymosin-alpha-1.webp`. Keep `noindex`.
- [ ] **Step 3:** Swap image (`thymosin-alpha-1.webp`, alt `Thymosin Alpha-1`), `.pdp-compound-card` (`10mg`, `Thymosin Alpha-1 10mg`), `data-product-detail="thymosin-alpha-1"`, `.pdp-tag` → `Immunology &amp; Recovery`, `.pdp-title` → `Thymosin Alpha-1`, subtitle, and confirm `Coming Soon` price with no commerce controls.
- [ ] **Step 4:** Rewrite `.pdp-info` with research-framed Thymosin Alpha-1 copy. Draft content: Thymosin Alpha-1 is a 28-amino-acid peptide derived from prothymosin alpha, studied extensively for mechanisms in immune signaling and T-cell research models.
- [ ] **Step 5 (COPY REVIEW GATE):** Show drafted copy to user; apply edits.
- [ ] **Step 6 (verify):** Run the four greps against `products/thymosin-alpha-1/index.html` with `thymosin-alpha-1.webp`.
- [ ] **Step 7 (render):** Confirm clean render.
- [ ] **Step 8: Commit**
  ```bash
  git add products/thymosin-alpha-1/
  git commit -m "Add Thymosin Alpha-1 as hidden draft product page"
  ```

---

### Task 5: Build the Oxytocin page

**Files:**
- Create: `products/oxytocin/index.html`
- Reference: `products/glutathione/index.html`

**Interfaces:**
- Consumes: `assets/images/products/oxytocin.webp`; the draft-page shape from Task 2.

- [ ] **Step 1:** Copy `products/glutathione/index.html` to `products/oxytocin/index.html`.
- [ ] **Step 2:** Swap all head metadata to Oxytocin / `/products/oxytocin/` / `oxytocin.webp`. Title/name displays as "Oxytocin" (product is oxytocin acetate). Keep `noindex`.
- [ ] **Step 3:** Swap image (`oxytocin.webp`, alt `Oxytocin`), `.pdp-compound-card` (`2mg`, `Oxytocin 2mg`), `data-product-detail="oxytocin"`, `.pdp-tag` → `Cellular Energy`, `.pdp-title` → `Oxytocin`, subtitle, and confirm `Coming Soon` price with no commerce controls.
- [ ] **Step 4:** Rewrite `.pdp-info` with research-framed Oxytocin copy. Draft content: Oxytocin is a nine-amino-acid neuropeptide (supplied as the acetate salt) studied for mechanisms in neuroendocrine signaling and social-behavior research paradigms.
- [ ] **Step 5 (COPY REVIEW GATE):** Show drafted copy to user; apply edits.
- [ ] **Step 6 (verify):** Run the four greps against `products/oxytocin/index.html` with `oxytocin.webp`.
- [ ] **Step 7 (render):** Confirm clean render.
- [ ] **Step 8: Commit**
  ```bash
  git add products/oxytocin/
  git commit -m "Add Oxytocin as hidden draft product page"
  ```

---

### Task 6: Whole-set verification & push

**Files:**
- Verify only: `compounds/index.html`, `index.html`, `sitemap.xml`, all 4 new pages.

- [ ] **Step 1 (hidden check):** Confirm none of the 4 slugs are linked publicly:
  ```bash
  grep -rn -E 'glutathione|pinealon|thymosin-alpha-1|/products/oxytocin' \
    compounds/index.html index.html sitemap.xml
  ```
  Expected: NO matches (empty output). If anything matches, remove that link.
- [ ] **Step 2 (per-page invariants):** For each of the 4 pages, confirm `noindex` present (>=1), `Coming Soon` present (>=1), `add-to-cart` absent (0):
  ```bash
  for s in glutathione pinealon thymosin-alpha-1 oxytocin; do
    echo "== $s =="
    grep -c 'noindex' products/$s/index.html
    grep -c 'Coming Soon' products/$s/index.html
    grep -c 'add-to-cart' products/$s/index.html
  done
  ```
  Expected per page: `1+`, `1+`, `0`.
- [ ] **Step 3 (direct-URL render):** Load all 4 pages once more; confirm each renders and the nav cart still works site-wide.
- [ ] **Step 4: Push**
  ```bash
  git push
  ```
- [ ] **Step 5:** Report to user: 4 hidden draft URLs, confirmation they are unlinked + noindex + not buyable, and the launch checklist reference in the spec.

---

## Self-Review notes

- **Spec coverage:** hidden (Task 6 Step 1), noindex (all build tasks), placeholder price (all build tasks), full pages (Tasks 2–5 Step 7/4), compliance copy + review gates (each build task), images (Task 1), no catalog/nav/sitemap change (Task 6 Step 1). Covered.
- **Copy accuracy:** all product science blurbs are DRAFTS pending the per-task user copy-review gate — not asserted as final.
- **Consistency:** every page derives from the Task 2 Glutathione template, so the draft-page shape (noindex + Coming Soon + no commerce) is identical across all four.
