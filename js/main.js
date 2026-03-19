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

    // ---------- DNA HELIX STRANDS (3D Tubular) ----------
    const dnaStrands = [
        { x: 0.13, y: 0.5, scale: 1.3, opacity: 0.12, speed: 0.0003, phase: 0, tilt: 0.18 },
        { x: 0.85, y: 0.45, scale: 1.5, opacity: 0.08, speed: 0.00022, phase: Math.PI * 0.7, tilt: -0.14 },
        { x: 0.50, y: 0.55, scale: 0.9, opacity: 0.05, speed: 0.00035, phase: Math.PI * 1.3, tilt: 0.06 },
    ];

    let dnaTime = 0;
    const SEGMENTS = 150;
    const TWISTS = 4.5;
    const RUNG_COUNT = 36;
    const TUBE_RADIUS = 6; // base tube thickness

    function getHelixPoint(t, twist, offset, amplitude, cx, startY, strandHeight, strand, h) {
        const angle = t * Math.PI * 2 * TWISTS + twist + offset;
        const drift = Math.sin(t * Math.PI * 1.8 + strand.phase) * 40 * strand.scale;
        const y = startY + t * strandHeight;
        const tiltOff = strand.tilt * (y - h * 0.5);
        const x = cx + Math.sin(angle) * amplitude + drift + tiltOff;
        const depth = Math.cos(angle); // -1 (back) to 1 (front)
        return { x, y, depth, angle };
    }

    function drawDNA() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        dnaStrands.forEach(strand => {
            const cx = w * strand.x;
            const strandHeight = h * 0.9;
            const startY = h * strand.y - strandHeight / 2;
            const amplitude = 70 * strand.scale;
            const twist = dnaTime * strand.speed + strand.phase;
            const tubeR = TUBE_RADIUS * strand.scale;

            ctx.save();

            // --- BACKBONES (Tubular with glow layers) ---
            for (let s = 0; s < 2; s++) {
                const offset = s * Math.PI;

                // Multiple passes: outer glow, mid glow, core, highlight
                const passes = [
                    { widthMul: 5.0, alphaMul: 0.12, color: [212, 168, 67] },  // outer glow
                    { widthMul: 3.0, alphaMul: 0.20, color: [212, 168, 67] },  // mid glow
                    { widthMul: 1.6, alphaMul: 0.45, color: [200, 160, 60] },  // core
                    { widthMul: 0.6, alphaMul: 0.7,  color: [232, 210, 130] }, // bright center
                    { widthMul: 0.2, alphaMul: 0.9,  color: [255, 240, 180] }, // hot highlight
                ];

                for (const pass of passes) {
                    for (let i = 0; i < SEGMENTS; i++) {
                        const t0 = i / SEGMENTS;
                        const t1 = (i + 1) / SEGMENTS;
                        const p0 = getHelixPoint(t0, twist, offset, amplitude, cx, startY, strandHeight, strand, h);
                        const p1 = getHelixPoint(t1, twist, offset, amplitude, cx, startY, strandHeight, strand, h);

                        const avgDepth = (p0.depth + p1.depth) / 2;
                        const depthFactor = 0.2 + 0.8 * ((avgDepth + 1) / 2);
                        const segAlpha = strand.opacity * pass.alphaMul * depthFactor;
                        const lw = tubeR * pass.widthMul * (0.5 + 0.5 * depthFactor);

                        ctx.beginPath();
                        ctx.moveTo(p0.x, p0.y);
                        ctx.lineTo(p1.x, p1.y);
                        ctx.strokeStyle = `rgba(${pass.color.join(',')}, ${segAlpha})`;
                        ctx.lineWidth = lw;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }
                }
            }

            // --- RUNGS (wireframe mesh style) ---
            for (let i = 0; i < RUNG_COUNT; i++) {
                const t = i / RUNG_COUNT;
                const p1 = getHelixPoint(t, twist, 0, amplitude, cx, startY, strandHeight, strand, h);
                const p2 = getHelixPoint(t, twist, Math.PI, amplitude, cx, startY, strandHeight, strand, h);
                const depth = Math.cos(t * Math.PI * 2 * TWISTS + twist);

                if (Math.abs(depth) > 0.15) {
                    const depthFactor = Math.abs(depth);
                    const rungAlpha = strand.opacity * 0.5 * depthFactor;

                    // Wireframe cross-links (3 parallel lines for mesh look)
                    for (let line = -1; line <= 1; line++) {
                        const yOff = line * 2 * strand.scale;
                        const alpha = rungAlpha * (line === 0 ? 1 : 0.4);

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y + yOff);
                        ctx.lineTo(p2.x, p2.y + yOff);
                        ctx.strokeStyle = `rgba(212, 168, 67, ${alpha})`;
                        ctx.lineWidth = (0.8 + depthFactor) * strand.scale;
                        ctx.stroke();
                    }

                    // Glowing nodes at backbone intersections
                    [p1, p2].forEach(p => {
                        const nodeR = (4 + 4 * depthFactor) * strand.scale;
                        const nodeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeR);
                        nodeGrad.addColorStop(0, `rgba(255, 240, 180, ${rungAlpha * 1.5})`);
                        nodeGrad.addColorStop(0.3, `rgba(232, 201, 106, ${rungAlpha * 0.8})`);
                        nodeGrad.addColorStop(1, `rgba(212, 168, 67, 0)`);
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
                        ctx.fillStyle = nodeGrad;
                        ctx.fill();
                    });

                    // Diagonal wireframe lines to next rung (mesh effect)
                    if (i < RUNG_COUNT - 1) {
                        const tNext = (i + 1) / RUNG_COUNT;
                        const pn1 = getHelixPoint(tNext, twist, 0, amplitude, cx, startY, strandHeight, strand, h);
                        const pn2 = getHelixPoint(tNext, twist, Math.PI, amplitude, cx, startY, strandHeight, strand, h);
                        const meshAlpha = rungAlpha * 0.25;

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(pn2.x, pn2.y);
                        ctx.strokeStyle = `rgba(212, 168, 67, ${meshAlpha})`;
                        ctx.lineWidth = 0.5 * strand.scale;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(p2.x, p2.y);
                        ctx.lineTo(pn1.x, pn1.y);
                        ctx.strokeStyle = `rgba(212, 168, 67, ${meshAlpha})`;
                        ctx.lineWidth = 0.5 * strand.scale;
                        ctx.stroke();
                    }
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
