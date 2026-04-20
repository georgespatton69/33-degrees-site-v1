/**
 * 33 Degrees Age Verification Gate
 * Shows on first visit, remembers user's answer in localStorage
 */
(function() {
    'use strict';

    const STORAGE_KEY = '33d_age_verified';

    // Skip if already verified
    if (localStorage.getItem(STORAGE_KEY) === 'yes') return;

    function buildGate() {
        var gate = document.createElement('div');
        gate.id = 'age-gate';
        gate.innerHTML =
            '<div class="age-gate-modal">' +
                '<div class="age-gate-logo">' +
                    '<img src="/assets/images/logo-transparent.webp" alt="33 Degrees of Healing">' +
                '</div>' +
                '<h2 class="age-gate-title">I CERTIFY I AM AT LEAST 21 YEARS OF AGE</h2>' +
                '<div class="age-gate-buttons">' +
                    '<button class="age-gate-btn age-gate-yes">Yes</button>' +
                    '<button class="age-gate-btn age-gate-no">No</button>' +
                '</div>' +
                '<p class="age-gate-disclaimer">' +
                    '<strong>*IMPORTANT DISCLAIMER*</strong> 33 DEGREES OF HEALING sells research compounds for research purposes only. These products are not intended for human consumption and are not FDA-approved. By purchasing from us, you acknowledge that you are aware of the potential risks and consequences of using these products. You agree to hold harmless 33 DEGREES OF HEALING and its affiliates. *Use at your own risk. Consult our Terms and Conditions page for additional information.*' +
                '</p>' +
            '</div>';

        document.body.appendChild(gate);
        document.body.style.overflow = 'hidden';

        gate.querySelector('.age-gate-yes').addEventListener('click', function() {
            localStorage.setItem(STORAGE_KEY, 'yes');
            gate.classList.add('fading-out');
            setTimeout(function() {
                gate.remove();
                document.body.style.overflow = '';
            }, 300);
        });

        gate.querySelector('.age-gate-no').addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildGate);
    } else {
        buildGate();
    }
})();
