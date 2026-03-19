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

    function init() {
        resize();
        const count = Math.min(Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 8000), 150);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            // Wrap around
            if (p.x < -10) p.x = canvas.offsetWidth + 10;
            if (p.x > canvas.offsetWidth + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.offsetHeight + 10;
            if (p.y > canvas.offsetHeight + 10) p.y = -10;

            // Draw glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, `rgba(212, 168, 67, ${currentOpacity})`);
            gradient.addColorStop(1, 'rgba(212, 168, 67, 0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232, 201, 106, ${currentOpacity})`;
            ctx.fill();
        });

        animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationId);
        init();
        draw();
    });

    init();
    draw();
})();


// ---------- FEATURED PRODUCTS CATEGORY CAROUSEL ----------
(function initCarousel() {
    const tabs = document.querySelectorAll('.carousel-tab');
    const panels = document.querySelectorAll('.carousel-panel');
    const section = document.querySelector('.featured-products');
    if (!tabs.length || !panels.length || !section) return;

    const HALF_CYCLE = 5000; // 5 seconds bright-to-dim or dim-to-bright
    const TICK = 30;
    const GLOW_MIN = 0.05;
    const GLOW_MAX = 0.70;
    let currentIndex = 0;
    let elapsed = 0;
    let goingBright = true; // true = dimming to bright, false = bright to dim
    let intervalId = null;
    let paused = false;

    function setGlow(opacity) {
        section.style.setProperty('--glow-opacity', opacity.toFixed(4));
    }

    let fadeOutStarted = false;
    const panelsContainer = document.querySelector('.carousel-panels');

    function fadeOutCurrent() {
        const current = panels[currentIndex];
        current.classList.add('fading-out');
        fadeOutStarted = true;
    }

    function switchTo(index, animated) {
        // Lock container height before switching
        panelsContainer.style.height = panelsContainer.offsetHeight + 'px';

        // Clean up all panels
        panels.forEach(p => {
            p.classList.remove('active', 'fading-out');
        });

        // Activate target
        tabs.forEach(t => t.classList.remove('active'));
        tabs[index].classList.add('active');
        panels[index].classList.add('active');

        currentIndex = index;
        fadeOutStarted = false;

        // Release height lock after transition completes
        setTimeout(() => {
            panelsContainer.style.height = '';
        }, 1100);
    }

    function tick() {
        if (paused) return;
        elapsed += TICK;

        const progress = Math.min(elapsed / HALF_CYCLE, 1);
        // Smooth sine ease for organic feel
        const eased = (1 - Math.cos(progress * Math.PI)) / 2;

        let glowValue;
        if (goingBright) {
            // Dim → Bright
            glowValue = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * eased;
        } else {
            // Bright → Dim
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
                // Hit peak brightness — now start dimming
                goingBright = false;
            } else {
                // Hit dimmest point — shuffle and start brightening
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

    // Start auto-rotation on desktop only
    function isMobile() {
        return window.innerWidth <= 768;
    }

    if (!isMobile()) {
        intervalId = setInterval(tick, TICK);
    }

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
        } else if (!intervalId) {
            elapsed = 0;
            intervalId = setInterval(tick, TICK);
        }
    });

    // Initialize first panel
    switchTo(0);
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
        '.product-card, .product-card-sm, .category-item, .testimonial-card, .story-content, .science-section .container'
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
