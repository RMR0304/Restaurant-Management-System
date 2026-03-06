class AuthService {
    static async login(phone, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = Storage.get('users') || [];
                // Password check simulated by 'password123' or empty. Just check phone for now.
                const normalizedPhone = Storage.normalizePhone(phone);
                const user = users.find(u => Storage.normalizePhone(u.phone) === normalizedPhone);

                if (user) {
                    if (user.password) {
                        if (password !== user.password) {
                            reject('Invalid credentials');
                            return;
                        }
                    } else if (password !== 'password') {
                        reject('Invalid credentials');
                        return;
                    }
                    Storage.set('currentUser', user);

                    // If this is a customer logging in, auto-link any prior guest orders by phone.
                    if (user.role === 'customer') {
                        Storage.linkGuestOrdersToUserByPhone(user.phone, user.id);
                    }

                    resolve(user);
                } else {
                    reject('User not found');
                }
            }, 800); // Simulate network latency
        });
    }

    static async register(name, phone, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = Storage.get('users') || [];
                const normalizedPhone = Storage.normalizePhone(phone);
                if (!normalizedPhone) {
                    reject('Please enter a valid phone number');
                    return;
                }
                if (users.find(u => Storage.normalizePhone(u.phone) === normalizedPhone)) {
                    reject('Phone number already registered');
                    return;
                }

                const newCustomer = new Customer('c' + Date.now(), name, normalizedPhone);
                const userObj = newCustomer.toJSON();
                userObj.password = password; // Add password to storage
                users.push(userObj);
                Storage.set('users', users);

                // Auto-link ANY past guest orders created with this phone.
                Storage.linkGuestOrdersToUserByPhone(normalizedPhone, userObj.id);

                Storage.set('currentUser', userObj);
                resolve(userObj);
            }, 800);
        });
    }

    static logout() {
        Storage.set('currentUser', null);
        window.location.href = 'index.html';
    }

    static checkAuth() {
        const user = Storage.get('currentUser');
        if (!user && window.location.pathname.indexOf('index.html') === -1) {
            window.location.href = 'index.html';
        }
        return user;
    }
}

// Ensure auth check runs
if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
    AuthService.checkAuth();
}
