/* ==========================================================================
 * Sitewide promo banner — fixed bar directly beneath the (fixed) nav header.
 * Buy 4, Get 2 Free — codes TESA426 / CJC426 / IPA426.
 *
 * To turn the promo OFF sitewide: set ENABLED = false (or delete the <script>).
 * Self-contained: injects its own styles, no-ops on any page without a header.
 * ========================================================================== */
(function () {
    'use strict';

    // ===================== CONFIG =====================
    var ENABLED = true;
    var HREF = '/buy-4-get-2-free/';   // click target
    var CODES = 'TESA426 · CJC426 · IPA426';
    // ==================================================
    if (!ENABLED) return;

    function init() {
        var header = document.querySelector('.site-header');
        if (!header || document.getElementById('promo-banner')) return;

        var css = [
            '#promo-banner{position:fixed;left:0;right:0;top:0;z-index:999;',
            'display:flex;flex-wrap:wrap;align-items:center;justify-content:center;',
            'gap:4px 12px;padding:9px 14px;text-align:center;text-decoration:none;',
            'background:linear-gradient(90deg,#c69a3a,#f2d885,#c69a3a);',
            'color:#1a1408;font-weight:700;font-size:0.82rem;letter-spacing:0.015em;',
            'line-height:1.3;box-shadow:0 2px 10px rgba(0,0,0,0.28);}',
            '#promo-banner .pb-offer,#promo-banner .pb-deal{white-space:nowrap;flex-shrink:0;}',
            '#promo-banner .pb-codes{font-weight:800;letter-spacing:0.05em;}',
            '#promo-banner .pb-arrow{font-weight:800;transition:transform .2s;}',
            '#promo-banner:hover{filter:brightness(1.05);}',
            '#promo-banner:hover .pb-arrow{transform:translateX(3px);}',
            /* narrow phones: offer + codes stack onto two centered lines */
            '@media(max-width:600px){#promo-banner{font-size:0.72rem;gap:2px 10px;padding:8px 10px;}',
            '#promo-banner .pb-long{display:none;}}',
            '@media(max-width:400px){#promo-banner{font-size:0.70rem;}}',
            '@media(max-width:340px){#promo-banner{font-size:0.66rem;}}'
        ].join('');
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        var a = document.createElement('a');
        a.id = 'promo-banner';
        a.href = HREF;
        a.setAttribute('aria-label', 'Buy 4 get 2 free on select research peptides — shop now');
        a.innerHTML =
            '<span class="pb-offer">🔥 <strong>Buy 4, Get 2 Free</strong>' +
            '<span class="pb-long"> on select GH peptides</span></span>' +
            '<span class="pb-deal"><span class="pb-codes">' + CODES + '</span> ' +
            '<span class="pb-arrow">→</span></span>';
        document.body.insertBefore(a, document.body.firstChild);

        // Sit the banner directly BELOW the (fixed) nav, then push in-flow content
        // down by the banner's height so nothing is hidden. Base padding captured
        // once so resizes don't compound.
        var basePad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
        function layout() {
            var navH = Math.round(header.getBoundingClientRect().height);
            var bH = Math.round(a.getBoundingClientRect().height);
            a.style.top = navH + 'px';                              // just below the nav
            document.body.style.paddingTop = (basePad + bH) + 'px'; // clear the banner
        }
        layout();
        window.addEventListener('resize', layout);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
