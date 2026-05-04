/**
 * 33 Degrees Checkout page
 * - Reads cart from localStorage
 * - Renders order summary
 * - On submit, sends order to backend (invoice flow)
 */
(function() {
    'use strict';

    const API_BASE = window.THIRTY3_API_BASE || 'https://web-production-a7a6.up.railway.app/api/v1';
    const CART_KEY = '33d_cart';

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    }

    function formatMoney(n) {
        return '$' + Number(n).toFixed(2);
    }

    function renderSummary() {
        const cart = getCart();
        const container = document.getElementById('summary-items');
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');

        if (!cart.length) {
            container.innerHTML = '<p style="color:rgba(245,230,200,0.55);font-size:0.9rem;">Your cart is empty. <a href="/compounds/" style="color:#c9a759;">Browse products</a></p>';
            subtotalEl.textContent = '$0.00';
            totalEl.textContent = '$0.00';
            const btn = document.getElementById('complete-order');
            if (btn) btn.disabled = true;
            return;
        }

        let subtotal = 0;
        container.innerHTML = cart.map(function(item) {
            const line = item.price * item.quantity;
            subtotal += line;
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

        subtotalEl.textContent = formatMoney(subtotal);
        totalEl.textContent = formatMoney(subtotal);
    }

    function collectFormData(form) {
        const fd = new FormData(form);
        return {
            email: fd.get('email'),
            first_name: fd.get('first_name'),
            last_name: fd.get('last_name'),
            phone: fd.get('phone') || '',
            company: fd.get('company') || '',
            address_line1: fd.get('address_line1'),
            address_line2: fd.get('address_line2') || '',
            city: fd.get('city'),
            state: fd.get('state'),
            zip_code: fd.get('zip_code'),
            country: fd.get('country') || 'US',
            marketing_opt_in: fd.get('marketing_opt_in') === 'on',
            save_info: fd.get('save_info') === 'on',
            billing_same: fd.get('billing') === 'same',
        };
    }

    function cartToItems() {
        return getCart().map(function(i) {
            return {
                product_slug: i.productSlug,
                variant_id: i.variantId || null,
                quantity: i.quantity,
            };
        });
    }

    async function submitOrder(data, items) {
        const payload = Object.assign({}, data, {
            items: items,
            processor: 'quickbooks',
        });
        const res = await fetch(API_BASE + '/checkout/create-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error('Order submission failed: ' + err);
        }
        return res.json();
    }

    document.addEventListener('DOMContentLoaded', function() {
        renderSummary();

        // Discount code — placeholder for now
        document.getElementById('apply-discount').addEventListener('click', function() {
            const code = document.getElementById('discount-code').value.trim();
            if (!code) return;
            alert('Discount code functionality coming soon.');
        });

        // Submit handler
        const form = document.getElementById('checkout-form');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('complete-order');
            const cart = getCart();
            if (!cart.length) {
                alert('Your cart is empty.');
                return;
            }
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Submitting…';

            const data = collectFormData(form);
            const items = cartToItems();

            try {
                const result = await submitOrder(data, items);
                const order = (result && result.order_number) || '';
                const total = (result && result.total) || '0.00';
                // Snapshot order details so the confirmation page can render them
                // after the cart is cleared
                try {
                    sessionStorage.setItem('33d_last_order', JSON.stringify({
                        order_number: order,
                        total: total,
                        email: data.email,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        phone: data.phone,
                        address_line1: data.address_line1,
                        address_line2: data.address_line2,
                        city: data.city,
                        state: data.state,
                        zip_code: data.zip_code,
                        items: getCart(),
                    }));
                } catch {}
                localStorage.removeItem(CART_KEY);
                window.location.href = '/order-confirmation/?order=' + encodeURIComponent(order);
            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.textContent = 'Complete order';
                alert('Something went wrong submitting your order. Please try again or contact us.');
            }
        });
    });
})();
