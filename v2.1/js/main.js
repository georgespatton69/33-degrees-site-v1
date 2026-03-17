/* V2.1 — JS */

// Mobile nav
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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const t = document.querySelector(this.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' });
    });
});

// Scroll reveal
(function() {
    const els = document.querySelectorAll(
        '.story-text, .story-img, .step-card, .testimonial-card, .proof-item, .about-inner'
    );
    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => obs.observe(el));
})();

// Stat counter
(function() {
    const nums = document.querySelectorAll('.proof-num');
    if (!nums.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const match = text.match(/[\d.]+/);
                if (!match) return;
                const target = parseFloat(match[0]);
                const suffix = text.replace(match[0], '');
                const start = performance.now();
                const duration = 1500;
                function tick(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
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
    nums.forEach(n => obs.observe(n));
})();
