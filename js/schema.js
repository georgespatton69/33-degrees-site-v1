/**
 * Product structured data (JSON-LD) injector.
 *
 * Isolated from cart/api logic. Reads live product data (price, availability)
 * from the same cached API call api.js already makes, so the schema price always
 * matches the rendered price. Fully guarded in try/catch — any failure is silent
 * and can never affect variant rendering, the cart, or the page.
 *
 * Emits only factual commerce data (name, brand, image, price, availability).
 * Deliberately carries NO purity, rating, review, or health-claim fields.
 */
(function () {
    'use strict';

    var ORIGIN = 'https://33degreesofhealing.com';

    function slugFromPath() {
        var m = window.location.pathname.match(/products\/([^/]+)\/?$/);
        return m ? m[1] : null;
    }

    function abs(url) {
        if (!url) return url;
        if (/^https?:\/\//.test(url)) return url;
        return ORIGIN + (url.charAt(0) === '/' ? '' : '/') + url;
    }

    async function build() {
        try {
            var slug = slugFromPath();
            if (!slug) return;

            var api = window.ThirtyThreeAPI;
            if (!api || !api.apiFetch) return;

            var product = await api.apiFetch('products/' + slug + '/');
            if (!product) return;

            var h1 = document.querySelector('.pdp-title');
            var name = (h1 && h1.textContent.trim()) || product.name;

            var metaEl = document.querySelector('meta[name="description"]');
            var desc = metaEl ? metaEl.getAttribute('content') : '';

            var imgEl = document.querySelector('.pdp-image img');
            var image = abs(imgEl ? imgEl.getAttribute('src')
                                  : '/assets/images/products/' + slug + '.webp');

            var url = ORIGIN + '/products/' + slug + '/';

            var variants = (product.variants || []).filter(function (v) { return v.is_active; });
            var prices = variants
                .map(function (v) { return parseFloat(v.price); })
                .filter(function (n) { return !isNaN(n); });
            var anyInStock = variants.some(function (v) { return v.in_stock; }) || product.in_stock;
            var availability = anyInStock ? 'https://schema.org/InStock'
                                          : 'https://schema.org/OutOfStock';

            var offers;
            if (prices.length > 1) {
                offers = {
                    '@type': 'AggregateOffer',
                    'priceCurrency': 'USD',
                    'lowPrice': Math.min.apply(null, prices).toFixed(2),
                    'highPrice': Math.max.apply(null, prices).toFixed(2),
                    'offerCount': prices.length,
                    'availability': availability,
                    'url': url
                };
            } else {
                var p = prices.length ? prices[0] : parseFloat(product.price);
                offers = {
                    '@type': 'Offer',
                    'priceCurrency': 'USD',
                    'price': (isNaN(p) ? 0 : p).toFixed(2),
                    'availability': availability,
                    'url': url
                };
            }

            var ld = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                'name': name,
                'sku': product.slug,
                'brand': { '@type': 'Brand', 'name': '33 Degrees of Healing' },
                'image': image,
                'url': url,
                'offers': offers
            };
            if (desc) ld.description = desc;

            var s = document.createElement('script');
            s.type = 'application/ld+json';
            s.setAttribute('data-schema', 'product');
            s.textContent = JSON.stringify(ld);
            document.head.appendChild(s);
        } catch (e) {
            /* silent by design — schema must never break the page */
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
