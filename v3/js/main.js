/* ============================================
   33 DEGREES V3 — IM8-style JS
   ============================================ */

// ---------- MOBILE NAV ----------
(function() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (!toggle || !overlay) return;
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
})();

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const t = document.querySelector(this.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' });
    });
});

// ---------- SCROLL REVEAL ----------
(function() {
    const els = document.querySelectorAll(
        '.showcase-card, .catalog-card, .glass-card, .stat-item, .step, .testimonial-glass'
    );
    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 80);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
})();

// ---------- STAT COUNTER ANIMATION ----------
(function() {
    const stats = document.querySelectorAll('.stat-big');
    if (!stats.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const match = text.match(/[\d.]+/);
                if (!match) return;

                const target = parseFloat(match[0]);
                const suffix = text.replace(match[0], '');
                const duration = 1800;
                const start = performance.now();

                function tick(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 4);
                    const val = target * eased;
                    el.textContent = (text.includes('.') ? val.toFixed(1) : Math.round(val)) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = text;
                }
                requestAnimationFrame(tick);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => obs.observe(s));
})();

// ---------- PARALLAX HERO GLOW ----------
(function() {
    const glows = document.querySelectorAll('.hero-glow');
    if (!glows.length) return;

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        glows.forEach((g, i) => {
            const factor = i === 0 ? 1 : -0.7;
            g.style.transform = `translate(${x * factor}px, ${y * factor}px) scale(${1 + Math.abs(x) * 0.002})`;
        });
    });
})();
