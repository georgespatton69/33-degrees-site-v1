/**
 * 33 Degrees Search
 * Overlay search with autofill suggestions for products and articles
 */
(function() {
    'use strict';

    // All searchable items — products and articles
    const items = [
        // Products
        { name: 'BPC-157', type: 'Product', category: 'Tissue Biology', url: 'products/bpc-157.html', keywords: 'tissue repair gut healing gastric' },
        { name: 'TB-500', type: 'Product', category: 'Tissue Biology', url: 'products/tb-500.html', keywords: 'regeneration thymosin cell migration' },
        { name: 'Wolverine Stack', type: 'Product', category: 'Tissue Biology', url: 'products/wolverine-stack.html', keywords: 'bpc tb combo bundle dual pathway' },
        { name: 'GHK-CU', type: 'Product', category: 'Tissue Biology', url: 'products/ghk-cu.html', keywords: 'copper peptide collagen skin wound hair' },
        { name: 'NAD+', type: 'Product', category: 'Cellular Aging', url: 'products/nad-plus.html', keywords: 'nad nicotinamide cellular energy dna repair aging' },
        { name: 'MOTS-c', type: 'Product', category: 'Cellular Energy', url: 'products/mots-c.html', keywords: 'mitochondrial endurance exercise metabolic' },
        { name: 'Epithalon', type: 'Product', category: 'Cellular Aging', url: 'products/epithalon.html', keywords: 'telomere telomerase longevity aging pineal' },
        { name: 'SS-31', type: 'Product', category: 'Cellular Aging', url: 'products/ss-31.html', keywords: 'mitochondria elamipretide oxidative stress cardiolipin' },
        { name: 'Retatrutide', type: 'Product', category: 'Metabolic Science', url: 'products/retatrutide.html', keywords: 'glp-1 gip glucagon triple agonist weight metabolic appetite' },
        { name: 'Tesamorelin', type: 'Product', category: 'Metabolic Science', url: 'products/tesamorelin.html', keywords: 'growth hormone ghrh visceral fat' },
        { name: 'AOD 9604', type: 'Product', category: 'Metabolic Science', url: 'products/aod-9604.html', keywords: 'hgh fat burning fragment lipolysis' },
        { name: 'Ipamorelin', type: 'Product', category: 'Cellular Energy', url: 'products/ipamorelin.html', keywords: 'growth hormone secretagogue gh selective cortisol' },
        { name: 'Glow Blend', type: 'Product', category: 'Immunology & Recovery', url: 'products/glow-blend.html', keywords: 'bpc tb ghk collagen skin bundle' },
        { name: 'KPV', type: 'Product', category: 'Immunology & Recovery', url: 'products/kpv.html', keywords: 'anti-inflammatory immune nf-kb alpha-msh' },
        { name: 'Klow', type: 'Product', category: 'Immunology & Recovery', url: 'products/klow.html', keywords: 'quad peptide bpc tb kpv ghk bundle' },
        { name: 'CJC-1295 + Ipamorelin', type: 'Product', category: 'Cellular Energy', url: 'products/cjc-ipamorelin.html', keywords: 'growth hormone dual secretagogue ghrh' },
        { name: 'Bacteriostatic Water', type: 'Product', category: 'Accessories', url: 'products/bac-water.html', keywords: 'bac water reconstitution solvent sterile' },
        // Articles
        { name: 'What Are Peptides?', type: 'Article', category: 'Research', url: 'blog/what-are-peptides.html', keywords: 'peptide basics fundamentals amino acids' },
        { name: 'Peptides in 2026', type: 'Article', category: 'Research', url: 'blog/peptides-in-2026.html', keywords: 'industry regulatory fda clinical' },
        { name: 'Are Peptides Safe?', type: 'Article', category: 'Research', url: 'blog/are-peptides-safe.html', keywords: 'safety side effects fda compliance' },
        { name: 'Tissue Response & Repair', type: 'Article', category: 'Research', url: 'blog/tissue-response-guide.html', keywords: 'bpc tb ghk tissue repair cell migration' },
        { name: 'Growth Hormone Peptides', type: 'Article', category: 'Research', url: 'blog/gh-signaling-guide.html', keywords: 'ipamorelin tesamorelin growth hormone gh' },
        { name: 'Metabolic Peptides', type: 'Article', category: 'Research', url: 'blog/endocrine-pathways-guide.html', keywords: 'retatrutide tesamorelin aod metabolic' },
        { name: 'Mitochondrial Function', type: 'Article', category: 'Research', url: 'blog/mitochondrial-function-guide.html', keywords: 'nad ss-31 mots-c epithalon aging longevity' },
        { name: 'Collagen & Skin', type: 'Article', category: 'Research', url: 'blog/collagen-synthesis-guide.html', keywords: 'ghk-cu glow blend collagen skin' },
        { name: 'Immune Signaling', type: 'Article', category: 'Research', url: 'blog/immune-signaling-guide.html', keywords: 'bpc tb immune inflammation recovery' },
        // Pages
        { name: 'Lab Testing Results', type: 'Page', category: '', url: 'lab-testing.html', keywords: 'lab testing coa certificate purity batch' },
        { name: 'Research Library', type: 'Page', category: '', url: 'research.html', keywords: 'research peptides learn' },
        { name: 'All Compounds', type: 'Page', category: '', url: 'compounds.html', keywords: 'products compounds catalog all shop' },
    ];

    // Detect if we're in a subdirectory
    function getBasePath() {
        var path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/blog/')) return '../';
        return '';
    }

    function search(query) {
        if (!query || query.length < 2) return [];
        var q = query.toLowerCase();
        return items.filter(function(item) {
            return item.name.toLowerCase().includes(q) ||
                   item.keywords.toLowerCase().includes(q) ||
                   item.category.toLowerCase().includes(q);
        }).slice(0, 8);
    }

    function createOverlay() {
        if (document.getElementById('search-overlay')) return;

        var overlay = document.createElement('div');
        overlay.id = 'search-overlay';
        overlay.innerHTML = '<div class="search-modal">' +
            '<div class="search-header">' +
                '<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
                '<input type="text" id="search-input" placeholder="Search compounds, articles..." autocomplete="off">' +
                '<button class="search-close" id="search-close">&times;</button>' +
            '</div>' +
            '<div class="search-results" id="search-results"></div>' +
        '</div>';

        document.body.appendChild(overlay);

        var input = document.getElementById('search-input');
        var results = document.getElementById('search-results');
        var base = getBasePath();

        input.addEventListener('input', function() {
            var matches = search(this.value);
            if (matches.length === 0 && this.value.length >= 2) {
                results.innerHTML = '<div class="search-empty">No results found</div>';
            } else if (matches.length === 0) {
                results.innerHTML = '';
            } else {
                results.innerHTML = matches.map(function(item) {
                    return '<a href="' + base + item.url + '" class="search-result">' +
                        '<div class="search-result-info">' +
                            '<span class="search-result-name">' + item.name + '</span>' +
                            '<span class="search-result-meta">' + item.type + (item.category ? ' &middot; ' + item.category : '') + '</span>' +
                        '</div>' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
                    '</a>';
                }).join('');
            }
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeSearch();
        });

        document.getElementById('search-close').addEventListener('click', closeSearch);

        // Focus input
        setTimeout(function() { input.focus(); }, 100);
    }

    function closeSearch() {
        var overlay = document.getElementById('search-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(function() { overlay.remove(); }, 200);
        }
        document.body.style.overflow = '';
    }

    function openSearch() {
        createOverlay();
        document.getElementById('search-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Bind to search icons
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[aria-label="Search"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openSearch();
            });
        });

        // Keyboard shortcut: Cmd/Ctrl + K
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape') closeSearch();
        });
    });
})();
