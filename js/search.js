/**
 * 33 Degrees Search
 * Overlay search with autofill suggestions for products and articles
 */
(function() {
    'use strict';

    // All searchable items — products and articles
    const items = [
        // Products
        { name: 'BPC-157', type: 'Product', category: 'Tissue Biology', url: '/products/bpc-157/', keywords: 'tissue repair gastric pentadecapeptide research' },
        { name: 'TB-500', type: 'Product', category: 'Tissue Biology', url: '/products/tb-500/', keywords: 'regeneration thymosin cell migration' },
        { name: 'BPC-157 + TB-500 Bundle', type: 'Product', category: 'Tissue Biology', url: '/products/wolverine-stack/', keywords: 'bpc tb combo bundle dual pathway' },
        { name: 'GHK-CU', type: 'Product', category: 'Tissue Biology', url: '/products/ghk-cu/', keywords: 'copper peptide collagen skin wound hair' },
        { name: 'NAD+', type: 'Product', category: 'Cellular Aging', url: '/products/nad-plus/', keywords: 'nad nicotinamide cellular energy dna repair aging' },
        { name: 'MOTS-c', type: 'Product', category: 'Cellular Energy', url: '/products/mots-c/', keywords: 'mitochondrial endurance exercise metabolic' },
        { name: 'Epithalon', type: 'Product', category: 'Cellular Aging', url: '/products/epithalon/', keywords: 'telomere telomerase longevity aging pineal' },
        { name: 'SS-31', type: 'Product', category: 'Cellular Aging', url: '/products/ss-31/', keywords: 'mitochondria elamipretide oxidative stress cardiolipin' },
        { name: 'Gold 33', type: 'Product', category: 'Metabolic Science', url: '/products/gold-33/', keywords: 'gold 33 retatrutide tri-agonist triple receptor metabolic appetite incretin glp-1 gip glucagon' },
        { name: 'Tesamorelin', type: 'Product', category: 'Metabolic Science', url: '/products/tesamorelin/', keywords: 'growth hormone ghrh visceral fat' },
        { name: 'AOD 9604', type: 'Product', category: 'Metabolic Science', url: '/products/aod-9604/', keywords: 'hgh fragment 176-191 lipolysis aod-9604' },
        { name: 'Ipamorelin', type: 'Product', category: 'Cellular Energy', url: '/products/ipamorelin/', keywords: 'growth hormone secretagogue gh selective cortisol' },
        { name: 'Glow Blend', type: 'Product', category: 'Immune Signaling', url: '/products/glow-blend/', keywords: 'bpc tb ghk collagen skin bundle' },
        { name: 'KPV', type: 'Product', category: 'Immune Signaling', url: '/products/kpv/', keywords: 'alpha-msh nf-kb immune inflammatory tripeptide' },
        { name: 'Klow', type: 'Product', category: 'Immune Signaling', url: '/products/klow/', keywords: 'quad peptide bpc tb kpv ghk bundle' },
        { name: 'CJC-1295 + Ipamorelin', type: 'Product', category: 'Cellular Energy', url: '/products/cjc-ipamorelin/', keywords: 'growth hormone dual secretagogue ghrh' },
        { name: 'Bacteriostatic Water', type: 'Product', category: 'Accessories', url: '/products/bac-water/', keywords: 'bac water reconstitution solvent sterile' },
        // New Releases
        { name: '5-Amino-1MQ', type: 'Product', category: 'New Releases', url: '/products/5-amino-1mq/', keywords: 'nnmt inhibitor nad salvage methyl donor adipocyte 5-amino' },
        { name: 'SLU-PP-332', type: 'Product', category: 'New Releases', url: '/products/slu-pp-332/', keywords: 'err agonist exercise mimetic mitochondrial biogenesis oxidative' },
        { name: 'Sermorelin', type: 'Product', category: 'New Releases', url: '/products/sermorelin/', keywords: 'ghrh analog growth hormone pulsatile pituitary somatotroph' },
        { name: 'DSIP', type: 'Product', category: 'New Releases', url: '/products/dsip/', keywords: 'delta sleep inducing peptide slow wave hpa neuropeptide' },
        { name: 'PT-141', type: 'Product', category: 'New Releases', url: '/products/pt-141/', keywords: 'bremelanotide melanocortin mc4r cyclic peptide hypothalamic' },
        { name: 'Kisspeptin', type: 'Product', category: 'New Releases', url: '/products/kisspeptin/', keywords: 'kiss1 gnrh hpg hypothalamic gpr54 reproductive' },
        { name: 'Selank', type: 'Product', category: 'New Releases', url: '/products/selank/', keywords: 'tuftsin analog gabaergic intranasal anxiolytic russian peptide' },
        { name: 'Semax', type: 'Product', category: 'New Releases', url: '/products/semax/', keywords: 'acth nootropic bdnf ngf nootropic russian intranasal' },
        { name: 'MT-2', type: 'Product', category: 'New Releases', url: '/products/mt-2/', keywords: 'melanotan ii melanocortin mc1r pigmentation eumelanin' },
        { name: 'Methylene Blue', type: 'Product', category: 'New Releases', url: '/products/methylene-blue/', keywords: 'methylene blue mitochondrial electron carrier nootropic phenothiazine cytochrome capsule' },
        { name: 'Tesofensine', type: 'Product', category: 'New Releases', url: '/products/tesofensine/', keywords: 'tesofensine monoamine reuptake dat net sert dopamine norepinephrine appetite obesity capsule' },
        { name: 'LIPO-C Blend', type: 'Product', category: 'New Releases', url: '/products/lipo-c/', keywords: 'lipo-c lipotropic l-carnitine methionine inositol choline b12 b6 nadh blend vial metabolic mitochondrial' },
        { name: 'Glutathione', type: 'Product', category: 'Cellular Aging', url: '/products/glutathione/', keywords: 'glutathione tripeptide antioxidant redox oxidative detox gsh glutamate cysteine glycine' },
        { name: 'Pinealon', type: 'Product', category: 'Neuro & Cognitive', url: '/products/pinealon/', keywords: 'pinealon peptide bioregulator neuronal glu-asp-arg neuro cognitive khavinson' },
        { name: 'Thymosin Alpha-1', type: 'Product', category: 'Immune Signaling', url: '/products/thymosin-alpha-1/', keywords: 'thymosin alpha-1 immune t-cell prothymosin immunomodulatory tlr' },
        { name: 'Oxytocin', type: 'Product', category: 'Neuro & Cognitive', url: '/products/oxytocin/', keywords: 'oxytocin acetate neuropeptide receptor neuroendocrine nonapeptide oxtr social' },
        // Articles
        { name: 'What Are Peptides?', type: 'Article', category: 'Research', url: '/blog/what-are-peptides/', keywords: 'peptide basics fundamentals amino acids' },
        { name: 'Peptides in 2026', type: 'Article', category: 'Research', url: '/blog/peptides-in-2026/', keywords: 'industry regulatory fda clinical' },
        { name: 'How Peptide Safety Is Studied', type: 'Article', category: 'Research', url: '/blog/are-peptides-safe/', keywords: 'safety adverse events fda compounding immunogenicity research evaluation' },
        { name: 'Tissue Response Research', type: 'Article', category: 'Research', url: '/blog/tissue-response-guide/', keywords: 'bpc tb ghk tissue repair cell migration' },
        { name: 'GH Secretagogue Research', type: 'Article', category: 'Research', url: '/blog/gh-signaling-guide/', keywords: 'ipamorelin tesamorelin growth hormone gh' },
        { name: 'Endocrine Receptor Research', type: 'Article', category: 'Research', url: '/blog/endocrine-pathways-guide/', keywords: 'retatrutide tesamorelin aod metabolic' },
        { name: 'Mitochondrial Cofactor Research', type: 'Article', category: 'Research', url: '/blog/mitochondrial-function-guide/', keywords: 'nad ss-31 mots-c epithalon aging longevity' },
        { name: 'Collagen Synthesis Pathway', type: 'Article', category: 'Research', url: '/blog/collagen-synthesis-guide/', keywords: 'ghk-cu glow blend collagen skin' },
        { name: 'Immune Signaling', type: 'Article', category: 'Research', url: '/blog/immune-signaling-guide/', keywords: 'bpc tb immune inflammation recovery' },
        // Pages
        { name: 'Lab Testing Results', type: 'Page', category: '', url: '/lab-testing/', keywords: 'lab testing coa certificate purity batch' },
        { name: 'Research Library', type: 'Page', category: '', url: '/research/', keywords: 'research peptides learn' },
        { name: 'All Compounds', type: 'Page', category: '', url: '/compounds/', keywords: 'products compounds catalog all shop' },
    ];

    // All URLs are now absolute, no base path needed
    function getBasePath() {
        return '';
    }

    function search(query) {
        var q = (query || '').toLowerCase().trim();
        if (!q) return [];
        return items.map(function(item) {
            var name = item.name.toLowerCase();
            var score = 0;
            if (name === q) score = 100;
            else if (name.indexOf(q) === 0) score = 80;          // name starts with query
            else if (name.indexOf(q) !== -1) score = 60;         // name contains query
            else if (item.keywords.toLowerCase().indexOf(q) !== -1) score = 30;
            else if (item.category.toLowerCase().indexOf(q) !== -1) score = 20;
            return { item: item, score: score };
        }).filter(function(r) { return r.score > 0; })
          .sort(function(a, b) { return b.score - a.score; })
          .slice(0, 8)
          .map(function(r) { return r.item; });
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
            if (matches.length === 0 && this.value.trim().length >= 1) {
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
