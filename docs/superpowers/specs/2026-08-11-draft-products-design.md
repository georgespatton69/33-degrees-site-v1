# Design: 4 Draft (Fully Hidden) Product Pages

**Date:** 2026-08-11
**Status:** Awaiting user review

## Objective

Add four new research compounds to the site as **fully hidden drafts** — complete
product pages that exist at their URLs but are not linked, listed, or indexed
anywhere until pricing and copy are approved. No pricing is available yet.

## The four products

| Product (as given)     | Slug / URL                    | Card size badge | PDP category tag        |
| ---------------------- | ----------------------------- | --------------- | ----------------------- |
| Glutathione 1500MG     | `/products/glutathione/`      | 1500mg          | Cellular Aging          |
| Pinealon 10MG          | `/products/pinealon/`         | 10mg            | Cellular Aging          |
| Thymosin Alpha-1 10MG  | `/products/thymosin-alpha-1/` | 10mg            | Immunology & Recovery   |
| Oxytocin acetate 2mg   | `/products/oxytocin/`         | 2mg             | Cellular Energy         |

Category tags only appear on the PDP itself (page is otherwise unlinked), so they
are low-stakes and easy to change before launch.

## Requirements & decisions

1. **Fully hidden.** Build a full `products/<slug>/index.html` for each, but do NOT
   add them to `/compounds/`, the homepage, nav menus, or `sitemap.xml`. Reachable
   only by direct URL.
2. **No-index.** Each page includes `<meta name="robots" content="noindex, follow">`
   so search engines do not index drafts before launch. (Removed at launch.)
3. **Placeholder price, not buyable.** No pricing and no backend record exist. The
   price slot shows a **"Coming Soon"** placeholder. The variant selector,
   Add-to-Cart button, and `api.js` price-hydration wiring are omitted on these
   pages so the product cannot be added to the cart even via direct URL.
   - Rationale: `js/api.js` progressively enhances real products, but for a product
     with no backend record it returns early and leaves the hardcoded HTML. The
     stock template's Add-to-Cart button self-enables after 5s — undesirable for a
     no-price draft. Omitting the commerce block avoids this entirely.
4. **Full pages.** Each page uses the existing PDP template structure: hero image +
   compound card, "What It Is", "How It Works" mechanism flow, "What Researchers
   Study It For", "Common Research Protocols", community-interest box, stat cards,
   related-articles section, footer.
5. **Compliance-framed copy.** All copy is research-framed: no health claims, no
   personal pronouns, no action verbs/imperatives, 99% purity language, only
   defensible peer-reviewed framing, no "stack"/"healing" product naming, no flat
   benefit claims. Copy is drafted then **reviewed by the user per product** before
   anything goes live — the science wording is not asserted as publication-perfect.
6. **Images via nano-banana.** One branded bottle shot per product, cloning an
   existing 33D bottle image and swapping only the label text, saved to
   `assets/images/products/<slug>.webp`.

## Files created / changed

- `assets/images/products/glutathione.webp` (new)
- `assets/images/products/pinealon.webp` (new)
- `assets/images/products/thymosin-alpha-1.webp` (new)
- `assets/images/products/oxytocin.webp` (new)
- `products/glutathione/index.html` (new)
- `products/pinealon/index.html` (new)
- `products/thymosin-alpha-1/index.html` (new)
- `products/oxytocin/index.html` (new)

No changes to `compounds/index.html`, `index.html`, nav, or `sitemap.xml`.

## Deviations from the stock PDP template (draft-only)

- Add `<meta name="robots" content="noindex, follow">` in `<head>`.
- Replace the `.pdp-price-row` value with a `Coming Soon` placeholder.
- Remove `.product-variants`, the `#add-to-cart` button, `.product-lab-results`, and
  the inline add-to-cart `<script>`.
- Keep `cart.js` (the nav cart still works site-wide) and keep `api.js` for template
  parity — `api.js` safely no-ops for a product with no backend record.

## Launch checklist (later, per product, when pricing is ready)

1. Create the product + variants record in the Django backend (separate repo).
2. Restore the standard price-row / variant selector / Add-to-Cart block + inline
   add-to-cart script.
3. Remove the `noindex` meta tag.
4. Add a catalog card to the correct `/compounds/` category section.
5. Add a `<url>` entry to `sitemap.xml`.
6. Bump `?v=N` on any shared CSS/JS if touched.

## Testing / verification

- Each `products/<slug>/index.html` loads locally and renders (image, sections, footer).
- Grep confirms none of the 4 slugs appear in `compounds/index.html`, `index.html`,
  nav includes, or `sitemap.xml`.
- Each page contains the `noindex` meta and a `Coming Soon` price placeholder, and
  contains no `add-to-cart` button.

## Out of scope

- Backend product records (separate repo, not in this workspace).
- Final pricing and variant sizes.
- Blog articles or cross-links for these compounds.
