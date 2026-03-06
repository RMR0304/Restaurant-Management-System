class CustomerServices {
    static getCart() {
        return Storage.getActiveCart() || [];
    }

    static setCart(cart) {
        Storage.setActiveCart(cart);
        CustomerServices.updateCartCount();
    }

    static updateCartCount() {
        const cart = CustomerServices.getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Update any cart badges on the UI
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }

        const cartCountDisplay = document.getElementById('cartItemsCount');
        if (cartCountDisplay) cartCountDisplay.textContent = `${count} Items`;
    }

    static addToCart(itemId) {
        const menu = Storage.get('menu');
        const item = menu.find(m => m.id === itemId);
        if (!item || item.stock <= 0) {
            UI.showToast('Item out of stock', 'error');
            return;
        }

        const cart = CustomerServices.getCart();
        const existing = cart.find(c => c.menuItem.id === itemId);

        if (existing) {
            if (existing.quantity >= item.stock) {
                UI.showToast('Max stock reached', 'error');
                return;
            }
            existing.quantity++;
        } else {
            cart.push({ menuItem: item, quantity: 1 });
        }

        CustomerServices.setCart(cart);
        UI.showToast('Added to cart', 'success');
    }

    static renderMenu(category = 'All') {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;

        const menu = Storage.get('menu');
        menuGrid.innerHTML = '';

        const filtered = category === 'All' ? menu : menu.filter(m => m.category === category);

        if (filtered.length === 0) {
            menuGrid.innerHTML = '<p>No items found.</p>';
            return;
        }

        filtered.forEach(item => {
            const outOfStock = item.stock <= 0;
            const card = document.createElement('div');
            card.className = 'menu-card glass';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-img ${outOfStock ? 'grayscale' : ''}">
                <div class="menu-info">
                    <div class="menu-title">${item.name}</div>
                    <div class="menu-category">${item.category}</div>
                    <div class="menu-meta">
                        <span><i class="fas fa-star" style="color:#ffc107"></i> ${item.rating}</span>
                        <span style="color:${outOfStock ? 'var(--error)' : 'inherit'}">${outOfStock ? 'Out of Stock' : 'Stock: ' + item.stock}</span>
                    </div>
                    <div class="menu-price">Rs. ${item.price.toFixed(2)}</div>
                    <button class="glass-btn ${outOfStock ? 'disabled' : ''}" onclick="CustomerServices.addToCart('${item.id}')" ${outOfStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    static initMenu() {
        const menu = Storage.get('menu');
        const categories = ['All', ...new Set(menu.map(m => m.category))];
        const catContainer = document.getElementById('categoryContainer');

        categories.forEach((cat, index) => {
            const btn = document.createElement('div');
            btn.className = `glass-btn category-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = cat;
            btn.onclick = () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                CustomerServices.renderMenu(cat);
            };
            catContainer.appendChild(btn);
        });

        CustomerServices.renderMenu();
        CustomerServices.updateCartCount();
    }

    // Specifically for dashboard.html
    static updateDashboard() {
        CustomerServices.updateCartCount();
        const user = Storage.get('currentUser');
        if (!user || user.role !== 'customer') return;

        // Auto-link any guest orders that used this phone number.
        Storage.linkGuestOrdersToUserByPhone(user.phone, user.id);
        let orders = Storage.get('orders') || [];

        const myOrders = orders
            .filter(o => (o.customerUserId || o.customerId) === user.id)
            .sort((a, b) => b.timestamp - a.timestamp);

        const points = user.loyaltyPoints || 0;
        const display = document.getElementById('pointsDisplay');
        if (display) display.textContent = points;

        const totalDisplay = document.getElementById('totalOrdersCount');
        if (totalDisplay) totalDisplay.textContent = `${myOrders.length} Orders`;

        const tbody = document.querySelector('#recentActivityTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            const recent = myOrders.slice(0, 5);
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent activity</td></tr>';
            } else {
                recent.forEach(order => {
                    const statusClass = order.status.toLowerCase();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>#${order.id.slice(-6)}</td>
                        <td>${new Date(order.timestamp).toLocaleDateString()}</td>
                        <td>${order.items.length} items</td>
                        <td><span class="badge ${statusClass}">${order.status}</span></td>
                        <td>Rs. ${order.totalAmount.toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    }
}
