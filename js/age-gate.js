/**
 * 33 Degrees Age + Research-Use Verification Gate
 * Shows on first visit, remembers the user's answer in localStorage.
 * Verbiage mirrors the standard research-supplier confirmation gate.
 */
(function() {
    'use strict';

    // Bumped to v2 when the gate changed from a simple 21+ check to the
    // qualified-researcher / in-vitro affirmation — re-prompt everyone once.
    const STORAGE_KEY = '33d_age_verified_v2';

    // Skip if already verified
    if (localStorage.getItem(STORAGE_KEY) === 'yes') return;

    function injectStyles() {
        if (document.getElementById('age-gate-styles')) return;
        var s = document.createElement('style');
        s.id = 'age-gate-styles';
        s.textContent =
            '#age-gate .age-gate-intro{font-family:var(--font-body);font-size:0.92rem;line-height:1.55;color:#2c2416;margin:0 0 22px;text-align:center;}' +
            '#age-gate .age-gate-checks{text-align:left;margin:0 0 22px;display:flex;flex-direction:column;gap:14px;}' +
            '#age-gate .age-gate-check{display:flex;align-items:flex-start;gap:12px;cursor:pointer;font-family:var(--font-body);font-size:0.86rem;line-height:1.45;color:#2c2416;}' +
            '#age-gate .age-gate-check input{margin-top:3px;width:18px;height:18px;flex:0 0 auto;accent-color:#2c2416;cursor:pointer;}' +
            '#age-gate .age-gate-enter{width:100%;padding:15px;border:none;border-radius:4px;background:#2c2416;color:#faf6f0;font-family:var(--font-body);font-size:0.95rem;font-weight:600;letter-spacing:0.5px;cursor:pointer;transition:opacity .2s ease;margin:0 0 20px;}' +
            '#age-gate .age-gate-enter:disabled{background:#b8b1a4;color:#f2eee7;cursor:not-allowed;}' +
            '#age-gate .age-gate-disclaimer{text-align:left;}';
        document.head.appendChild(s);
    }

    function buildGate() {
        injectStyles();
        var gate = document.createElement('div');
        gate.id = 'age-gate';
        gate.innerHTML =
            '<div class="age-gate-modal">' +
                '<div class="age-gate-logo">' +
                    '<img src="/assets/images/logo-transparent.webp" alt="33 Degrees of Healing">' +
                '</div>' +
                '<p class="age-gate-intro">33 Degrees of Healing supplies research peptides exclusively to qualified researchers and laboratories for in vitro laboratory research. Please confirm the following before continuing.</p>' +
                '<div class="age-gate-checks">' +
                    '<label class="age-gate-check"><input type="checkbox" id="ag-check1"><span>I am at least 21 years of age.</span></label>' +
                    '<label class="age-gate-check"><input type="checkbox" id="ag-check2"><span>I confirm that I am a qualified researcher purchasing these products solely for in vitro laboratory research and not for human or veterinary use.</span></label>' +
                '</div>' +
                '<button class="age-gate-enter" id="ag-enter" disabled>Enter Site</button>' +
                '<p class="age-gate-disclaimer">By proceeding, you affirm that the statements above are true. All products sold by 33 Degrees of Healing are intended for laboratory research purposes only. They are not for human or veterinary use, not intended for use in diagnostic procedures, and have not been evaluated by the U.S. Food and Drug Administration (FDA). The products offered on this website are sold solely for lawful research purposes.</p>' +
            '</div>';

        document.body.appendChild(gate);
        document.body.style.overflow = 'hidden';

        var c1 = gate.querySelector('#ag-check1');
        var c2 = gate.querySelector('#ag-check2');
        var enter = gate.querySelector('#ag-enter');

        function sync() { enter.disabled = !(c1.checked && c2.checked); }
        c1.addEventListener('change', sync);
        c2.addEventListener('change', sync);

        enter.addEventListener('click', function() {
            if (enter.disabled) return;
            localStorage.setItem(STORAGE_KEY, 'yes');
            gate.classList.add('fading-out');
            setTimeout(function() {
                gate.remove();
                document.body.style.overflow = '';
            }, 300);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildGate);
    } else {
        buildGate();
    }
})();
