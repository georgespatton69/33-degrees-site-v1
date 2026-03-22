// ========== RESEARCH PAGE JS ==========

(function() {
    'use strict';

    // ---------- Category Data (our 13 products only) ----------
    const categoryData = {
        recovery: {
            desc: "These peptides modulate tissue response signaling. Research investigates cell migration patterns, inflammatory response pathways, and regenerative signaling in muscle, tendon, ligament, and gastrointestinal tissue models.",
            subtitle: "Primary Compounds in Recovery Research",
            peptides: [
                {
                    name: "BPC-157",
                    tag: "Primary Compound",
                    desc: "Derived from a gastric protein. Research investigates mechanisms in muscle, tendon, and ligament pathways, gastrointestinal function, and vascular signaling. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "TB-500",
                    tag: "Systemic Recovery",
                    desc: "Modulates cell migration signaling across tissue systems. Investigated for tissue regeneration mechanisms. Often studied in combination with BPC-157. <a href=\"https://pubmed.ncbi.nlm.nih.gov/10469335/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "Wolverine Stack",
                    tag: "Best Combo",
                    desc: "BPC-157 + TB-500 combined for research on synergistic tissue signaling mechanisms. Studied for comprehensive tissue regeneration pathways. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">BPC-157</a> <a href=\"https://pubmed.ncbi.nlm.nih.gov/10469335/\" target=\"_blank\" class=\"citation-link\">TB-500</a>"
                },
                {
                    name: "GHK-Cu",
                    tag: "Wound Repair",
                    desc: "Copper peptide with published data on wound closure mechanisms in research models. Influences collagen production signaling and tissue remodeling pathways. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/\" target=\"_blank\" class=\"citation-link\">PMC</a>"
                }
            ]
        },
        longevity: {
            desc: "These peptides modulate cellular aging pathways. mitochondrial function, NAD+ metabolism, telomere dynamics, and oxidative stress responses. Research investigates cellular repair and protective mechanisms in experimental models.",
            subtitle: "Primary Compounds in Longevity Research",
            peptides: [
                {
                    name: "NAD+",
                    tag: "Cellular Energy",
                    desc: "NAD+ levels decline approximately 30% between ages 45–60. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC7442590/\" target=\"_blank\" class=\"citation-link\">PMC Review</a> Research investigates NAD+ effects on mitochondrial function, DNA repair signaling, and cellular energy pathways."
                },
                {
                    name: "Epithalon",
                    tag: "Telomere Support",
                    desc: "Investigated for effects on telomere dynamics. the protective chromosome structures relevant to cellular aging models. One of the most studied peptides in longevity research. <a href=\"https://pubmed.ncbi.nlm.nih.gov/12937682/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "SS-31",
                    tag: "Mitochondrial",
                    desc: "Targets the inner mitochondrial membrane. Research investigates energy production mechanisms at the cellular level and oxidative stress response. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC11816484/\" target=\"_blank\" class=\"citation-link\">PMC</a>"
                },
                {
                    name: "MOTS-c",
                    tag: "Metabolic Aging",
                    desc: "A mitochondrial-derived peptide that influences metabolic efficiency and exercise response in research models. Investigated at the cellular level for metabolic pathway mechanisms. <a href=\"https://pubmed.ncbi.nlm.nih.gov/25738459/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                }
            ]
        },
        weight: {
            desc: "These peptides modulate metabolic pathways. appetite signaling, lipid metabolism, visceral adiposity mechanisms, and metabolic efficiency. Including GLP-1 receptor agonists and lipid metabolism-targeted compounds.",
            subtitle: "Primary Compounds in Weight Management Research",
            peptides: [
                {
                    name: "Retatrutide",
                    tag: "Most Effective",
                    desc: "A potent GLP-1 receptor agonist. Phase 3 trials documented 23.7% body weight changes in study participants. <a href=\"https://clinicaltrials.gov/study/NCT05931367\" target=\"_blank\" class=\"citation-link\">ClinicalTrials.gov</a>"
                },
                {
                    name: "Tesamorelin",
                    tag: "Visceral Fat",
                    desc: "Investigated for mechanisms in visceral adiposity. A 404-patient clinical trial documented 18% visceral fat changes. <a href=\"https://pubmed.ncbi.nlm.nih.gov/20101189/\" target=\"_blank\" class=\"citation-link\">PubMed</a> Influences growth hormone signaling."
                },
                {
                    name: "AOD 9604",
                    tag: "Fat Metabolism",
                    desc: "Derived from growth hormone, investigated for mechanisms in lipolysis and fat metabolism. Research examines lipid utilization without significant glucose homeostasis effects. <a href=\"https://pubmed.ncbi.nlm.nih.gov/11713213/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                }
            ]
        },
        skin: {
            desc: "These peptides influence collagen synthesis, wound healing signaling, and tissue repair mechanisms in cellular and tissue models.",
            subtitle: "Primary Compounds in Skin & Rejuvenation Research",
            peptides: [
                {
                    name: "GHK-Cu",
                    tag: "Collagen & Anti-Aging",
                    desc: "Copper peptide with collagen synthesis activity. Influences fibroblast signaling, hair follicle signaling, and wound repair mechanisms. GHK-Cu plasma levels decline from 200 ng/mL at age 20 to 80 ng/mL by age 60. <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC4508379/\" target=\"_blank\" class=\"citation-link\">PMC</a>"
                },
                {
                    name: "Glow Blend",
                    tag: "Comprehensive Blend",
                    desc: "Research blend of BPC-157 + TB-500 + GHK-Cu (50mg). Combines tissue signaling peptides with collagen synthesis-influencing copper peptide for multi-pathway tissue research. <a href=\"https://pubmed.ncbi.nlm.nih.gov/30915550/\" target=\"_blank\" class=\"citation-link\">BPC-157</a> <a href=\"https://pmc.ncbi.nlm.nih.gov/articles/PMC4508379/\" target=\"_blank\" class=\"citation-link\">GHK-Cu</a>"
                }
            ]
        },
        performance: {
            desc: "These peptides modulate growth hormone signaling, influence recovery mechanisms, and affect metabolic efficiency in research models.",
            subtitle: "Primary Compounds in Performance Research",
            peptides: [
                {
                    name: "Ipamorelin",
                    tag: "GH Release",
                    desc: "Selectively influences growth hormone signaling without significant cortisol elevation. Research examines effects on muscle protein synthesis, recovery, sleep-related signaling, and lipid metabolism. <a href=\"https://pubmed.ncbi.nlm.nih.gov/9849822/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                },
                {
                    name: "MOTS-c",
                    tag: "Endurance",
                    desc: "Investigated at the mitochondrial level for mechanisms in endurance, metabolic efficiency, and fatigue response. A significant mitochondrial function modulator in research. <a href=\"https://pubmed.ncbi.nlm.nih.gov/25738459/\" target=\"_blank\" class=\"citation-link\">PubMed</a>"
                }
            ]
        }
    };

    // ---------- Category Display Names ----------
    const categoryNames = {
        recovery: 'Recovery & Repair',
        longevity: 'Longevity & Anti-Aging',
        weight: 'Weight Management',
        skin: 'Skin & Rejuvenation',
        performance: 'Performance & Vitality'
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

    let showLearnMore = false;

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
                ${showLearnMore ? '<a href="compounds.html" class="btn-learn-more">Learn More</a>' : ''}
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
                ${articlesHTML}
            </div>
        `;

        // Re-bind the dynamic button
        const dynamicBtn = document.getElementById('btn-what-peptides-dynamic');
        if (dynamicBtn) {
            dynamicBtn.addEventListener('click', () => switchView(viewSelector, viewPeptides));
        }
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
        showLearnMore = false;
        switchView(view2026, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        
        renderPlaceholder();
    });

    btnSafety.addEventListener('click', () => switchView(view2026, viewSafety));
    backTo2026.addEventListener('click', () => switchView(viewSafety, view2026));
    backToSelector3.addEventListener('click', () => {
        showLearnMore = false;
        switchView(viewSafety, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        
        renderPlaceholder();
    });

    // Explore More. go back to selector with their category pre-selected and Learn More buttons
    btnExploreMore.addEventListener('click', () => {
        showLearnMore = true;
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
