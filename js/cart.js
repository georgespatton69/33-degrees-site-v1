/**
 * 33 Degrees Cart System
 * localStorage cart + slide-out drawer
 */
(function() {
    'use strict';

    const CART_KEY = '33d_cart';
    const API_BASE = window.THIRTY3_API_BASE || 'https://web-production-a7a6.up.railway.app/api/v1';

    const ADDON_SLUG = 'bac-water';
    const ADDON_BLURB = 'Reconstitution solvent — often needed with peptides.';
    let addonProduct = null;

    async function fetchAddonProduct() {
        if (addonProduct !== null) return addonProduct;
        try {
            const res = await fetch(`${API_BASE}/products/${ADDON_SLUG}/`);
            addonProduct = res.ok ? await res.json() : false;
        } catch {
            addonProduct = false;
        }
        return addonProduct;
    }

    // ---- Cart Data ----

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCartDrawer();
    }

    function addToCart(productSlug, productName, variantId, variantSize, price, image) {
        const cart = getCart();
        const key = variantId || productSlug;
        const existing = cart.find(i => (i.variantId || i.productSlug) === key);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                productSlug,
                productName,
                variantId: variantId || null,
                variantSize: variantSize || null,
                price: parseFloat(price),
                image: image || null,
                quantity: 1,
            });
        }
        saveCart(cart);
        openCartDrawer();
    }

    function updateQuantity(index, quantity) {
        const cart = getCart();
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
        saveCart(cart);
    }

    function removeFromCart(index) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
    }

    function clearCart() {
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        renderCartDrawer();
    }

    function getCartTotal() {
        return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // ---- Cart Count Badge ----

    function updateCartCount() {
        const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? '' : 'none';
        });
    }

    // ---- Cart Drawer ----

    function createCartDrawer() {
        if (document.getElementById('cart-drawer')) return;

        const overlay = document.createElement('div');
        overlay.id = 'cart-overlay';
        overlay.addEventListener('click', closeCartDrawer);

        const drawer = document.createElement('div');
        drawer.id = 'cart-drawer';
        drawer.innerHTML = `
            <div class="cart-drawer-header">
                <h3>Your Cart</h3>
                <button class="cart-drawer-close" aria-label="Close cart">&times;</button>
            </div>
            <div class="cart-drawer-items"></div>
            <div class="cart-drawer-suggestion"></div>
            <div class="cart-drawer-footer">
                <div class="cart-drawer-total">
                    <span>Subtotal</span>
                    <span class="cart-total-amount">$0.00</span>
                </div>
                <button class="btn btn-primary cart-checkout-btn" disabled>Checkout</button>
                <p class="cart-drawer-note">Shipping calculated at checkout</p>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        drawer.querySelector('.cart-drawer-close').addEventListener('click', closeCartDrawer);
        drawer.querySelector('.cart-checkout-btn').addEventListener('click', () => {
            if (getCart().length === 0) return;
            window.location.href = '/checkout/';
        });
    }

    function renderCartDrawer() {
        const container = document.querySelector('.cart-drawer-items');
        if (!container) return;

        const cart = getCart();
        const total = getCartTotal();
        const checkoutBtn = document.querySelector('.cart-checkout-btn');

        if (cart.length === 0) {
            container.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            container.innerHTML = cart.map((item, i) => `
                <div class="cart-item">
                    ${item.image ? `<img src="${item.image}" alt="${item.productName}" class="cart-item-img">` : ''}
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.productName}</div>
                        ${item.variantSize ? `<div class="cart-item-variant">${item.variantSize}</div>` : ''}
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-minus" data-index="${i}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-index="${i}">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${i}">&times;</button>
                </div>
            `).join('');
            if (checkoutBtn) checkoutBtn.disabled = false;

            container.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), getCart()[parseInt(btn.dataset.index)].quantity - 1));
            });
            container.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.index), getCart()[parseInt(btn.dataset.index)].quantity + 1));
            });
            container.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
            });
        }

        const totalEl = document.querySelector('.cart-total-amount');
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

        renderSuggestion(cart);
    }

    async function renderSuggestion(cart) {
        const container = document.querySelector('.cart-drawer-suggestion');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '';
            return;
        }

        const product = await fetchAddonProduct();
        if (!product) {
            container.innerHTML = '';
            return;
        }

        const alreadyInCart = cart.some(i => i.productSlug === product.slug);
        if (alreadyInCart) {
            container.innerHTML = '';
            return;
        }

        const activeVariants = (product.variants || [])
            .filter(v => v.is_active)
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        if (activeVariants.length === 0) {
            container.innerHTML = '';
            return;
        }

        const image = `/assets/images/products/${product.slug}.webp`;
        const variantBtns = activeVariants.map(v => {
            const oos = !v.in_stock;
            return `<button class="cart-suggestion-add"
                            data-variant-id="${v.id}"
                            data-variant-size="${v.size}"
                            data-price="${v.price}"
                            ${oos ? 'disabled' : ''}
                            aria-label="Add ${v.size} ${product.name} to cart">
                + ${v.size} — $${parseFloat(v.price).toFixed(0)}${oos ? ' (Out of stock)' : ''}
            </button>`;
        }).join('');

        container.innerHTML = `
            <div class="cart-suggestion">
                <p class="cart-suggestion-label">You may also need</p>
                <div class="cart-suggestion-row">
                    <img src="${image}" alt="${product.name}" class="cart-suggestion-img">
                    <div class="cart-suggestion-info">
                        <div class="cart-suggestion-name">${product.name}</div>
                        <div class="cart-suggestion-blurb">${ADDON_BLURB}</div>
                    </div>
                </div>
                <div class="cart-suggestion-variants">${variantBtns}</div>
            </div>
        `;

        container.querySelectorAll('.cart-suggestion-add').forEach(btn => {
            if (btn.disabled) return;
            btn.addEventListener('click', () => {
                addToCart(
                    product.slug,
                    product.name,
                    btn.dataset.variantId,
                    btn.dataset.variantSize,
                    btn.dataset.price,
                    image,
                );
            });
        });
    }

    function openCartDrawer() {
        createCartDrawer();
        renderCartDrawer();
        document.getElementById('cart-overlay').classList.add('active');
        document.getElementById('cart-drawer').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        const overlay = document.getElementById('cart-overlay');
        const drawer = document.getElementById('cart-drawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ---- Initialize ----

    document.addEventListener('DOMContentLoaded', () => {
        updateCartCount();

        // Cart icon opens drawer
        document.querySelectorAll('.cart-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                openCartDrawer();
            });
        });
    });

    // Expose globally
    window.ThirtyThreeCart = { addToCart, getCart, clearCart, openCartDrawer, closeCartDrawer };
})();
