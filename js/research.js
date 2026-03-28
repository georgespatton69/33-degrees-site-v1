// ========== RESEARCH PAGE JS ==========

(function() {
    'use strict';

    // ---------- Category Data (23 SKU product lineup) ----------
    const categoryData = {
        recovery: {
            desc: "These peptides modulate tissue response signaling. Research investigates cell migration patterns, inflammatory response pathways, and regenerative signaling in muscle, tendon, ligament, and gastrointestinal tissue models.",
            subtitle: "Primary Compounds in Tissue Biology Research",
            peptides: [
                {
                    name: "BPC-157",
                    slug: "bpc-157",
                    tag: "Primary Compound",
                    desc: "Derived from a gastric protein. Research investigates mechanisms in muscle, tendon, and ligament pathways, gastrointestinal function, and vascular signaling. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "TB-500",
                    slug: "tb-500",
                    tag: "Systemic Recovery",
                    desc: "Modulates cell migration signaling across tissue systems. Investigated for tissue regeneration mechanisms. Often studied in combination with BPC-157. <a href=\"https://pubmed.ncbi.nlm.nih.gov/10469335/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "Wolverine Stack",
                    slug: "wolverine-stack",
                    tag: "Best Combo",
                    desc: "BPC-157 + TB-500 combined for research on synergistic tissue signaling mechanisms. Studied for comprehensive tissue regeneration pathways. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">BPC-157</a> <a href=\"https://pubmed.ncbi.nlm.nih.gov/10469335/\" target=\"_blank\" class=\"citation-link\">TB-500</a>"
                },
                {
                    name: "Klow",
                    slug: "klow",
                    tag: "Super Blend",
                    desc: "BPC-157 10mg + TB-500 10mg + KPV 10mg + GHK-CU 50mg (80mg total). A comprehensive multi-pathway recovery blend combining tissue repair, anti-inflammatory, and collagen signaling compounds. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">BPC-157</a> <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/\" target=\"_blank\" class=\"citation-link\">GHK-Cu</a>"
                }
            ]
        },
        longevity: {
            desc: "These peptides modulate cellular aging pathways — collagen decline, telomere dynamics, gene expression changes, and age-related tissue remodeling. Research investigates protective and restorative mechanisms in experimental models.",
            subtitle: "Primary Compounds in Cellular Aging Research",
            peptides: [
                {
                    name: "Epithalon",
                    slug: "epithalon",
                    tag: "Telomere Support",
                    desc: "Investigated for effects on telomere dynamics — the protective chromosome structures relevant to cellular aging models. One of the most studied peptides in longevity research. <a href=\"https://pubmed.ncbi.nlm.nih.gov/12937682/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "GHK-Cu",
                    slug: "ghk-cu",
                    tag: "Collagen & Aging",
                    desc: "Copper peptide researched for reversing age-related decline in collagen synthesis, wound healing, and gene expression. GHK-Cu plasma levels decline from 200 ng/mL at age 20 to 80 ng/mL by age 60. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC4508379/\" target=\"_blank\" class=\"citation-link\">PMC</a>"
                },
                {
                    name: "Glow Blend",
                    slug: "glow-blend",
                    tag: "Age-Defense Blend",
                    desc: "BPC-157 10mg + TB-500 10mg + GHK-Cu 50mg (70mg total). Combines tissue signaling peptides with collagen synthesis-influencing copper peptide for multi-pathway aging research. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">BPC-157</a> <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC4508379/\" target=\"_blank\" class=\"citation-link\">GHK-Cu</a>"
                }
            ]
        },
        weight: {
            desc: "These peptides modulate metabolic pathways — appetite signaling, lipid metabolism, visceral adiposity mechanisms, and metabolic efficiency. Including GLP-1 receptor agonists and lipid metabolism-targeted compounds.",
            subtitle: "Primary Compounds in Metabolic Science Research",
            peptides: [
                {
                    name: "Retatrutide",
                    slug: "retatrutide",
                    tag: "Tri-Agonist",
                    desc: "The first tri-agonist peptide targeting GLP-1, GIP, and glucagon receptors simultaneously for multi-pathway metabolic research. <a href=\"https://clinicaltrials.gov/study/NCT05931367\" target=\"_blank\" class=\"citation-link\">ClinicalTrials.gov</a>"
                },
                {
                    name: "Tesamorelin",
                    slug: "tesamorelin",
                    tag: "Visceral Fat",
                    desc: "Investigated for mechanisms in visceral adiposity. A 404-patient clinical trial documented 18% visceral fat changes. <a href=\"https://pubmed.ncbi.nlm.nih.gov/20101189/\" target=\"_blank\" class=\"citation-link\">PubMed</a> Influences growth hormone signaling."
                },
                {
                    name: "AOD 9604",
                    slug: "aod-9604",
                    tag: "Fat Metabolism",
                    desc: "Derived from growth hormone, investigated for mechanisms in lipolysis and fat metabolism. Research examines lipid utilization without significant glucose homeostasis effects. <a href=\"https://pubmed.ncbi.nlm.nih.gov/11713213/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                }
            ]
        },
        skin: {
            desc: "These peptides modulate immune cell activity, inflammatory response, and growth hormone signaling pathways. Research investigates recovery mechanisms, immune modulation, and adaptive immunity in experimental models.",
            subtitle: "Primary Compounds in Immunology & Recovery Research",
            peptides: [
                {
                    name: "KPV",
                    slug: "kpv",
                    tag: "Anti-Inflammatory",
                    desc: "A tripeptide derived from alpha-MSH with potent anti-inflammatory properties. Research investigates immune modulation, gut barrier integrity, and inflammatory signaling pathways. <a href=\"https://pubmed.ncbi.nlm.nih.gov/15837222/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "CJC-1295 w/o DAC + Ipamorelin",
                    slug: "cjc-1295",
                    tag: "GH Signaling Blend",
                    desc: "CJC-1295 5mg + Ipamorelin 5mg (10mg total). Combines two growth hormone secretagogues for synergistic GH pathway research. CJC-1295 extends GH release duration while Ipamorelin provides selective GH stimulation. <a href=\"https://pubmed.ncbi.nlm.nih.gov/9849822/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "Ipamorelin",
                    slug: "ipamorelin",
                    tag: "GH Release",
                    desc: "Selectively influences growth hormone signaling without significant cortisol elevation. Research examines effects on muscle protein synthesis, recovery, sleep-related signaling, and lipid metabolism. <a href=\"https://pubmed.ncbi.nlm.nih.gov/9849822/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                }
            ]
        },
        performance: {
            desc: "These peptides modulate mitochondrial function, cellular energy production, and oxidative stress responses. Research investigates NAD+ metabolism, mitochondrial membrane integrity, and metabolic efficiency in experimental models.",
            subtitle: "Primary Compounds in Cellular Energy Research",
            peptides: [
                {
                    name: "MOTS-c",
                    slug: "mots-c",
                    tag: "Mitochondrial Peptide",
                    desc: "A mitochondrial-derived peptide that influences metabolic efficiency and exercise response in research models. Investigated for endurance, cellular energy production, and fatigue response mechanisms. <a href=\"https://pubmed.ncbi.nlm.nih.gov/25738459/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "SS-31",
                    slug: "ss-31",
                    tag: "Cellular Energy",
                    desc: "Targets the inner mitochondrial membrane. Research investigates energy production mechanisms at the cellular level and oxidative stress response. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC11816484/\" target=\"_blank\" class=\"citation-link\">PMC</a>"
                },
                {
                    name: "NAD+",
                    slug: "nad-plus",
                    tag: "Cellular Fuel",
                    desc: "NAD+ levels decline approximately 30% between ages 45–60. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC7442590/\" target=\"_blank\" class=\"citation-link\">PMC Review</a> Research investigates NAD+ effects on mitochondrial function, DNA repair signaling, and cellular energy pathways."
                }
            ]
        }
    };

    // ---------- Category Display Names ----------
    const categoryNames = {
        recovery: 'Tissue Biology',
        longevity: 'Cellular Aging',
        weight: 'Metabolic Science',
        skin: 'Immunology & Recovery',
        performance: 'Cellular Energy'
    };

    // ---------- DOM Elements ----------
    const pills = document.querySelectorAll('.cat-pill');
    const resultArea = document.getElementById('category-result');
    const viewSelector = document.getElementById('view-selector');
    const viewPeptides = document.getElementById('view-peptides');
    const view2026 = document.getElementById('view-2026');
    // btnWhatPeptides now rendered dynamically in renderCategory
    const btnPeptides2026 = document.getElementById('btn-peptides-2026');
    const backToSelector = document.getElementById('back-to-selector');
    const backToPeptides = document.getElementById('back-to-peptides');
    const backToSelector2 = document.getElementById('back-to-selector-2');
    const viewSafety = document.getElementById('view-safety');
    const btnSafety = document.getElementById('btn-safety');
    const backTo2026 = document.getElementById('back-to-2026');
    const backToSelector3 = document.getElementById('back-to-selector-3');
    const btnExploreMore = document.getElementById('btn-explore-more');

    // ---------- Category Selection ----------
    let selectedCategory = null;

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const cat = pill.dataset.category;

            // Deselect if same
            if (selectedCategory === cat) {
                pill.classList.remove('selected');
                selectedCategory = null;
                fadeResult(renderPlaceholder);
                
                return;
            }

            // Deselect previous
            pills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedCategory = cat;

            // Show What Are Peptides button
            

            // Update Browse Compound Library button with category name
            btnExploreMore.textContent = (categoryNames[cat] || cat) + ' Compound Library';

            // Fade and render
            fadeResult(() => renderCategory(cat));
        });
    });

    function fadeResult(callback) {
        resultArea.classList.add('fading');
        setTimeout(() => {
            callback();
            resultArea.classList.remove('fading');
        }, 400);
    }

    function renderPlaceholder() {
        resultArea.innerHTML = `
            <div class="result-placeholder">
                <p>Select a category above to explore peptides tailored to your goals</p>
            </div>
        `;
    }


    // Map categories to relevant blog articles
    const categoryArticles = {
        recovery: [
            { tag: 'Tissue Biology', title: 'Recovery Peptides Explained: BPC-157, TB-500 & GHK-Cu', url: 'blog/tissue-response-guide.html', desc: 'Plain-language guide to how recovery peptides work, with visual diagrams and research applications.' },
            { tag: 'Immunology', title: 'Immune & Recovery Peptides Explained: BPC-157 & TB-500', url: 'blog/immune-signaling-guide.html', desc: 'How BPC-157 and TB-500 modulate immune signaling and the science behind the Wolverine Stack.' }
        ],
        longevity: [
            { tag: 'Cell Biology', title: 'Longevity Peptides Explained: NAD+, SS-31, MOTS-c & Epithalon', url: 'blog/mitochondrial-function-guide.html', desc: 'A guide to mitochondrial peptides, cellular energy, and what researchers study them for in aging science.' }
        ],
        weight: [
            { tag: 'Endocrinology', title: 'Metabolic Peptides Explained: Retatrutide, Tesamorelin & AOD 9604', url: 'blog/endocrine-pathways-guide.html', desc: 'How GLP-1 agonists and metabolic peptides work, Phase 3 trial data, and common research applications.' }
        ],
        skin: [
            { tag: 'Dermatology', title: 'Collagen & Skin Peptides Explained: GHK-Cu & Glow Blend', url: 'blog/collagen-synthesis-guide.html', desc: 'How copper peptides activate collagen production and the science behind multi-peptide blends.' }
        ],
        performance: [
            { tag: 'Endocrinology', title: 'Growth Hormone Peptides Explained: Ipamorelin & Tesamorelin', url: 'blog/gh-signaling-guide.html', desc: 'How GH secretagogues work, what sets Ipamorelin apart, and common research protocols.' }
        ]
    };

    function renderCategory(cat) {
        const data = categoryData[cat];
        if (!data) return;

        let peptidesHTML = data.peptides.map(p => `
            <div class="result-peptide-card">
                <span class="peptide-tag">${p.tag}</span>
                <h4>${p.name}</h4>
                <p>${p.desc}</p>
                <a href="products/${p.slug}.html" class="btn-learn-more">Learn More</a>
            </div>
        `).join('');

        // Build related articles HTML
        const articles = categoryArticles[cat] || [];
        let articlesHTML = '';
        if (articles.length > 0) {
            articlesHTML = `
                <h3 class="result-subtitle" style="margin-top: 2.5rem;">Related Research Articles</h3>
                <div class="result-articles">
                    ${articles.map(a => `
                        <a href="${a.url}" class="result-article-card">
                            <span class="peptide-tag">${a.tag}</span>
                            <h4>${a.title}</h4>
                            <p>${a.desc}</p>
                            <span class="result-article-cta">Read Guide →</span>
                        </a>
                    `).join('')}
                </div>
            `;
        }

        resultArea.innerHTML = `
            <div class="result-content">
                <p class="result-desc">${data.desc}</p>
                <button class="btn-what-are-peptides" id="btn-what-peptides-dynamic" style="margin-bottom: 2rem;">What Are Peptides?</button>
                <h3 class="result-subtitle">${data.subtitle}</h3>
                <div class="result-peptides">
                    ${peptidesHTML}
                </div>
                <button class="btn-what-are-peptides" id="btn-what-peptides-bottom" style="margin-top: 2rem; margin-bottom: 2rem;">What Are Peptides?</button>
                ${articlesHTML}
            </div>
        `;

        // Re-bind both dynamic buttons
        document.getElementById('btn-what-peptides-dynamic')?.addEventListener('click', () => switchView(viewSelector, viewPeptides));
        document.getElementById('btn-what-peptides-bottom')?.addEventListener('click', () => switchView(viewSelector, viewPeptides));
    }

    // ---------- View Transitions ----------
    function switchView(fromView, toView) {
        fromView.classList.add('fading-out');
        setTimeout(() => {
            fromView.classList.remove('active', 'fading-out');
            toView.classList.add('fading-in');
            // Force reflow
            toView.offsetHeight;
            toView.classList.add('active');
            toView.classList.remove('fading-in');
            // Scroll to top of section
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
    }

    
    btnPeptides2026.addEventListener('click', () => switchView(viewPeptides, view2026));
    backToSelector.addEventListener('click', () => switchView(viewPeptides, viewSelector));
    backToPeptides.addEventListener('click', () => switchView(view2026, viewPeptides));
    backToSelector2.addEventListener('click', () => {
        switchView(view2026, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        
        renderPlaceholder();
    });

    btnSafety.addEventListener('click', () => switchView(view2026, viewSafety));
    backTo2026.addEventListener('click', () => switchView(viewSafety, view2026));
    backToSelector3.addEventListener('click', () => {
        switchView(viewSafety, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        
        renderPlaceholder();
    });

    // Explore More. go back to selector with their category pre-selected and Learn More buttons
    btnExploreMore.addEventListener('click', () => {
        switchView(viewSafety, viewSelector);
        if (selectedCategory) {
            pills.forEach(p => {
                if (p.dataset.category === selectedCategory) {
                    p.classList.add('selected');
                } else {
                    p.classList.remove('selected');
                }
            });
            
            renderCategory(selectedCategory);
            // Scroll to the result subtitle after transition completes
            setTimeout(() => {
                const subtitle = document.querySelector('.result-subtitle');
                if (subtitle) {
                    const navHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const subtitleTop = subtitle.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                    window.scrollTo({ top: subtitleTop, behavior: 'smooth' });
                }
            }, 600);
        }
    });

    // ---------- Mobile Menu ----------
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
        });
    }

})();
