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

    // Set when the user successfully applies a coupon. Cleared on remove.
    // Shape: { code, discount_amount, new_subtotal, ... }
    let appliedCoupon = null;

    // Read current shipping method + cost from the checked radio row.
    // Data attributes on .shipping-method-row are the source of truth.
    function getSelectedShipping() {
        const row = document.querySelector('.shipping-method-row input[type="radio"]:checked');
        const label = row ? row.closest('.shipping-method-row') : document.querySelector('.shipping-method-row');
        if (!label) return { method: 'standard', cost: 8.95, name: 'Standard' };
        return {
            method: label.dataset.method || 'standard',
            cost: Number(label.dataset.cost || '8.95'),
            name: label.querySelector('.shipping-method-name') ? label.querySelector('.shipping-method-name').textContent : 'Standard',
        };
    }

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    }

    function formatMoney(n) {
        return '$' + Number(n).toFixed(2);
    }

    function cartSubtotal() {
        return getCart().reduce(function(sum, item) {
            return sum + (item.price * item.quantity);
        }, 0);
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
            renderDiscountLine(0);
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

        const discount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
        const shipping = getSelectedShipping();
        subtotalEl.textContent = formatMoney(subtotal);
        const shippingEl = document.getElementById('summary-shipping');
        const shippingLabelEl = document.getElementById('summary-shipping-method');
        if (shippingEl) shippingEl.textContent = formatMoney(shipping.cost);
        if (shippingLabelEl) shippingLabelEl.textContent = '(' + shipping.name + ')';
        totalEl.textContent = formatMoney(Math.max(0, subtotal - discount + shipping.cost));
        renderDiscountLine(discount);
    }

    function renderDiscountLine(discountAmount) {
        // Inject (or remove) a "Discount" line above the existing Shipping line
        const shippingLine = document.getElementById('summary-shipping');
        if (!shippingLine) return;
        const shippingRow = shippingLine.closest('.summary-line');
        if (!shippingRow) return;
        let row = document.getElementById('summary-discount-row');
        if (discountAmount > 0 && appliedCoupon) {
            if (!row) {
                row = document.createElement('div');
                row.className = 'summary-line';
                row.id = 'summary-discount-row';
                shippingRow.parentNode.insertBefore(row, shippingRow);
            }
            row.innerHTML =
                '<span>Discount (<button type="button" id="remove-coupon" ' +
                'style="background:none;border:none;color:#c9a759;cursor:pointer;text-decoration:underline;padding:0;font:inherit;">' +
                appliedCoupon.code + ' ✕</button>)</span>' +
                '<span style="color:#7ec288;">−' + formatMoney(discountAmount) + '</span>';
            const removeBtn = document.getElementById('remove-coupon');
            if (removeBtn) removeBtn.addEventListener('click', removeCoupon);
        } else if (row) {
            row.remove();
        }
    }

    async function applyCoupon(code) {
        const errEl = document.getElementById('discount-error');
        if (errEl) errEl.textContent = '';
        try {
            const res = await fetch(API_BASE + '/coupon/apply/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, subtotal: cartSubtotal().toFixed(2) }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (errEl) errEl.textContent = data.error || 'Invalid coupon code.';
                return;
            }
            appliedCoupon = data;
            renderSummary();
        } catch (err) {
            if (errEl) errEl.textContent = 'Could not validate coupon. Try again.';
        }
    }

    function removeCoupon() {
        appliedCoupon = null;
        const input = document.getElementById('discount-code');
        if (input) input.value = '';
        const errEl = document.getElementById('discount-error');
        if (errEl) errEl.textContent = '';
        renderSummary();
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

    function getAffiliateRef() {
        const cookie = document.cookie
            .split('; ')
            .find(function(c) { return c.startsWith('affiliate_ref='); });
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
    }

    async function submitOrder(data, items) {
        const payload = Object.assign({}, data, {
            items: items,
            processor: 'quickbooks',
            coupon_code: appliedCoupon ? appliedCoupon.code : '',
            ref: getAffiliateRef(),
            shipping_method: getSelectedShipping().method,
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

        // Shipping method radio toggle → update summary total live.
        // Also updates .selected class on rows so the border highlight tracks
        // the actual checked radio (matches the CSS :has(input:checked) fallback).
        document.querySelectorAll('.shipping-method-row input[type="radio"]').forEach(function(r) {
            r.addEventListener('change', function() {
                document.querySelectorAll('.shipping-method-row').forEach(function(row) {
                    row.classList.remove('selected');
                });
                const row = r.closest('.shipping-method-row');
                if (row) row.classList.add('selected');
                renderSummary();
            });
        });

        // Discount / coupon code
        const applyBtn = document.getElementById('apply-discount');
        const codeInput = document.getElementById('discount-code');
        if (applyBtn && codeInput) {
            applyBtn.addEventListener('click', function() {
                const code = codeInput.value.trim();
                if (!code) return;
                applyCoupon(code);
            });
            // Apply on Enter key in the input field
            codeInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyBtn.click();
                }
            });
        }

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
