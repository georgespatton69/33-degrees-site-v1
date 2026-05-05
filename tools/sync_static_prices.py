"""
Sync static HTML price fallbacks to match the live API.

Run this AFTER updating prices in the Django backend. It pulls the
computed price_display for every product from the API and rewrites
the static fallback prices on:
  - products/<slug>/index.html → .product-detail-price span
  - index.html → homepage product-card .product-price
  - index.html → homepage bundle-card .bundle-price
  - compounds/index.html → .cat-price spans

After api.js loads on a page these get overwritten anyway, but having
the static fallback be correct means no flash of stale price on slow
connections, and the page works even if the API is down.

Usage:  python3 tools/sync_static_prices.py
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

API = 'https://web-production-a7a6.up.railway.app/api/v1/products/?page_size=100'


def fetch_prices():
    data = json.loads(urllib.request.urlopen(API).read())
    return {p['slug']: p for p in data['results']}


def detail_price(p):
    """What the static fallback on the detail page should show.
    Use the lowest active variant's price as a clean number — variant click
    immediately overrides anyway, so this is just the pre-hydration value."""
    variants = [v for v in p.get('variants', []) if v.get('is_active')]
    if variants:
        lo = min(float(v['price']) for v in variants)
        return f'${lo:.2f}'
    return p.get('price_display') or f'${float(p.get("price", 0)):.2f}'


def card_price(p):
    """What the static fallback on a homepage / compounds card should show.
    Match what the API returns as price_display so it equals what api.js renders."""
    return p.get('price_display') or f'${float(p.get("price", 0)):.2f}'


def update_detail_pages(prices, root):
    changed = []
    for slug, p in prices.items():
        path = root / 'products' / slug / 'index.html'
        if not path.exists():
            continue
        text = path.read_text()
        new_price = detail_price(p)
        # Replace the .product-detail-price span content
        new_text, n = re.subn(
            r'(<span class="product-detail-price[^"]*">)[^<]+(</span>)',
            lambda m: f'{m.group(1)}{new_price}{m.group(2)}',
            text,
        )
        if n and new_text != text:
            path.write_text(new_text)
            changed.append((slug, new_price))
    return changed


def update_homepage_and_compounds(prices, root):
    """Update homepage product-card prices, bundle-card prices, and compounds page cat-price."""
    changed = []
    for filename in ['index.html', 'compounds/index.html']:
        path = root / filename
        if not path.exists():
            continue
        text = path.read_text()
        before = text

        for slug, p in prices.items():
            new_price = card_price(p)
            # Match cards that link to /products/<slug>/ — update any nearby
            # .product-price, .bundle-price, .cat-price element
            # Strategy: per slug, find each occurrence of <a href="/products/SLUG/">
            # and walk backwards to the nearest price span/p, replace its inner text.
            for cls in ('product-price', 'bundle-price', 'cat-price'):
                # Pattern A: price comes BEFORE the link (typical bundle layout)
                pat_a = re.compile(
                    r'(<(?:span|p)\s+class="' + cls + r'"[^>]*>)([^<]+)(</(?:span|p)>\s*<a\s+href="/products/' + re.escape(slug) + r'/")',
                    re.DOTALL,
                )
                text = pat_a.sub(lambda m: f'{m.group(1)}{new_price}{m.group(3)}', text)
                # Pattern B: link comes BEFORE the price (typical product-card layout)
                pat_b = re.compile(
                    r'(<a\s+href="/products/' + re.escape(slug) + r'/"[^>]*>[^<]*</a>[^<]*<(?:span|p)\s+class="' + cls + r'"[^>]*>)([^<]+)(</)',
                    re.DOTALL,
                )
                text = pat_b.sub(lambda m: f'{m.group(1)}{new_price}{m.group(3)}', text)
                # Pattern C: card-with-image - look for img alt + then price (homepage product-card pattern)
                pat_c = re.compile(
                    r'(<img\s+src="[^"]*/' + re.escape(slug) + r'\.webp"[^>]*>.*?<p\s+class="' + cls + r'"[^>]*>)([^<]+)(</p>)',
                    re.DOTALL,
                )
                text = pat_c.sub(lambda m: f'{m.group(1)}{new_price}{m.group(3)}', text)

        if text != before:
            path.write_text(text)
            changed.append(filename)
    return changed


def main():
    root = Path(__file__).parent.parent
    prices = fetch_prices()
    print(f'Fetched {len(prices)} products from {API}')
    detail_changes = update_detail_pages(prices, root)
    page_changes = update_homepage_and_compounds(prices, root)
    print(f'\nDetail pages updated: {len(detail_changes)}')
    for slug, price in detail_changes:
        print(f'  {slug}: {price}')
    print(f'\nHomepage / compounds files updated: {len(page_changes)}')
    for f in page_changes:
        print(f'  {f}')


if __name__ == '__main__':
    main()
