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

    // ---------- DNA HELIX STRANDS (3D) ----------
    const dnaStrands = [
        { x: 0.15, y: 0.5, scale: 1.2, opacity: 0.10, speed: 0.0003, phase: 0, tilt: 0.15 },
        { x: 0.82, y: 0.45, scale: 1.4, opacity: 0.07, speed: 0.00025, phase: Math.PI * 0.7, tilt: -0.12 },
        { x: 0.48, y: 0.55, scale: 0.9, opacity: 0.05, speed: 0.00035, phase: Math.PI * 1.3, tilt: 0.08 },
    ];

    let dnaTime = 0;
    const HELIX_SEGMENTS = 120; // smooth curves
    const HELIX_TWISTS = 4; // number of full rotations
    const RUNG_COUNT = 28;

    function drawDNA() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        dnaStrands.forEach(strand => {
            const cx = w * strand.x;
            const strandHeight = h * 0.85;
            const startY = h * strand.y - strandHeight / 2;
            const amplitude = 55 * strand.scale;
            const twist = dnaTime * strand.speed + strand.phase;

            ctx.save();

            // Draw two backbone strands with 3D shading
            for (let s = 0; s < 2; s++) {
                const offset = s * Math.PI;

                // Draw strand as series of short segments with varying thickness/opacity
                for (let i = 0; i < HELIX_SEGMENTS; i++) {
                    const t0 = i / HELIX_SEGMENTS;
                    const t1 = (i + 1) / HELIX_SEGMENTS;
                    const y0 = startY + t0 * strandHeight;
                    const y1 = startY + t1 * strandHeight;
                    const angle0 = t0 * Math.PI * 2 * HELIX_TWISTS + twist + offset;
                    const angle1 = t1 * Math.PI * 2 * HELIX_TWISTS + twist + offset;

                    // Slight horizontal drift for organic curvature
                    const drift = Math.sin(t0 * Math.PI * 1.5 + strand.phase) * 30 * strand.scale;
                    const drift1 = Math.sin(t1 * Math.PI * 1.5 + strand.phase) * 30 * strand.scale;

                    const x0 = cx + Math.sin(angle0) * amplitude + drift + strand.tilt * (y0 - h * 0.5);
                    const x1 = cx + Math.sin(angle1) * amplitude + drift1 + strand.tilt * (y1 - h * 0.5);

                    // Depth: cos gives us front/back position
                    const depth0 = Math.cos(angle0);
                    const depth1 = Math.cos(angle1);
                    const avgDepth = (depth0 + depth1) / 2;

                    // 3D: front strands brighter/thicker, back strands dimmer/thinner
                    const depthBrightness = 0.3 + 0.7 * ((avgDepth + 1) / 2); // 0.3 to 1.0
                    const lineWidth = (1.5 + 2.5 * ((avgDepth + 1) / 2)) * strand.scale;
                    const segAlpha = strand.opacity * depthBrightness;

                    ctx.beginPath();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.strokeStyle = `rgba(212, 168, 67, ${segAlpha})`;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Glow on front-facing segments
                    if (avgDepth > 0.5) {
                        ctx.beginPath();
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x1, y1);
                        ctx.strokeStyle = `rgba(232, 201, 106, ${segAlpha * 0.3})`;
                        ctx.lineWidth = lineWidth + 4 * strand.scale;
                        ctx.stroke();
                    }
                }
            }

            // Draw rungs with 3D depth
            for (let i = 0; i < RUNG_COUNT; i++) {
                const t = i / RUNG_COUNT;
                const y = startY + t * strandHeight;
                const angle = t * Math.PI * 2 * HELIX_TWISTS + twist;
                const drift = Math.sin(t * Math.PI * 1.5 + strand.phase) * 30 * strand.scale;
                const tiltOffset = strand.tilt * (y - h * 0.5);

                const x1 = cx + Math.sin(angle) * amplitude + drift + tiltOffset;
                const x2 = cx + Math.sin(angle + Math.PI) * amplitude + drift + tiltOffset;
                const depth = Math.cos(angle);

                // Only draw rungs clearly facing the viewer
                if (Math.abs(depth) > 0.2) {
                    const rungAlpha = strand.opacity * 0.6 * Math.abs(depth);
                    const rungWidth = (1 + 1.5 * Math.abs(depth)) * strand.scale;

                    // Draw rung as two halves with a gap in the middle (base pairs)
                    const midX = (x1 + x2) / 2;
                    const midY = y;
                    const gap = 3 * strand.scale;

                    // Left half
                    ctx.beginPath();
                    ctx.moveTo(x1, y);
                    ctx.lineTo(midX - gap, midY);
                    ctx.strokeStyle = `rgba(180, 140, 60, ${rungAlpha})`;
                    ctx.lineWidth = rungWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Right half (slightly different color for base pair effect)
                    ctx.beginPath();
                    ctx.moveTo(midX + gap, midY);
                    ctx.lineTo(x2, y);
                    ctx.strokeStyle = `rgba(212, 168, 67, ${rungAlpha})`;
                    ctx.lineWidth = rungWidth;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Dots at backbone connection points
                    const dotSize = (2.5 + 1.5 * Math.abs(depth)) * strand.scale;
                    [x1, x2].forEach(x => {
                        const dotGrad = ctx.createRadialGradient(x, y, 0, x, y, dotSize);
                        dotGrad.addColorStop(0, `rgba(232, 201, 106, ${rungAlpha * 1.2})`);
                        dotGrad.addColorStop(1, `rgba(212, 168, 67, 0)`);
                        ctx.beginPath();
                        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                        ctx.fillStyle = dotGrad;
                        ctx.fill();
                    });

                    // Center hydrogen bond dots
                    ctx.beginPath();
                    ctx.arc(midX - gap, midY, 1.5 * strand.scale, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(232, 201, 106, ${rungAlpha * 0.8})`;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(midX + gap, midY, 1.5 * strand.scale, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(232, 201, 106, ${rungAlpha * 0.8})`;
                    ctx.fill();
                }
            }

            ctx.restore();
        });

        dnaTime++;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Draw DNA behind particles
        drawDNA();

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
    const GLOW_MIN = 0.07;
    const GLOW_MAX = 0.5;
    let currentIndex = 0;
    let elapsed = 0;
    let goingBright = true; // true = dimming to bright, false = bright to dim
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
