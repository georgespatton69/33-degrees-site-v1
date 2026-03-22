// ========== RESEARCH PAGE JS ==========

(function() {
    'use strict';

    // ---------- Category Data (our 13 products only) ----------
    const categoryData = {
        recovery: {
            desc: "Recovery peptides work by accelerating the body's natural tissue repair processes. They signal cells to migrate to damaged areas, reduce inflammation, and promote regeneration of muscles, tendons, ligaments, and gut lining.",
            subtitle: "Most Popular for Recovery",
            peptides: [
                {
                    name: "BPC-157",
                    tag: "Most Popular",
                    desc: "Derived from a protein found in the stomach. Accelerates muscle, tendon, and ligament repair. Known for healing gut lining and improving blood flow to injured areas."
                },
                {
                    name: "TB-500",
                    tag: "Systemic Recovery",
                    desc: "Works throughout the entire body to promote cell migration and tissue regeneration. Speeds healing of muscles and soft tissue. Often combined with BPC-157."
                },
                {
                    name: "Wolverine Stack",
                    tag: "Best Combo",
                    desc: "BPC-157 + TB-500 combined for synergistic recovery. The most popular peptide stack for comprehensive tissue repair and injury recovery."
                },
                {
                    name: "GHK-Cu",
                    tag: "Wound Repair",
                    desc: "Copper peptide shown to accelerate wound closure by 40–50% in published studies. Supports skin healing, collagen production, and tissue remodeling."
                }
            ]
        },
        longevity: {
            desc: "Longevity peptides target the fundamental mechanisms of aging — mitochondrial decline, NAD+ depletion, telomere shortening, and cellular damage. They support the body's ability to repair, protect, and regenerate at the cellular level.",
            subtitle: "Most Popular for Longevity",
            peptides: [
                {
                    name: "NAD+",
                    tag: "Cellular Energy",
                    desc: "NAD+ levels decline approximately 30% between ages 45–60. Supplementation supports mitochondrial function, DNA repair, and cellular energy production."
                },
                {
                    name: "Epithalon",
                    tag: "Telomere Support",
                    desc: "Studied for its ability to support telomere length — the protective caps on chromosomes associated with biological aging. One of the most researched anti-aging peptides."
                },
                {
                    name: "SS-31",
                    tag: "Mitochondrial",
                    desc: "Targets the inner mitochondrial membrane directly. Supports energy production at the cellular level and helps protect against oxidative damage."
                },
                {
                    name: "MOTS-c",
                    tag: "Metabolic Aging",
                    desc: "A mitochondrial-derived peptide that improves metabolic efficiency and exercise capacity. Works at the cellular level to support metabolic health as you age."
                }
            ]
        },
        weight: {
            desc: "Weight management peptides work through multiple pathways — appetite regulation, fat metabolism, visceral fat reduction, and improved metabolic efficiency. From powerful GLP-1 receptor agonists to targeted fat-burning compounds.",
            subtitle: "Most Popular for Weight Management",
            peptides: [
                {
                    name: "Retatrutide",
                    tag: "Most Effective",
                    desc: "The most effective GLP-1 receptor agonist studied to date. Phase 3 trials published in the New England Journal of Medicine showed 23.7% body weight reduction."
                },
                {
                    name: "Tesamorelin",
                    tag: "Visceral Fat",
                    desc: "Specifically targets visceral (belly) fat. A 404-patient clinical trial demonstrated an 18% decrease in visceral fat. Boosts natural growth hormone production."
                },
                {
                    name: "AOD 9604",
                    tag: "Fat Metabolism",
                    desc: "Derived from growth hormone, targets fat burning directly through lipolysis. Helps reduce stubborn fat without affecting blood sugar levels."
                }
            ]
        },
        skin: {
            desc: "Skin and rejuvenation peptides stimulate collagen synthesis, accelerate wound healing, and support the body's natural repair mechanisms for healthier, more resilient skin and tissue.",
            subtitle: "Most Popular for Skin & Rejuvenation",
            peptides: [
                {
                    name: "GHK-Cu",
                    tag: "Collagen & Anti-Aging",
                    desc: "Powerful copper peptide for skin healing and anti-aging. Stimulates collagen production, supports hair growth, and accelerates wound repair. GHK-Cu plasma levels decline from 200 ng/mL at age 20 to 80 ng/mL by age 60."
                },
                {
                    name: "Glow Blend",
                    tag: "Comprehensive Blend",
                    desc: "Our proprietary blend of BPC-157 + TB-500 + GHK-Cu (50mg). Combines tissue repair peptides with collagen-boosting copper peptide for comprehensive skin and tissue rejuvenation."
                }
            ]
        },
        performance: {
            desc: "Performance peptides optimize the body's natural growth hormone release, enhance recovery between training sessions, and improve metabolic efficiency — allowing you to train harder and recover faster.",
            subtitle: "Most Popular for Performance",
            peptides: [
                {
                    name: "Ipamorelin",
                    tag: "GH Release",
                    desc: "Selectively stimulates growth hormone release without raising cortisol levels. Supports lean muscle gain, faster recovery, improved sleep, and fat loss alongside muscle building."
                },
                {
                    name: "MOTS-c",
                    tag: "Endurance",
                    desc: "Works at the mitochondrial level to increase endurance, improve metabolic efficiency, and build fatigue resistance. One of the closest things to a true 'energy peptide.'"
                }
            ]
        }
    };

    // ---------- DOM Elements ----------
    const pills = document.querySelectorAll('.cat-pill');
    const resultArea = document.getElementById('category-result');
    const viewSelector = document.getElementById('view-selector');
    const viewPeptides = document.getElementById('view-peptides');
    const view2026 = document.getElementById('view-2026');
    const btnWhatPeptides = document.getElementById('btn-what-peptides');
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
                btnWhatPeptides.classList.add('hidden');
                return;
            }

            // Deselect previous
            pills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedCategory = cat;

            // Show What Are Peptides button
            btnWhatPeptides.classList.remove('hidden');

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

        resultArea.innerHTML = `
            <div class="result-content">
                <p class="result-desc">${data.desc}</p>
                <h3 class="result-subtitle">${data.subtitle}</h3>
                <div class="result-peptides">
                    ${peptidesHTML}
                </div>
            </div>
        `;
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

    btnWhatPeptides.addEventListener('click', () => switchView(viewSelector, viewPeptides));
    btnPeptides2026.addEventListener('click', () => switchView(viewPeptides, view2026));
    backToSelector.addEventListener('click', () => switchView(viewPeptides, viewSelector));
    backToPeptides.addEventListener('click', () => switchView(view2026, viewPeptides));
    backToSelector2.addEventListener('click', () => {
        showLearnMore = false;
        switchView(view2026, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        btnWhatPeptides.classList.add('hidden');
        renderPlaceholder();
    });

    btnSafety.addEventListener('click', () => switchView(view2026, viewSafety));
    backTo2026.addEventListener('click', () => switchView(viewSafety, view2026));
    backToSelector3.addEventListener('click', () => {
        showLearnMore = false;
        switchView(viewSafety, viewSelector);
        pills.forEach(p => p.classList.remove('selected'));
        selectedCategory = null;
        btnWhatPeptides.classList.add('hidden');
        renderPlaceholder();
    });

    // Explore More — go back to selector with their category pre-selected and Learn More buttons
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
            btnWhatPeptides.classList.remove('hidden');
            renderCategory(selectedCategory);
            // Scroll to the result subtitle after transition
            setTimeout(() => {
                const subtitle = document.querySelector('.result-subtitle');
                if (subtitle) {
                    subtitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 550);
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
