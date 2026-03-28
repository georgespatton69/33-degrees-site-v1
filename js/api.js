/**
 * 33 Degrees API Client
 * Connects static frontend to Django backend
 * Progressive enhancement — page works without API, JS updates dynamic elements
 */
(function() {
    'use strict';

    const API_BASE = window.THIRTY3_API_BASE || 'http://localhost:8000/api/v1';
    const CACHE_TTL = 5 * 60 * 1000;
    const cache = {};

    async function apiFetch(endpoint) {
        const url = `${API_BASE}/${endpoint}`;
        const now = Date.now();
        if (cache[url] && (now - cache[url].time) < CACHE_TTL) return cache[url].data;
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            cache[url] = { data, time: now };
            return data;
        } catch (e) {
            console.warn('33D API unreachable:', e.message);
            return null;
        }
    }

    // Extract product slug from a link href like "products/bpc-157.html"
    function slugFromHref(href) {
        if (!href) return null;
        const match = href.match(/products\/([^.]+)\.html/);
        return match ? match[1] : null;
    }

    // ---- Product Card Hydration (homepage + compounds page) ----

    async function hydrateProductCards() {
        const data = await apiFetch('products/?page_size=100');
        if (!data || !data.results) return;

        const products = {};
        data.results.forEach(p => { products[p.slug] = p; });

        // Compounds page — .cat-product cards
        document.querySelectorAll('.cat-product').forEach(card => {
            const link = card.querySelector('a[href*="products/"]');
            const slug = slugFromHref(link && link.getAttribute('href'));
            if (!slug || !products[slug]) return;
            const product = products[slug];

            // Update price
            const priceEl = card.querySelector('.cat-price');
            if (priceEl) {
                priceEl.textContent = product.price_display || `$${parseFloat(product.price).toFixed(0)}`;
            }

        });

        // Homepage — .product-card cards
        document.querySelectorAll('.product-card').forEach(card => {
            const link = card.querySelector('a[href*="products/"]');
            const slug = slugFromHref(link && link.getAttribute('href'));
            if (!slug || !products[slug]) return;
            const product = products[slug];

            const priceEl = card.querySelector('.product-price');
            if (priceEl) {
                priceEl.textContent = product.price_display || `$${parseFloat(product.price).toFixed(2)}`;
            }
        });

        // Homepage — .cat-product in storytelling sections
        document.querySelectorAll('.cat-section .cat-product').forEach(card => {
            const link = card.querySelector('a[href*="products/"]');
            const slug = slugFromHref(link && link.getAttribute('href'));
            if (!slug || !products[slug]) return;
            const product = products[slug];

            const priceEl = card.querySelector('.cat-price');
            if (priceEl) {
                priceEl.textContent = product.price_display || `$${parseFloat(product.price).toFixed(0)}`;
            }
        });
    }

    // ---- Product Detail Page ----

    async function hydrateProductDetail() {
        // Detect product slug from URL: /products/bpc-157.html
        const pathSlug = slugFromHref(window.location.pathname);
        const slugEl = document.querySelector('[data-product-detail]');
        const slug = (slugEl && slugEl.dataset.productDetail) || pathSlug;
        if (!slug) return;

        const product = await apiFetch(`products/${slug}/`);
        if (!product) return;

        // Update price
        const priceEl = document.querySelector('.product-detail-price');
        if (priceEl) {
            priceEl.textContent = product.price_display || `$${parseFloat(product.price).toFixed(2)}`;
        }

        // Render variant selector
        const variantContainer = document.querySelector('.product-variants');
        if (variantContainer && product.variants.length > 0) {
            variantContainer.innerHTML = product.variants
                .filter(v => v.is_active)
                .map(v => `
                    <button class="variant-btn ${v.in_stock ? '' : 'out-of-stock'}"
                            data-variant-id="${v.id}"
                            data-price="${v.price}"
                            ${v.in_stock ? '' : 'disabled'}>
                        ${v.size} — $${parseFloat(v.price).toFixed(0)}
                        ${v.in_stock ? '' : '<span class="variant-oos">Out of Stock</span>'}
                    </button>
                `).join('');

            variantContainer.querySelectorAll('.variant-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    variantContainer.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (priceEl) priceEl.textContent = `$${parseFloat(btn.dataset.price).toFixed(2)}`;
                });
            });

            const firstAvailable = variantContainer.querySelector('.variant-btn:not([disabled])');
            if (firstAvailable) firstAvailable.click();
        }

        // Show lab results / batch info
        const labContainer = document.querySelector('.product-lab-results');
        if (labContainer && product.lab_results && product.lab_results.length > 0) {
            labContainer.innerHTML = product.lab_results.map(lr => `
                <div class="lab-result-badge">
                    <span class="lab-batch">Batch ${lr.batch_number}</span>
                    <span class="lab-purity">${lr.purity_percentage}% Pure</span>
                    <span class="lab-lab">${lr.testing_lab}</span>
                    ${lr.coa_url ? `<a href="${lr.coa_url}" target="_blank" class="lab-coa-link">View COA</a>` : ''}
                </div>
            `).join('');
        }
    }

    // ---- Lab Results Page ----

    async function hydrateLabResults() {
        const container = document.querySelector('#lab-results-grid');
        if (!container) return;

        const data = await apiFetch('lab-results/?page_size=100');
        if (!data || !data.results || data.results.length === 0) {
            container.innerHTML = '<p class="no-results">No published lab results yet.</p>';
            return;
        }

        container.innerHTML = data.results.map(lr => `
            <div class="lab-card">
                <div class="lab-card-header">
                    <h3>${lr.product_name}${lr.variant_size ? ` ${lr.variant_size}` : ''}</h3>
                    <span class="lab-card-batch">Batch: ${lr.batch_number}</span>
                </div>
                <div class="lab-card-body">
                    <div class="lab-card-stat">
                        <span class="lab-card-label">Purity</span>
                        <span class="lab-card-value">${lr.purity_percentage}%</span>
                    </div>
                    <div class="lab-card-stat">
                        <span class="lab-card-label">Identity</span>
                        <span class="lab-card-value">${lr.identity_confirmed ? 'Confirmed' : 'Pending'}</span>
                    </div>
                    <div class="lab-card-stat">
                        <span class="lab-card-label">Lab</span>
                        <span class="lab-card-value">${lr.testing_lab}</span>
                    </div>
                    <div class="lab-card-stat">
                        <span class="lab-card-label">Test Date</span>
                        <span class="lab-card-value">${lr.test_date}</span>
                    </div>
                </div>
                ${lr.coa_url ? `<a href="${lr.coa_url}" target="_blank" class="btn btn-outline lab-card-coa">Download COA</a>` : ''}
            </div>
        `).join('');
    }

    // ---- Initialize ----

    document.addEventListener('DOMContentLoaded', () => {
        hydrateProductCards();
        hydrateProductDetail();
        hydrateLabResults();
    });

    window.ThirtyThreeAPI = { apiFetch, hydrateProductCards, hydrateProductDetail, hydrateLabResults };
})();
