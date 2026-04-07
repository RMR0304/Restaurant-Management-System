class AdminServices {
    static getStats() {
        const users = Storage.get('users');
        const orders = Storage.get('orders');
        const menu = Storage.get('menu');

        const today = new Date().setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(o => o.timestamp >= today);

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // Find top selling item
        const itemSales = {};
        orders.forEach(o => {
            o.items.forEach(i => {
                itemSales[i.menuItem.id] = (itemSales[i.menuItem.id] || 0) + i.quantity;
            });
        });

        let topItem = null;
        let maxSales = 0;
        for (let id in itemSales) {
            if (itemSales[id] > maxSales) {
                maxSales = itemSales[id];
                topItem = menu.find(m => m.id === id);
            }
        }

        return {
            totalUsers: users.length,
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            totalRevenue,
            todayRevenue,
            topItem: topItem ? topItem.name : 'N/A'
        };
    }

    static handleEmployeeAction(action, data) {
        // Handle add/edit/delete employee from admin panel
        let users = Storage.get('users');
        if (action === 'add') {
            // simplified logic
            users.push(data);
            UI.showToast('Employee Added', 'success');
        } else if (action === 'delete') {
            users = users.filter(u => u.phone !== data.phone);
            UI.showToast('Employee Removed', 'info');
        }
        Storage.set('users', users);
    }

    static initMenu() {
        // Admin menu specific features (Edit stock, price)
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;

        // Setup action listeners
        AdminServices.setupMenuControls();
        AdminServices.renderAdminMenu();
    }

    static renderAdminMenu() {
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;

        const menu = Storage.get('menu');
        menuGrid.innerHTML = '';

        menu.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card glass';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-img">
                <div class="menu-info">
                    <div class="menu-title">${item.name}</div>
                    <div class="menu-category">${item.category}</div>
                    <div class="menu-price">Rs. ${item.price.toFixed(2)}</div>
                    
                    <div style="margin-top: 10px;">
                        <label>Stock: </label>
                        <input type="number" class="glass-input" value="${item.stock}" style="width: 60px; padding: 5px;" onchange="AdminServices.updateStock('${item.id}', this.value)">
                    </div>
                    
                    <div style="display: flex; gap:10px; margin-top: 15px;">
                        <button class="glass-btn" style="flex:1" onclick="AdminServices.editItem('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="glass-btn" style="color:var(--error); border-color:var(--error); flex:1;" onclick="AdminServices.deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    static setupMenuControls() {
        const currentUser = Storage.get('currentUser');
        if (currentUser.role === 'admin' || currentUser.role === 'kitchen') {
            const searchBar = document.querySelector('.search-bar');
            if (searchBar && !document.getElementById('addMenuItemBtn')) {
                const addBtn = document.createElement('button');
                addBtn.id = 'addMenuItemBtn';
                addBtn.className = 'glass-btn';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
                addBtn.style.marginLeft = '10px';
                addBtn.onclick = () => AdminServices.showAddModal();
                searchBar.appendChild(addBtn);
            }
        }
    }

    static showAddModal() {
        let modal = document.getElementById('itemModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'itemModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content glass">
                    <div class="modal-header">
                        <h2 id="itemModalTitle">Add Menu Item</h2>
                        <button class="close-btn" onclick="UI.closeModal('itemModal')">×</button>
                    </div>
                    <form id="itemForm" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="itemMode" value="add">
                        <input type="hidden" id="itemId">
                        <input type="text" id="itemName" class="glass-input" placeholder="Item Name" required>
                        <input type="text" id="itemCategory" class="glass-input" placeholder="Category" required>
                        <input type="number" id="itemPrice" class="glass-input" placeholder="Price" step="0.01" required>
                        <input type="number" id="itemStock" class="glass-input" placeholder="Stock Quantity" required>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-size: 0.9em; color: var(--text-muted, #ccc);">Item Image</label>
                            <div id="dropZone" style="border: 2px dashed var(--glass-border); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; background: rgba(255,255,255,0.02); min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
                                <span style="font-size: 0.9em; color: var(--text-secondary);">Click or Drag & Drop image here</span>
                                <input type="file" id="itemImageFile" accept="image/*" style="opacity: 0; position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer;">
                            </div>
                            <input type="hidden" id="itemImage">
                            <img id="itemImagePreview" style="max-height: 100px; display: none; object-fit: cover; border-radius: 8px; margin-top: 10px;">
                        </div>
                        <button type="submit" class="glass-btn" style="margin-top: 10px;">Save changes</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            const dropZone = document.getElementById('dropZone');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });
            function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => dropZone.style.background = 'rgba(255,255,255,0.1)', false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => dropZone.style.background = 'rgba(255,255,255,0.02)', false);
            });
            
            dropZone.addEventListener('drop', handleDrop, false);
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files && files[0]) {
                    processImageFile(files[0]);
                }
            }
            
            function processImageFile(file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        document.getElementById('itemImage').value = evt.target.result;
                        document.getElementById('itemImagePreview').src = evt.target.result;
                        document.getElementById('itemImagePreview').style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            }

            document.getElementById('itemImageFile').addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                }
            });

            document.getElementById('itemForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const mode = document.getElementById('itemMode').value;
                const id = document.getElementById('itemId').value || 'm' + Date.now();

                const newItem = {
                    id: id,
                    name: document.getElementById('itemName').value,
                    category: document.getElementById('itemCategory').value,
                    price: parseFloat(document.getElementById('itemPrice').value),
                    stock: parseInt(document.getElementById('itemStock').value),
                    rating: 4.5, // Default rating
                    image: document.getElementById('itemImage').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                };

                let menu = Storage.get('menu');
                if (mode === 'add') {
                    menu.push(newItem);
                    UI.showToast('Item Added', 'success');
                } else {
                    const idx = menu.findIndex(m => m.id === id);
                    if (idx > -1) {
                        newItem.rating = menu[idx].rating;
                        menu[idx] = newItem;
                    }
                    UI.showToast('Item Updated', 'success');
                }

                Storage.set('menu', menu);
                UI.closeModal('itemModal');
                AdminServices.renderAdminMenu();
            });
        }

        document.getElementById('itemForm').reset();
        document.getElementById('itemMode').value = 'add';
        document.getElementById('itemModalTitle').textContent = 'Add Menu Item';
        document.getElementById('itemImage').value = '';
        document.getElementById('itemImagePreview').src = '';
        document.getElementById('itemImagePreview').style.display = 'none';
        UI.showModal('itemModal');
    }

    static updateStock(id, val) {
        const menu = Storage.get('menu');
        const item = menu.find(m => m.id === id);
        if (item) {
            item.stock = parseInt(val) || 0;
            Storage.set('menu', menu);
            UI.showToast('Stock updated', 'success');
        }
    }

    static deleteItem(id) {
        if (confirm('Are you sure you want to remove this item?')) {
            let menu = Storage.get('menu');
            menu = menu.filter(m => m.id !== id);
            Storage.set('menu', menu);
            UI.showToast('Item deleted', 'info');
            AdminServices.renderAdminMenu();
        }
    }

    static editItem(id) {
        const menu = Storage.get('menu');
        const item = menu.find(m => m.id === id);
        if (!item) return;

        AdminServices.showAddModal();
        document.getElementById('itemMode').value = 'edit';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemModalTitle').textContent = 'Edit Menu Item';

        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemStock').value = item.stock;
        document.getElementById('itemImage').value = item.image;
        if (item.image) {
            document.getElementById('itemImagePreview').src = item.image;
            document.getElementById('itemImagePreview').style.display = 'block';
        } else {
            document.getElementById('itemImagePreview').src = '';
            document.getElementById('itemImagePreview').style.display = 'none';
        }
    }
}
