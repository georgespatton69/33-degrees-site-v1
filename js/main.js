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


// ---------- SHOW MORE FEATURED PRODUCTS (MOBILE) ----------
(function initShowMore() {
    const btn = document.getElementById('show-more-featured');
    const extra = document.getElementById('featured-extra');
    if (!btn || !extra) return;

    const textEl = btn.querySelector('.show-more-text');

    btn.addEventListener('click', () => {
        const expanded = extra.classList.toggle('show');
        btn.classList.toggle('expanded');
        textEl.textContent = expanded ? 'Show Less' : 'Show More';
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
