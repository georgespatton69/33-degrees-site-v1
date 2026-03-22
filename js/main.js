/* ============================================
   33 DEGREES OF HEALING — MAIN JS
   Particle effects, mobile nav, smooth scroll
   ============================================ */

// ---------- GOLD PARTICLE BACKGROUND ----------
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            size: Math.random() * 2.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3 - 0.15,
            opacity: Math.random() * 0.6 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.005,
        };
    }

    const isMobileDevice = window.innerWidth <= 768;

    function init() {
        resize();
        const maxParticles = isMobileDevice ? 40 : 150;
        const count = Math.min(Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 8000), maxParticles);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    // Pause animation when hero is off-screen
    let heroVisible = true;
    const heroObserver = new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible && !animationId) draw();
    }, { threshold: 0 });
    heroObserver.observe(canvas.parentElement);

    function draw() {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            if (p.x < -10) p.x = canvas.offsetWidth + 10;
            if (p.x > canvas.offsetWidth + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.offsetHeight + 10;
            if (p.y > canvas.offsetHeight + 10) p.y = -10;

            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, `rgba(212, 168, 67, ${currentOpacity})`);
            gradient.addColorStop(1, 'rgba(212, 168, 67, 0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232, 201, 106, ${currentOpacity})`;
            ctx.fill();
        });

        if (heroVisible) {
            animationId = requestAnimationFrame(draw);
        } else {
            animationId = null;
        }
    }

    // Only reinit on actual width changes (ignore mobile URL bar height changes)
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWidth) {
            lastWidth = window.innerWidth;
            cancelAnimationFrame(animationId);
            init();
            if (heroVisible) draw();
        }
    });

    init();
})();


// ---------- FEATURED PRODUCTS CATEGORY CAROUSEL ----------
(function initCarousel() {
    const tabs = document.querySelectorAll('.carousel-tab');
    const panels = document.querySelectorAll('.carousel-panel');
    const section = document.querySelector('.featured-products');
    if (!tabs.length || !panels.length || !section) return;

    const HALF_CYCLE = 3500; // 3.5s each way = 7s total per category
    const TICK = 30;
    const GLOW_MIN = 0.07;
    const GLOW_MAX = 0.5;
    let currentIndex = 0;
    let elapsed = 0;
    let goingBright = true;
    let intervalId = null;
    let paused = false;

    function setGlow(opacity) {
        section.style.setProperty('--glow-opacity', opacity.toFixed(4));
    }

    let fadeOutStarted = false;

    function fadeOutCurrent() {
        const current = panels[currentIndex];
        current.classList.add('fading-out');
        fadeOutStarted = true;
    }

    function switchTo(index, animated) {
        panels.forEach(p => {
            p.classList.remove('active', 'fading-out');
        });

        tabs.forEach(t => t.classList.remove('active'));
        tabs[index].classList.add('active');
        panels[index].classList.add('active');

        currentIndex = index;
        fadeOutStarted = false;
    }

    function tick() {
        if (paused) return;
        elapsed += TICK;

        const progress = Math.min(elapsed / HALF_CYCLE, 1);
        const eased = (1 - Math.cos(progress * Math.PI)) / 2;

        let glowValue;
        if (goingBright) {
            glowValue = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * eased;
        } else {
            glowValue = GLOW_MAX - (GLOW_MAX - GLOW_MIN) * eased;
        }
        setGlow(glowValue);

        // Start fading out content 1s before dimmest point
        if (!goingBright && !fadeOutStarted && elapsed >= HALF_CYCLE - 1000) {
            fadeOutCurrent();
        }

        if (elapsed >= HALF_CYCLE) {
            elapsed = 0;
            if (goingBright) {
                goingBright = false;
            } else {
                goingBright = true;
                const next = (currentIndex + 1) % tabs.length;
                switchTo(next, true);
            }
        }
    }

    // Tab clicks — reset glow cycle
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            switchTo(i, false);
            elapsed = 0;
            goingBright = true;
            setGlow(GLOW_MIN);
        });
    });

    // Pause on hover over product cards only
    const cards = document.querySelectorAll('.featured-products .product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => { paused = true; });
        card.addEventListener('mouseleave', () => { paused = false; });
    });

    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Initialize at minimum glow
    setGlow(GLOW_MIN);
    switchTo(0);

    // Only start auto-rotation when section is visible
    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started && !isMobile()) {
                started = true;
                elapsed = 0;
                goingBright = true;
                setGlow(GLOW_MIN);
                intervalId = setInterval(tick, TICK);
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });

    observer.observe(section);

    // No glow animation on mobile
    if (isMobile()) {
        setGlow(GLOW_MIN);
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (isMobile()) {
            clearInterval(intervalId);
            intervalId = null;
            setGlow(GLOW_MIN);
        } else if (!intervalId && started) {
            elapsed = 0;
            intervalId = setInterval(tick, TICK);
        }
    });
})();


// ---------- MOBILE NAVIGATION ----------
(function initMobileNav() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (!toggle || !overlay) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
})();


// ---------- HEADER SCROLL EFFECT ----------
(function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.85)';
        }

        lastScroll = currentScroll;
    });
})();


// ---------- CATEGORY PRODUCT SELECTION (Desktop) ----------
(function initCatProducts() {
    document.querySelectorAll('.cat-section').forEach(section => {
        const desc = section.querySelector('.cat-desc');
        const stats = section.querySelector('.cat-stats');
        const img = section.querySelector('.cat-img img');
        const products = section.querySelectorAll('.cat-product');
        if (!desc || !img || !products.length) return;

        products.forEach(product => {
            product.addEventListener('click', () => {
                // Skip if already active
                if (product.classList.contains('active')) return;

                // Fade out
                desc.style.opacity = '0';
                stats.style.opacity = '0';
                img.style.opacity = '0';

                setTimeout(() => {
                    // Update active state
                    products.forEach(p => p.classList.remove('active'));
                    product.classList.add('active');

                    // Update content
                    desc.innerHTML = product.dataset.desc;
                    img.src = product.dataset.img;

                    // Update stats with citation links
                    const statEls = stats.querySelectorAll('.cat-stat');
                    if (statEls[0]) {
                        statEls[0].querySelector('.cat-stat-num').innerHTML = product.dataset.stat1;
                        let label1 = product.dataset.stat1Label;
                        if (product.dataset.stat1Source) {
                            label1 += ' <a href="' + product.dataset.stat1Source + '" target="_blank" rel="noopener" class="citation-link">Source</a>';
                        }
                        statEls[0].querySelector('.cat-stat-label').innerHTML = label1;
                    }
                    if (statEls[1]) {
                        statEls[1].querySelector('.cat-stat-num').innerHTML = product.dataset.stat2;
                        let label2 = product.dataset.stat2Label;
                        if (product.dataset.stat2Source) {
                            label2 += ' <a href="' + product.dataset.stat2Source + '" target="_blank" rel="noopener" class="citation-link">Source</a>';
                        }
                        statEls[1].querySelector('.cat-stat-label').innerHTML = label2;
                    }

                    // Fade in
                    requestAnimationFrame(() => {
                        desc.style.opacity = '1';
                        stats.style.opacity = '1';
                        img.style.opacity = '1';
                    });
                }, 300);
            });
        });
    });
})();


// ---------- MOBILE REDIRECT FOR NAV LINKS ----------
document.querySelectorAll('[data-mobile-href]').forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            window.location.href = this.dataset.mobileHref;
        }
    });
});


// ---------- SMOOTH SCROLL FOR ANCHOR LINKS ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});


// ---------- SCROLL REVEAL ANIMATIONS ----------
(function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.product-card, .product-card-sm, .category-item, .testimonial-card, .story-content, .science-section .container, .peptide-benefit'
    );

    if (!revealElements.length) return;

    // Add initial hidden state
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the reveal
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 60);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
})();
