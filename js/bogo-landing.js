/* ==========================================================================
 * Buy-4-Get-2-Free landing page: hydrate EACH [data-bogo-product] block
 * independently (price, variant selector, working Add to Cart via the shared
 * cart) — the standard PDP JS only supports one product per page, so this
 * scopes everything per block. Also wires the per-product code copy buttons.
 * ========================================================================== */
(function () {
    'use strict';
    var API = 'https://web-production-a7a6.up.railway.app/api/v1';

    function hydrate(block) {
        var slug = block.dataset.bogoProduct;
        var priceEl = block.querySelector('.product-detail-price');
        var variants = block.querySelector('.product-variants');
        var addBtn = block.querySelector('.add-to-cart-btn');
        var nameEl = block.querySelector('.pdp-title');
        var imgEl = block.querySelector('.pdp-image img');

        fetch(API + '/products/' + slug + '/')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (product) {
                if (!product) return;
                if (priceEl) priceEl.textContent = product.price_display || ('$' + parseFloat(product.price).toFixed(2));

                var active = (product.variants || []).filter(function (v) { return v.is_active; });
                if (variants && active.length) {
                    variants.innerHTML = active.map(function (v) {
                        return '<button class="variant-btn ' + (v.in_stock ? '' : 'out-of-stock') + '"' +
                            ' data-variant-id="' + v.id + '" data-price="' + v.price + '" data-size="' + v.size + '"' +
                            (v.in_stock ? '' : ' disabled') + '>' +
                            v.size + ' — $' + parseFloat(v.price).toFixed(0) +
                            (v.in_stock ? '' : '<span class="variant-oos">Out of Stock</span>') + '</button>';
                    }).join('');
                    var btns = variants.querySelectorAll('.variant-btn');
                    btns.forEach(function (b) {
                        b.addEventListener('click', function () {
                            btns.forEach(function (x) { x.classList.remove('active'); });
                            b.classList.add('active');
                            if (priceEl) priceEl.textContent = '$' + parseFloat(b.dataset.price).toFixed(2);
                        });
                    });
                    var first = variants.querySelector('.variant-btn:not([disabled])');
                    if (first) { first.click(); if (addBtn) addBtn.disabled = false; }
                }

                if (addBtn) {
                    addBtn.addEventListener('click', function () {
                        if (!window.ThirtyThreeCart) return;
                        var sel = variants ? variants.querySelector('.variant-btn.active') : null;
                        var name = nameEl ? nameEl.textContent.trim() : slug;
                        var img = imgEl ? imgEl.getAttribute('src') : null;
                        if (sel) {
                            window.ThirtyThreeCart.addToCart(slug, name, sel.dataset.variantId, sel.dataset.size, parseFloat(sel.dataset.price), img);
                        } else if (priceEl) {
                            window.ThirtyThreeCart.addToCart(slug, name, null, null, parseFloat(priceEl.textContent.replace('$', '')), img);
                        }
                    });
                }
            })
            .catch(function () {});
    }

    function wireCodeCopy() {
        document.querySelectorAll('.bogo-code').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var code = btn.dataset.code;
                navigator.clipboard.writeText(code).then(function () {
                    var orig = btn.textContent;
                    btn.textContent = 'COPIED ✓';
                    btn.classList.add('copied');
                    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
                }).catch(function () {});
            });
        });
    }

    function init() {
        document.querySelectorAll('[data-bogo-product]').forEach(hydrate);
        wireCodeCopy();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
