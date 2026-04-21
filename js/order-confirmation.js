/**
 * 33 Degrees Order Confirmation page
 * Reads order snapshot from sessionStorage (saved by checkout.js before redirect)
 * and renders order number, items, totals, and shipping details.
 * Falls back to a minimal view with just the order number from the URL if the
 * snapshot is missing (e.g. user revisits the link later).
 */
(function() {
    'use strict';

    function qs(name) {
        const m = new URLSearchParams(window.location.search).get(name);
        return m || '';
    }

    function formatMoney(n) {
        return '$' + Number(n).toFixed(2);
    }

    function getSnapshot() {
        try { return JSON.parse(sessionStorage.getItem('33d_last_order')) || null; }
        catch { return null; }
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function renderItems(items) {
        const container = document.getElementById('confirmation-items');
        if (!container) return;
        if (!items || !items.length) {
            container.innerHTML = '<p style="color:rgba(245,230,200,0.55);font-size:0.9rem;margin:0;">Item details were not captured.</p>';
            return;
        }
        container.innerHTML = items.map(function(item) {
            const line = item.price * item.quantity;
            const img = item.image || '';
            const variant = item.variantSize ? '<span class="summary-item-variant">' + item.variantSize + '</span>' : '';
            return '<div class="summary-item">' +
                '<div class="summary-item-img">' +
                    (img ? '<img src="' + img + '" alt="">' : '') +
                    '<span class="summary-item-qty">' + item.quantity + '</span>' +
                '</div>' +
                '<div class="summary-item-info">' +
                    '<span class="summary-item-name">' + item.productName + '</span>' +
                    variant +
                '</div>' +
                '<div class="summary-item-price">' + formatMoney(line) + '</div>' +
            '</div>';
        }).join('');
    }

    function hideCard(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const orderNumber = qs('order') || '—';
        setText('confirmation-order-number', orderNumber);
        setText('confirmation-order-number-inline', orderNumber);

        const snap = getSnapshot();

        if (!snap) {
            // Minimal fallback — no snapshot, just show order number + next steps
            setText('confirmation-first-name', 'friend');
            hideCard('confirmation-details-card');
            hideCard('confirmation-items-card');
            return;
        }

        setText('confirmation-first-name', snap.first_name || 'friend');
        setText('confirmation-email', snap.email || 'your email');

        const shipLines = [
            (snap.first_name || '') + ' ' + (snap.last_name || ''),
            snap.address_line1 || '',
            snap.address_line2 || '',
            [snap.city, snap.state].filter(Boolean).join(', ') + ' ' + (snap.zip_code || ''),
        ].filter(function(l) { return l && l.trim(); }).join('\n');
        setText('confirmation-shipping', shipLines || '—');

        const contactLines = [snap.email || '', snap.phone || ''].filter(Boolean).join('\n');
        setText('confirmation-contact', contactLines || snap.email || '—');

        renderItems(snap.items);
        setText('confirmation-total', formatMoney(snap.total || 0));
    });
})();
