(function () {
    var CART_KEY = 'pizzaLuigiCart';
    var cart = loadCart();
    var deliveryFee = 0;
    var categories = [];
    var activeCategoryId = null;

    function loadCart() {
        try {
            var raw = sessionStorage.getItem(CART_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            // Carts saved before addon support shipped have no cartLineId/addons -
            // patch them up rather than let the qty/remove buttons break on them.
            return parsed.map(function (line) {
                if (line.cartLineId) return line;
                return Object.assign({}, line, { cartLineId: line.id, addons: line.addons || [] });
            });
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        try {
            sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            // sessionStorage unavailable (private mode, etc.) - cart just won't persist across reloads
        }
    }

    function formatPrice(n) {
        return '€' + Number(n).toFixed(2).replace('.', ',');
    }

    // Category photos might get saved as .jpg, .webp, .png, whatever the
    // source file happened to be - try each in turn rather than assuming one
    // extension, so any format just works once dropped in the folder.
    var IMAGE_EXTENSIONS = ['jpg', 'webp', 'png', 'jpeg'];
    var resolvedImageCache = {};

    function resolveCategoryImage(slug, callback) {
        if (!slug) { callback(null); return; }
        if (resolvedImageCache.hasOwnProperty(slug)) { callback(resolvedImageCache[slug]); return; }
        var i = 0;
        function tryNext() {
            if (i >= IMAGE_EXTENSIONS.length) {
                resolvedImageCache[slug] = null;
                callback(null);
                return;
            }
            var url = 'assets/img/categories/' + slug + '.' + IMAGE_EXTENSIONS[i];
            var probe = new Image();
            probe.onload = function () {
                resolvedImageCache[slug] = url;
                callback(url);
            };
            probe.onerror = function () {
                i += 1;
                tryNext();
            };
            probe.src = url;
        }
        tryNext();
    }

    // The theme already ships a food-icon font (assets/css/food-icon.css) with
    // these glyphs - match a category to one by keyword so every category gets
    // a sensible icon automatically, without needing anything from FloCafe
    // (which has no icon picker of its own).
    var CATEGORY_ICON_RULES = [
        { keywords: ['pizza', 'calzone'], icon: 'fi-pizza-slice' },
        { keywords: ['pasta', 'nudel', 'spaghetti', 'noodle'], icon: 'fi-noodles' },
        { keywords: ['burger'], icon: 'fi-burger' },
        { keywords: ['pommes', 'fries', 'chips', 'kartoffel'], icon: 'fi-french-fries' },
        { keywords: ['getr', 'drink', 'cola', 'soda', 'saft'], icon: 'fi-soda' },
        { keywords: ['kaffee', 'coffee', 'espresso'], icon: 'fi-coffee' },
        { keywords: ['tee', 'tea'], icon: 'fi-tea' },
        { keywords: ['bier', 'beer'], icon: 'fi-beer' },
        { keywords: ['dessert', 'eis', 'ice cream', 'waffel', 'waffle'], icon: 'fi-ice-cream' },
        { keywords: ['huhn', 'chicken', 'hähnchen', 'haehnchen'], icon: 'fi-fried-chicken' },
        { keywords: ['fleisch', 'meat', 'steak'], icon: 'fi-meat' },
        { keywords: ['kebab', 'döner', 'doener'], icon: 'fi-kebab' },
        { keywords: ['brot', 'bread', 'croissant', 'frühstück', 'breakfast'], icon: 'fi-croissant' },
        { keywords: ['reis', 'rice'], icon: 'fi-rice' },
        { keywords: ['salat', 'salad', 'insalate', 'vorspeise', 'starter'], icon: 'fi-serving-dish' },
    ];

    function resolveCategoryIcon(name) {
        var lower = (name || '').toLowerCase();
        for (var i = 0; i < CATEGORY_ICON_RULES.length; i++) {
            var rule = CATEGORY_ICON_RULES[i];
            for (var j = 0; j < rule.keywords.length; j++) {
                if (lower.indexOf(rule.keywords[j]) !== -1) return rule.icon;
            }
        }
        return 'fi-fork';
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function applyTranslations() {
        if (window.applySiteLanguage) window.applySiteLanguage();
    }

    var CONFETTI_COLORS = ['#ff8e28', '#ff9d2d', '#0e1318', '#25D366', '#ffd166', '#ef476f'];
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Little celebratory burst played from wherever the "add to cart" click
    // happened - particles are fixed-positioned and appended to <body>
    // itself (not the button's own parent), so they keep flying/fading even
    // if that button's popup/row disappears a moment later.
    function burstConfetti(originEl) {
        if (prefersReducedMotion || !originEl || !originEl.getBoundingClientRect) return;
        var rect = originEl.getBoundingClientRect();
        var originX = rect.left + rect.width / 2;
        var originY = rect.top + rect.height / 2;
        var count = 16;

        for (var i = 0; i < count; i++) {
            var particle = document.createElement('span');
            particle.className = 'confetti-particle';
            var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
            var distance = 55 + Math.random() * 55;
            var dx = Math.cos(angle) * distance;
            var dy = Math.sin(angle) * distance;
            particle.style.left = originX + 'px';
            particle.style.top = originY + 'px';
            particle.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
            particle.addEventListener('animationend', function () { this.remove(); });
            document.body.appendChild(particle);
        }
    }

    // Each cart line is one specific product + one specific set of chosen
    // extra ingredients - two orders of the same salad with different extras
    // must stay as separate lines, so the merge key includes the addon
    // selection, not just the product id.
    function addonSignature(addons) {
        if (!addons || addons.length === 0) return '';
        return addons
            .map(function (a) { return a.groupId + ':' + a.name; })
            .sort()
            .join('|');
    }

    function lineUnitPrice(cartLine) {
        var addonsTotal = (cartLine.addons || []).reduce(function (sum, a) { return sum + a.price; }, 0);
        return cartLine.price + addonsTotal;
    }

    function findCartLine(cartLineId) {
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].cartLineId === cartLineId) return cart[i];
        }
        return null;
    }

    function addToCart(item, addons) {
        var selectedAddons = addons || [];
        var cartLineId = item.id + '::' + addonSignature(selectedAddons);
        var existing = findCartLine(cartLineId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                cartLineId: cartLineId,
                id: item.id,
                name: item.name,
                price: item.price,
                qty: 1,
                addons: selectedAddons,
            });
        }
        saveCart();
        renderCart();
        renderCartBar();
    }

    function changeQty(cartLineId, delta) {
        var existing = findCartLine(cartLineId);
        if (!existing) return;
        existing.qty += delta;
        if (existing.qty <= 0) {
            cart = cart.filter(function (i) { return i.cartLineId !== cartLineId; });
        }
        saveCart();
        renderCart();
        renderCartBar();
    }

    function removeItem(cartLineId) {
        cart = cart.filter(function (i) { return i.cartLineId !== cartLineId; });
        saveCart();
        renderCart();
        renderCartBar();
    }

    function getOrderType() {
        var checked = document.querySelector('input[name="order-type"]:checked');
        return checked ? checked.value : 'takeaway';
    }

    function cartTotals() {
        var subtotal = cart.reduce(function (sum, item) { return sum + lineUnitPrice(item) * item.qty; }, 0);
        var orderType = getOrderType();
        var deliveryAmount = orderType === 'delivery' ? deliveryFee : 0;
        var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
        return { subtotal: subtotal, deliveryAmount: deliveryAmount, total: subtotal + deliveryAmount, count: count };
    }

    // Floating bottom bar: shows a running count/total and is the only way to
    // open the cart, on both mobile and desktop.
    function renderCartBar() {
        var bar = document.getElementById('cart-bar');
        var summaryEl = document.getElementById('cart-bar-summary');
        var confirmationEl = document.getElementById('order-confirmation');
        var confirmationShowing = confirmationEl.style.display !== 'none';

        if (cart.length === 0 || confirmationShowing) {
            bar.style.display = 'none';
            return;
        }

        var totals = cartTotals();
        var isGerman = (localStorage.getItem('site-lang') || 'de') === 'de';
        var itemsLabel = isGerman
            ? (totals.count === 1 ? 'Artikel' : 'Artikel')
            : (totals.count === 1 ? 'item' : 'items');
        summaryEl.textContent = totals.count + ' ' + itemsLabel + ' · ' + formatPrice(totals.total);
        bar.style.display = '';
        applyTranslations();
    }

    function openCart() {
        document.getElementById('cart-overlay').style.display = '';
        document.body.classList.add('cart-open');
    }

    function closeCart() {
        document.getElementById('cart-overlay').style.display = 'none';
        document.body.classList.remove('cart-open');
    }

    function renderCart() {
        var itemsEl = document.getElementById('cart-items');
        var emptyEl = document.getElementById('cart-empty');
        var summaryEl = document.getElementById('cart-summary');
        var formEl = document.getElementById('checkout-form');
        var confirmationEl = document.getElementById('order-confirmation');

        if (confirmationEl.style.display !== 'none') {
            return;
        }

        if (cart.length === 0) {
            emptyEl.style.display = '';
            itemsEl.innerHTML = '';
            summaryEl.style.display = 'none';
            formEl.style.display = 'none';
            return;
        }

        emptyEl.style.display = 'none';
        summaryEl.style.display = '';
        formEl.style.display = '';

        itemsEl.innerHTML = cart.map(function (item) {
            var addonsHtml = (item.addons && item.addons.length)
                ? '<span class="cart-item-addons">+ ' + escapeHtml(item.addons.map(function (a) { return a.name; }).join(', ')) + '</span>'
                : '';
            return (
                '<li data-line-id="' + escapeHtml(item.cartLineId) + '">' +
                    '<span class="cart-item-name">' + escapeHtml(item.name) + addonsHtml + '</span>' +
                    '<span class="cart-item-controls">' +
                        '<button type="button" class="qty-btn" data-action="dec">&minus;</button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button type="button" class="qty-btn" data-action="inc">+</button>' +
                        '<span>' + formatPrice(lineUnitPrice(item) * item.qty) + '</span>' +
                        '<button type="button" class="remove-item-btn" data-action="remove" aria-label="Remove">&times;</button>' +
                    '</span>' +
                '</li>'
            );
        }).join('');

        var totals = cartTotals();
        var deliveryRow = document.getElementById('cart-delivery-row');

        document.getElementById('cart-subtotal').textContent = formatPrice(totals.subtotal);
        if (totals.deliveryAmount > 0) {
            deliveryRow.style.display = '';
            document.getElementById('cart-delivery-fee').textContent = formatPrice(totals.deliveryAmount);
        } else {
            deliveryRow.style.display = 'none';
        }
        document.getElementById('cart-total-amount').textContent = formatPrice(totals.total);
        applyTranslations();
    }

    function renderCategoryTabs() {
        var tabsEl = document.getElementById('category-tabs');
        if (categories.length <= 1) {
            tabsEl.innerHTML = '';
            tabsEl.style.display = 'none';
            return;
        }
        tabsEl.style.display = '';
        tabsEl.innerHTML = categories.map(function (category) {
            var activeClass = category.id === activeCategoryId ? ' active' : '';
            var iconClass = resolveCategoryIcon(category.name);
            return (
                '<button type="button" class="category-tab' + activeClass + '" data-category-id="' + escapeHtml(category.id) + '">' +
                    '<span class="category-tab-icon"><i class="fi ' + iconClass + '"></i></span>' +
                    '<span class="category-tab-name">' + escapeHtml(category.name) + '</span>' +
                '</button>'
            );
        }).join('');

        Array.prototype.forEach.call(tabsEl.querySelectorAll('.category-tab'), function (btn) {
            btn.addEventListener('click', function () {
                activeCategoryId = btn.getAttribute('data-category-id');
                renderCategoryTabs();
                renderActiveCategoryItems();
            });
        });
    }

    function renderActiveCategoryItems() {
        var container = document.getElementById('menu-categories');
        var category = categories.find(function (c) { return c.id === activeCategoryId; }) || categories[0];
        if (!category) {
            container.innerHTML = '';
            return;
        }

        var itemsHtml = category.items.map(function (item) {
            var descriptionHtml = item.description
                ? '<span class="menu-item-description">' + escapeHtml(item.description) + '</span>'
                : '';
            return (
                '<div class="menu-item-row" data-id="' + escapeHtml(item.id) + '">' +
                    '<div class="menu-item-info">' +
                        '<span class="menu-item-name">' + escapeHtml(item.name) + '</span> ' +
                        '<span class="menu-item-price">' + formatPrice(item.price) + '</span>' +
                        descriptionHtml +
                    '</div>' +
                    '<button type="button" class="menu-item-add-btn" data-action="add">Add To Cart</button>' +
                '</div>'
            );
        }).join('');

        var imageHtml = category.slug
            ? '<img class="category-banner-image" alt="" style="display:none;">'
            : '';
        var descriptionHtml2 = category.description
            ? '<p class="category-banner-description">' + escapeHtml(category.description) + '</p>'
            : '';
        var bannerBlock =
            '<div class="category-banner">' +
                imageHtml +
                '<div class="category-banner-overlay"></div>' +
                '<div class="category-banner-content">' +
                    '<h2 class="category-banner-title">' + escapeHtml(category.name) + '</h2>' +
                    descriptionHtml2 +
                '</div>' +
            '</div>';

        container.innerHTML = '<div class="menu-category">' + bannerBlock + itemsHtml + '</div>';

        if (category.slug) {
            var bannerImg = container.querySelector('.category-banner-image');
            resolveCategoryImage(category.slug, function (url) {
                if (url && bannerImg) {
                    bannerImg.src = url;
                    bannerImg.style.display = '';
                }
            });
        }

        Array.prototype.forEach.call(container.querySelectorAll('.menu-item-row'), function (row) {
            var id = row.getAttribute('data-id');
            var item = category.items.find(function (i) { return i.id === id; });
            var addBtn = row.querySelector('[data-action="add"]');
            addBtn.addEventListener('click', function () {
                if (category.addonGroups && category.addonGroups.length > 0) {
                    openAddonModal(item, category);
                } else {
                    addToCart(item);
                    burstConfetti(addBtn);
                }
            });
        });

        applyTranslations();
    }

    var ADDON_GROUP_LABELS = ['Extra Ingredients', 'Premium Ingredients'];
    var currentAddonModalItem = null;

    function addonGroupLabel(index) {
        return ADDON_GROUP_LABELS[index] || ('Extra Ingredients ' + (index + 1));
    }

    function updateAddonModalTotal(item) {
        var checkboxes = document.querySelectorAll('#addon-modal-groups input[type="checkbox"]:checked');
        var addonsTotal = 0;
        Array.prototype.forEach.call(checkboxes, function (cb) {
            addonsTotal += Number(cb.getAttribute('data-price'));
        });
        document.getElementById('addon-modal-total').textContent = formatPrice(item.price + addonsTotal);
    }

    function openAddonModal(item, category) {
        currentAddonModalItem = item;

        document.getElementById('addon-modal-subtitle').textContent = item.name;

        var groupsHtml = category.addonGroups.map(function (group, groupIndex) {
            var optionsHtml = group.ingredients.map(function (ingredientName) {
                return (
                    '<label class="addon-modal-option">' +
                        '<input type="checkbox" data-group-id="' + escapeHtml(group.id) + '" data-price="' + group.price + '" data-name="' + escapeHtml(ingredientName) + '">' +
                        '<span class="addon-modal-option-name">' + escapeHtml(ingredientName) + '</span>' +
                        '<span class="addon-modal-option-price">+' + formatPrice(group.price) + '</span>' +
                    '</label>'
                );
            }).join('');

            return (
                '<div class="addon-modal-group">' +
                    '<div class="addon-modal-group-title"><span>' + escapeHtml(addonGroupLabel(groupIndex)) + '</span> ' +
                        '<span class="addon-modal-group-price">+' + formatPrice(group.price) + '</span></div>' +
                    optionsHtml +
                '</div>'
            );
        }).join('');

        document.getElementById('addon-modal-groups').innerHTML = groupsHtml;

        Array.prototype.forEach.call(document.querySelectorAll('#addon-modal-groups input[type="checkbox"]'), function (cb) {
            cb.addEventListener('change', function () { updateAddonModalTotal(item); });
        });

        updateAddonModalTotal(item);
        applyTranslations();

        var scrollArea = document.querySelector('.addon-modal-scroll');
        if (scrollArea) scrollArea.scrollTop = 0;

        document.getElementById('addon-modal-overlay').style.display = '';
        document.body.classList.add('cart-open');
    }

    function closeAddonModal() {
        document.getElementById('addon-modal-overlay').style.display = 'none';
        document.body.classList.remove('cart-open');
        currentAddonModalItem = null;
    }

    function confirmAddonModal() {
        if (!currentAddonModalItem) return;
        var checkboxes = document.querySelectorAll('#addon-modal-groups input[type="checkbox"]:checked');
        var addons = Array.prototype.map.call(checkboxes, function (cb) {
            return {
                groupId: cb.getAttribute('data-group-id'),
                price: Number(cb.getAttribute('data-price')),
                name: cb.getAttribute('data-name'),
            };
        });
        // Burst from the button before the popup closes underneath it, so
        // the animation actually has something visible to start from.
        burstConfetti(document.getElementById('addon-modal-add'));
        addToCart(currentAddonModalItem, addons);
        closeAddonModal();
    }

    function initAddonModalEvents() {
        document.getElementById('addon-modal-close').addEventListener('click', closeAddonModal);
        document.getElementById('addon-modal-backdrop').addEventListener('click', closeAddonModal);
        document.getElementById('addon-modal-add').addEventListener('click', confirmAddonModal);
    }

    function renderMenu(loadedCategories) {
        var emptyEl = document.getElementById('menu-empty');
        categories = loadedCategories || [];

        if (categories.length === 0) {
            emptyEl.style.display = '';
            return;
        }

        // Keep whatever category the visitor already has open (e.g. they
        // clicked to "Pizza" while the cached menu was showing, then the
        // fresh fetch landed) - only reset if there's no valid selection yet.
        var stillExists = categories.some(function (c) { return c.id === activeCategoryId; });
        if (!stillExists) {
            activeCategoryId = categories[0].id;
        }
        renderCategoryTabs();
        renderActiveCategoryItems();
    }

    var MENU_CACHE_KEY = 'pizzaLuigiMenuCache';
    // Bump this whenever the shape of what /api/menu returns changes (e.g.
    // adding addonGroups) - otherwise a visitor's old cached menu from
    // before the change keeps getting instant-painted forever, since
    // localStorage persists indefinitely unlike the cart's sessionStorage.
    var MENU_CACHE_VERSION = 2;

    // Paints the last-known menu instantly (no spinner) from a prior visit,
    // while loadMenu() still fetches fresh data underneath to reconcile any
    // changes - the menu rarely changes minute-to-minute, so this is safe.
    function paintCachedMenu() {
        try {
            var raw = localStorage.getItem(MENU_CACHE_KEY);
            if (!raw) return false;
            var data = JSON.parse(raw);
            if (!data || data.version !== MENU_CACHE_VERSION || !data.categories || data.categories.length === 0) return false;
            document.getElementById('menu-loading').style.display = 'none';
            deliveryFee = Number(data.delivery_fee || 0);
            renderMenu(data.categories);
            return true;
        } catch (e) {
            return false;
        }
    }

    function cacheMenu(data) {
        try {
            var withVersion = Object.assign({}, data, { version: MENU_CACHE_VERSION });
            localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(withVersion));
        } catch (e) {
            // localStorage unavailable/full - just skip caching, no functional impact
        }
    }

    function loadMenu() {
        var paintedFromCache = paintCachedMenu();
        fetch('/api/menu')
            .then(function (res) {
                if (!res.ok) throw new Error('menu fetch failed');
                return res.json();
            })
            .then(function (data) {
                document.getElementById('menu-loading').style.display = 'none';
                deliveryFee = Number(data.delivery_fee || 0);
                renderMenu(data.categories);
                renderCart();
                renderCartBar();
                cacheMenu(data);
            })
            .catch(function () {
                document.getElementById('menu-loading').style.display = 'none';
                // Only show the "call us" fallback if there's nothing at all
                // on screen - a cached menu from last visit is still useful
                // even if this particular refresh failed.
                if (!paintedFromCache) {
                    document.getElementById('menu-error').style.display = '';
                }
            });
    }

    function setSubmitLoading(isLoading) {
        var submitBtn = document.getElementById('checkout-submit');
        var label = submitBtn.querySelector('.btn-label');
        submitBtn.disabled = isLoading;
        label.textContent = isLoading ? 'Placing order…' : 'Place Order';
    }

    // FloCafe has no way to charge a custom per-order-item price, so each
    // chosen extra ingredient is sent as its own line using the real,
    // already-priced/taxed catalog product for that ingredient's price tier
    // (quantity = how many extras were picked at that tier) - that's what
    // makes the total FloCafe records/prints correct. The specific
    // ingredient names go out as that line's Bemerkung/special_instructions
    // so the kitchen knows exactly what to add.
    function buildOrderItems() {
        var orderItems = [];
        cart.forEach(function (line) {
            orderItems.push({ product_id: line.id, quantity: line.qty });

            var addonsByGroup = {};
            (line.addons || []).forEach(function (addon) {
                if (!addonsByGroup[addon.groupId]) addonsByGroup[addon.groupId] = [];
                addonsByGroup[addon.groupId].push(addon.name);
            });

            Object.keys(addonsByGroup).forEach(function (groupId) {
                var names = addonsByGroup[groupId];
                orderItems.push({
                    product_id: groupId,
                    quantity: names.length * line.qty,
                    notes: 'Extra: ' + names.join(', ') + ' (für ' + line.name + ')',
                });
            });
        });
        return orderItems;
    }

    function submitOrder() {
        var errorEl = document.getElementById('checkout-error');
        errorEl.style.display = 'none';

        var payload = {
            name: document.getElementById('checkout-name').value.trim(),
            phone: document.getElementById('checkout-phone').value.trim(),
            type: getOrderType(),
            address: document.getElementById('checkout-address').value.trim(),
            notes: document.getElementById('checkout-notes').value.trim(),
            items: buildOrderItems(),
        };

        setSubmitLoading(true);

        fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (result) {
                if (!result.ok) {
                    throw new Error((result.data && result.data.error) || 'Order failed');
                }
                cart = [];
                saveCart();
                document.getElementById('checkout-form').style.display = 'none';
                document.getElementById('cart-summary').style.display = 'none';
                document.getElementById('cart-items').innerHTML = '';
                document.getElementById('confirmed-order-number').textContent = result.data.order_number || '';
                document.getElementById('order-confirmation').style.display = '';
                renderCartBar();
                applyTranslations();
            })
            .catch(function (err) {
                errorEl.textContent = err.message + ' — or call us at +49 5042 9860194.';
                errorEl.style.display = '';
            })
            .finally(function () {
                setSubmitLoading(false);
            });
    }

    // Real touchscreens scroll a horizontally-overflowing row natively; a
    // mouse click-and-drag does not (no scrollbar drag, no touch gesture),
    // which is exactly what Chrome DevTools' plain "Responsive" resize mode
    // uses to test mobile layouts on a desktop. This makes the strip
    // draggable with the mouse too, everywhere, at no cost to touch devices.
    function initCategoryDragScroll() {
        var el = document.getElementById('category-tabs');
        var isDown = false;
        var startX = 0;
        var startScrollLeft = 0;
        var moved = false;

        el.addEventListener('mousedown', function (e) {
            isDown = true;
            moved = false;
            startX = e.pageX;
            startScrollLeft = el.scrollLeft;
            el.classList.add('dragging');
        });

        window.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var dx = e.pageX - startX;
            if (Math.abs(dx) > 3) moved = true;
            el.scrollLeft = startScrollLeft - dx;
        });

        window.addEventListener('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            el.classList.remove('dragging');
        });

        // A drag that actually moved the strip shouldn't also fire the
        // category button's click handler underneath the cursor.
        el.addEventListener('click', function (e) {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);
    }

    function initCartEvents() {
        document.getElementById('cart-items').addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('button[data-action]') : null;
            if (!btn) return;
            var li = btn.closest('li');
            if (!li) return;
            var lineId = li.getAttribute('data-line-id');
            var action = btn.getAttribute('data-action');
            if (action === 'inc') changeQty(lineId, 1);
            if (action === 'dec') changeQty(lineId, -1);
            if (action === 'remove') removeItem(lineId);
        });

        Array.prototype.forEach.call(document.querySelectorAll('input[name="order-type"]'), function (radio) {
            radio.addEventListener('change', function () {
                var addressWrap = document.getElementById('delivery-address-wrap');
                var addressInput = document.getElementById('checkout-address');
                if (radio.checked && radio.value === 'delivery') {
                    addressWrap.style.display = '';
                    addressInput.setAttribute('required', 'required');
                } else if (radio.checked) {
                    addressWrap.style.display = 'none';
                    addressInput.removeAttribute('required');
                }
                renderCart();
                renderCartBar();
            });
        });

        document.getElementById('checkout-form').addEventListener('submit', function (e) {
            e.preventDefault();
            submitOrder();
        });

        // The bar's "N items · €X" text is composed dynamically, so the static
        // dictionary-based translator can't match it - refresh it ourselves
        // whenever the language toggle is used.
        Array.prototype.forEach.call(document.querySelectorAll('.lang-switcher .lang-btn'), function (btn) {
            btn.addEventListener('click', renderCartBar);
        });

        document.getElementById('cart-bar-open').addEventListener('click', openCart);
        document.getElementById('cart-overlay-close').addEventListener('click', closeCart);
        document.getElementById('cart-overlay-backdrop').addEventListener('click', closeCart);
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (currentAddonModalItem) closeAddonModal();
            else closeCart();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.getElementById('menu-categories')) return;
        initCartEvents();
        initAddonModalEvents();
        initCategoryDragScroll();
        renderCart();
        renderCartBar();
        loadMenu();
    });
})();
