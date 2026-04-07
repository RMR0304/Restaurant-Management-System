class Person {
    #id;
    #name;
    #phone;

    constructor(id, name, phone) {
        this.#id = id;
        this.#name = name;
        this.#phone = phone;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get phone() { return this.#phone; }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            phone: this.#phone
        };
    }
}

class Customer extends Person {
    #loyaltyPoints;

    constructor(id, name, phone, loyaltyPoints = 0) {
        super(id, name, phone);
        this.#loyaltyPoints = loyaltyPoints;
    }

    get loyaltyPoints() { return this.#loyaltyPoints; }
    set loyaltyPoints(points) { this.#loyaltyPoints = points; }

    toJSON() {
        return {
            ...super.toJSON(),
            loyaltyPoints: this.#loyaltyPoints,
            role: 'customer'
        };
    }
}

class Employee extends Person {
    #employeeId;
    #role;

    constructor(id, name, phone, employeeId, role) {
        super(id, name, phone);
        this.#employeeId = employeeId;
        this.#role = role;
    }

    get employeeId() { return this.#employeeId; }
    get role() { return this.#role; }

    toJSON() {
        return {
            ...super.toJSON(),
            employeeId: this.#employeeId,
            role: this.#role
        };
    }
}

class Server extends Employee {
    #assignedTables;

    constructor(id, name, phone, employeeId, assignedTables = []) {
        super(id, name, phone, employeeId, 'server');
        this.#assignedTables = assignedTables;
    }

    get assignedTables() { return this.#assignedTables; }

    toJSON() {
        return {
            ...super.toJSON(),
            assignedTables: this.#assignedTables
        };
    }
}

class KitchenStaff extends Employee {
    constructor(id, name, phone, employeeId) {
        super(id, name, phone, employeeId, 'kitchen');
    }
}

class Admin extends Employee {
    constructor(id, name, phone, employeeId) {
        super(id, name, phone, employeeId, 'admin');
    }
}

class MenuItem {
    #id;
    #name;
    #category;
    #price;
    #rating;
    #stock;
    #image;

    constructor(id, name, category, price, rating, stock, image) {
        this.#id = id;
        this.#name = name;
        this.#category = category;
        this.#price = price;
        this.#rating = rating;
        this.#stock = stock;
        this.#image = image;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get category() { return this.#category; }
    get price() { return this.#price; }
    get rating() { return this.#rating; }
    get stock() { return this.#stock; }
    get image() { return this.#image; }

    set stock(value) { this.#stock = value; }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            category: this.#category,
            price: this.#price,
            rating: this.#rating,
            stock: this.#stock,
            image: this.#image
        };
    }
}

class Menu {
    #items;

    constructor(items = []) {
        this.#items = items.map(item => new MenuItem(item.id, item.name, item.category, item.price, item.rating, item.stock, item.image));
    }

    get items() { return this.#items; }

    addItem(item) {
        this.#items.push(item);
    }

    removeItem(id) {
        this.#items = this.#items.filter(item => item.id !== id);
    }
}

class Table {
    #number;
    #status;
    #currentCustomerId;

    constructor(number, status = 'Available', currentCustomerId = null) {
        this.#number = number;
        this.#status = status;
        this.#currentCustomerId = currentCustomerId;
    }

    get number() { return this.#number; }
    get status() { return this.#status; }
    set status(val) { this.#status = val; }
    get currentCustomerId() { return this.#currentCustomerId; }
    set currentCustomerId(val) { this.#currentCustomerId = val; }

    toJSON() {
        return {
            number: this.#number,
            status: this.#status,
            currentCustomerId: this.#currentCustomerId
        };
    }
}

class OrderItem {
    #menuItem;
    #quantity;

    constructor(menuItem, quantity) {
        this.#menuItem = menuItem;
        this.#quantity = quantity;
    }

    get menuItem() { return this.#menuItem; }
    get quantity() { return this.#quantity; }
    set quantity(value) { this.#quantity = value; }

    get total() { return this.#menuItem.price * this.#quantity; }

    toJSON() {
        return {
            menuItem: this.#menuItem.toJSON(),
            quantity: this.#quantity
        };
    }
}

class Order {
    #id;
    #customerId;
    #tableNumber;
    #items;
    #status;
    #timestamp;

    constructor(id, customerId, tableNumber = null, items = [], status = 'Pending', timestamp = Date.now()) {
        this.#id = id;
        this.#customerId = customerId;
        this.#tableNumber = tableNumber;
        this.#items = items;
        this.#status = status;
        this.#timestamp = timestamp;
    }

    get id() { return this.#id; }
    get customerId() { return this.#customerId; }
    get tableNumber() { return this.#tableNumber; }
    get items() { return this.#items; }
    get status() { return this.#status; }
    get timestamp() { return this.#timestamp; }

    set status(val) { this.#status = val; }

    addItem(orderItem) {
        this.#items.push(orderItem);
    }

    get totalAmount() {
        return this.#items.reduce((sum, item) => sum + item.total, 0);
    }

    toJSON() {
        return {
            id: this.#id,
            customerId: this.#customerId,
            tableNumber: this.#tableNumber,
            items: this.#items.map(i => i.toJSON()),
            status: this.#status,
            timestamp: this.#timestamp,
            totalAmount: this.totalAmount
        };
    }
}

class Bill {
    #id;
    #orderId;
    #amount;
    #status;

    constructor(id, orderId, amount, status = 'Unpaid') {
        this.#id = id;
        this.#orderId = orderId;
        this.#amount = amount;
        this.#status = status;
    }

    get id() { return this.#id; }
    get orderId() { return this.#orderId; }
    get amount() { return this.#amount; }
    get status() { return this.#status; }
    set status(val) { this.#status = val; }

    toJSON() {
        return {
            id: this.#id,
            orderId: this.#orderId,
            amount: this.#amount,
            status: this.#status
        };
    }
}

class Payment {
    #id;
    #billId;
    #method;
    #amount;
    #timestamp;

    constructor(id, billId, method, amount, timestamp = Date.now()) {
        this.#id = id;
        this.#billId = billId;
        this.#method = method;
        this.#amount = amount;
        this.#timestamp = timestamp;
    }

    toJSON() {
        return {
            id: this.#id,
            billId: this.#billId,
            method: this.#method,
            amount: this.#amount,
            timestamp: this.#timestamp
        };
    }
}

class Storage {
    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static normalizePhone(phone) {
        if (phone === null || phone === undefined) return null;
        const s = String(phone).trim();
        if (!s) return null;
        // Keep leading +, strip everything else non-digit.
        const plus = s.startsWith('+') ? '+' : '';
        const digits = s.replace(/\D/g, '');
        return digits ? (plus + digits) : null;
    }

    static getServerDraftContext() {
        const currentUser = Storage.get('currentUser');
        if (!currentUser || currentUser.role !== 'server') return null;

        const tableNumRaw = sessionStorage.getItem('currentOrderTable');
        const tableNumber = tableNumRaw ? parseInt(tableNumRaw, 10) : null;
        if (!tableNumber) return null;

        const custToken = sessionStorage.getItem('currentOrderCustomer') || null; // can be userId OR phone
        const custPhoneOverride = sessionStorage.getItem('currentOrderCustomerPhone') || null;

        const users = Storage.get('users') || [];
        const byId = custToken ? users.find(u => u.id === custToken) : null;

        const customerUserId = byId ? byId.id : null;
        const customerPhone =
            Storage.normalizePhone(custPhoneOverride) ||
            (byId ? Storage.normalizePhone(byId.phone) : Storage.normalizePhone(custToken));

        const customerKey = customerUserId || customerPhone || custToken || 'unknown';

        return {
            serverId: currentUser.id,
            tableNumber,
            customerUserId,
            customerPhone,
            customerKey
        };
    }

    static getActiveCartKey() {
        const currentUser = Storage.get('currentUser');
        if (!currentUser) return null;

        if (currentUser.role === 'server') {
            const ctx = Storage.getServerDraftContext();
            if (ctx) {
                return `cart_server_${ctx.serverId}_table_${ctx.tableNumber}_cust_${ctx.customerKey}`;
            }
        }

        return `cart_${currentUser.id}`;
    }

    static getActiveCart() {
        const key = Storage.getActiveCartKey();
        return key ? (Storage.get(key) || []) : [];
    }

    static setActiveCart(cart) {
        const key = Storage.getActiveCartKey();
        if (!key) return;
        Storage.set(key, cart);
    }

    static getServerDraftCart(serverId, tableNumber, customerKey) {
        if (!serverId || !tableNumber || !customerKey) return [];
        const key = `cart_server_${serverId}_table_${tableNumber}_cust_${customerKey}`;
        return Storage.get(key) || [];
    }

    static clearServerDraftCart(serverId, tableNumber, customerKey) {
        if (!serverId || !tableNumber || !customerKey) return;
        const key = `cart_server_${serverId}_table_${tableNumber}_cust_${customerKey}`;
        localStorage.removeItem(key);
    }

    /**
     * Remove all customer accounts from LocalStorage while keeping employees/admin.
     * Orders are NOT deleted: they are converted back to guest-by-phone so the system
     * still preserves history (and can re-link later if the customer registers again).
     */
    static clearCustomers() {
        const users = Storage.get('users') || [];
        if (!Array.isArray(users) || users.length === 0) return { removedCustomers: 0 };

        const customers = users.filter(u => u && u.role === 'customer');
        const keep = users.filter(u => !u || u.role !== 'customer');

        const idToPhone = new Map(
            customers
                .filter(c => c && c.id)
                .map(c => [c.id, Storage.normalizePhone(c.phone) || c.phone || null])
        );

        // Remove customer carts
        customers.forEach(c => {
            if (c && c.id) localStorage.removeItem(`cart_${c.id}`);
        });

        // If currently logged in as customer, log out
        const currentUser = Storage.get('currentUser');
        if (currentUser && currentUser.role === 'customer') {
            Storage.set('currentUser', null);
        }

        // Convert linked orders back to guest-by-phone
        const orders = Storage.get('orders') || [];
        let changed = false;
        orders.forEach(o => {
            if (!o || typeof o !== 'object') return;

            const linkedId = o.customerUserId || (typeof o.customerId === 'string' ? o.customerId : null);
            if (!linkedId) return;

            const phone = idToPhone.get(linkedId);
            if (!phone) return;

            // Keep phone, remove user linkage
            if (o.customerPhone !== phone) {
                o.customerPhone = phone;
                changed = true;
            }
            if (o.customerUserId !== null) {
                o.customerUserId = null;
                changed = true;
            }
            if (o.customerId !== phone) {
                o.customerId = phone; // legacy compatibility
                changed = true;
            }
        });
        if (changed) Storage.set('orders', orders);

        Storage.set('users', keep);
        return { removedCustomers: customers.length };
    }

    /**
     * Ensure every order has:
     * - customerPhone (string|null)
     * - customerUserId (string|null)
     *
     * Keeps legacy `customerId` for backward-compatibility.
     */
    static migrateOrdersSchema() {
        const orders = Storage.get('orders') || [];
        if (!Array.isArray(orders) || orders.length === 0) return;

        const users = Storage.get('users') || [];
        const userById = new Map(users.map(u => [u.id, u]));

        let changed = false;
        orders.forEach(o => {
            if (!o || typeof o !== 'object') return;

            // Already new schema
            if ('customerPhone' in o || 'customerUserId' in o) {
                const normalized = Storage.normalizePhone(o.customerPhone);
                if (normalized && normalized !== o.customerPhone) {
                    o.customerPhone = normalized;
                    changed = true;
                }
                // Keep legacy `customerId` aligned so older pages keep working.
                const legacy = o.customerUserId || o.customerPhone || null;
                if (legacy !== undefined && o.customerId !== legacy) {
                    o.customerId = legacy;
                    changed = true;
                }
                return;
            }

            // Legacy schema: `customerId` could be a user id OR a phone string.
            const legacyCustomerId = o.customerId ?? null;
            const foundUser = legacyCustomerId ? userById.get(legacyCustomerId) : null;

            if (foundUser) {
                o.customerUserId = foundUser.id;
                o.customerPhone = Storage.normalizePhone(foundUser.phone);
                o.customerId = foundUser.id;
                changed = true;
            } else {
                const phone = Storage.normalizePhone(legacyCustomerId);
                o.customerUserId = null;
                o.customerPhone = phone;
                o.customerId = phone || legacyCustomerId || null;
                changed = true;
            }
        });

        if (changed) Storage.set('orders', orders);
    }

    static linkGuestOrdersToUserByPhone(phone, userId) {
        const normalizedPhone = Storage.normalizePhone(phone);
        if (!normalizedPhone || !userId) return 0;

        const orders = Storage.get('orders') || [];
        let updated = 0;

        orders.forEach(o => {
            if (!o || typeof o !== 'object') return;

            // Ensure migrated-ish shape even if old data sneaks in.
            const orderPhone = Storage.normalizePhone(o.customerPhone ?? o.customerId);
            const hasUser = !!(o.customerUserId || (o.customerId && String(o.customerId) === String(userId)));

            if (!hasUser && orderPhone && orderPhone === normalizedPhone) {
                o.customerUserId = userId;
                o.customerPhone = normalizedPhone;
                // Keep old consumers working
                o.customerId = userId;
                updated++;
            }
        });

        if (updated) Storage.set('orders', orders);
        return updated;
    }

    static initDB() {
        if (!Storage.get('users')) {
            const admin = new Admin('u1', 'Super Admin', '1234567890', 'A001');
            const server = new Server('u2', 'John Server', '9876543210', 'S001', [1, 2, 3]);
            const kitchen = new KitchenStaff('u3', 'Chef Gordon', '5555555555', 'K001');
            Storage.set('users', [admin.toJSON(), server.toJSON(), kitchen.toJSON()]);
        }
        if (!Storage.get('menu')) {
            const defaultMenu = [
                new MenuItem('m1', 'Classic Burger', 'Main', 100.00, 4.8, 50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400').toJSON(),
                new MenuItem('m2', 'Margherita Pizza', 'Main', 120.00, 4.5, 30, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400').toJSON(),
                new MenuItem('m3', 'Caesar Salad', 'Starter', 80.00, 4.2, 20, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400').toJSON(),
                new MenuItem('m4', 'Chocolate Lava Cake', 'Dessert', 60.00, 4.9, 15, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400').toJSON(),
                new MenuItem('m5', 'Mojito', 'Beverage', 25.00, 4.6, 40, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400').toJSON()
            ];
            Storage.set('menu', defaultMenu);
        }
        if (!Storage.get('tables')) {
            const defaultTables = [
                new Table(1).toJSON(),
                new Table(2).toJSON(),
                new Table(3).toJSON(),
                new Table(4).toJSON(),
                new Table(5).toJSON(),
                new Table(6).toJSON()
            ];
            Storage.set('tables', defaultTables);
        }
        if (!Storage.get('orders')) Storage.set('orders', []);
        if (!Storage.get('bills')) Storage.set('bills', []);
        if (!Storage.get('payments')) Storage.set('payments', []);

        // Keep old data compatible with new order schema.
        Storage.migrateOrdersSchema();
    }
}

// Initialize database
Storage.initDB();
