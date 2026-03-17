/* ============================================
   33 DEGREES V3 — JS
   Mobile nav, scroll reveal, smooth scroll
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
        '.compound-card, .catalog-card, .process-card, .glass-card, .stat-item, .testimonial-glass'
    );
    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 60);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

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
                const duration = 1500;
                const start = performance.now();

                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = target * eased;

                    if (text.includes('.')) {
                        el.textContent = current.toFixed(1) + suffix;
                    } else {
                        el.textContent = Math.round(current) + suffix;
                    }

                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = text;
                }

                requestAnimationFrame(tick);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => obs.observe(s));
})();
