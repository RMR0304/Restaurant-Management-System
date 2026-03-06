class UI {
    static showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconInfo = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `<i class="fas ${iconInfo[type]}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    static showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
        }
    }

    static closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    static setupSidebar() {
        const currentUser = Storage.get('currentUser');
        if (!currentUser) return;

        const sidebar = document.querySelector('.sidebar-menu');
        if (!sidebar) return;

        let links = '';
        if (currentUser.role === 'customer') {
            links = `
                <li><a href="dashboard.html"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="menu.html"><i class="fas fa-utensils"></i> Menu</a></li>
                <li><a href="order.html"><i class="fas fa-shopping-cart"></i> Cart</a></li>
                <li><a href="history.html"><i class="fas fa-history"></i> History</a></li>
            `;
        } else if (currentUser.role === 'server') {
            links = `
                <li><a href="server.html"><i class="fas fa-concierge-bell"></i> Tables & Orders</a></li>
                <li><a href="menu.html"><i class="fas fa-utensils"></i> Menu</a></li>
                <li><a href="history.html"><i class="fas fa-history"></i> Order History</a></li>
            `;
        } else if (currentUser.role === 'kitchen') {
            links = `
                <li><a href="kitchen.html"><i class="fas fa-fire"></i> Kitchen Board</a></li>
                <li><a href="menu.html"><i class="fas fa-utensils"></i> Menu Layout</a></li>
            `;
        } else if (currentUser.role === 'admin') {
            links = `
                <li><a href="admin.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                <li><a href="report.html"><i class="fas fa-chart-bar"></i> Reports</a></li>
                <li><a href="menu.html"><i class="fas fa-utensils"></i> Manage Menu</a></li>
                <li><a href="history.html"><i class="fas fa-history"></i> System Orders</a></li>
            `;
        }

        links += `<li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>`;
        sidebar.innerHTML = links;

        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', AuthService.logout);
        }, 0);

        // Set active link
        const currentPath = window.location.pathname.split('/').pop();
        const activeLink = document.querySelector(`.sidebar-menu a[href="${currentPath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Populate profile info
        const profileName = document.getElementById('profileName');
        const profileRole = document.getElementById('profileRole');
        const avatar = document.getElementById('userAvatar');

        if (profileName) profileName.textContent = currentUser.name;
        if (profileRole) profileRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        if (avatar) avatar.textContent = currentUser.name.charAt(0).toUpperCase();

        // Handle mobile sidebar toggle
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }

        UI.setupProfileDropdown();
    }

    static setupProfileDropdown() {
        const profileContainers = document.querySelectorAll('.user-profile');
        profileContainers.forEach(container => {
            if (!container.dataset.dropdownInit) {
                container.dataset.dropdownInit = 'true';
                container.style.cursor = 'pointer';
                container.style.position = 'relative';

                const dropdown = document.createElement('div');
                dropdown.className = 'profile-dropdown glass';
                dropdown.style.display = 'none';
                dropdown.style.position = 'absolute';
                dropdown.style.top = '100%';
                dropdown.style.right = '0';
                dropdown.style.marginTop = '10px';
                dropdown.style.padding = '10px';
                dropdown.style.minWidth = '150px';
                dropdown.style.zIndex = '1000';

                const user = Storage.get('currentUser');

                dropdown.innerHTML = `
                    <div style="padding: 10px; border-bottom: 1px solid var(--glass-border); text-align: center; cursor: pointer;" onclick="UI.showProfileModal()">
                        <strong><i class="fas fa-user-edit"></i> Edit Profile</strong><br>
                        <small style="color:var(--text-secondary)">${user ? user.role : ''}</small>
                    </div>
                    <div style="padding: 10px; text-align: center; cursor: pointer; color: var(--error);" onclick="AuthService.logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </div>
                `;
                container.appendChild(dropdown);

                container.addEventListener('click', (e) => {
                    const isVisible = dropdown.style.display === 'block';
                    document.querySelectorAll('.profile-dropdown').forEach(d => d.style.display = 'none');
                    if (!isVisible) {
                        dropdown.style.display = 'block';
                    }
                    e.stopPropagation();
                });
            }
        });

        // Close dropdown on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.profile-dropdown').forEach(d => d.style.display = 'none');
        });
    }

    static showProfileModal() {
        let modal = document.getElementById('profileModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'profileModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        const user = Storage.get('currentUser');

        let empIdField = '';
        if (user.employeeId) {
            const dis = (user.role === 'server' || user.role === 'kitchen') ? 'disabled style="opacity: 0.5;"' : '';
            empIdField = `
                <label>Employee ID</label>
                <input type="text" id="profEmpId" class="glass-input" value="${user.employeeId}" ${dis}>
            `;
        }

        modal.innerHTML = `
            <div class="modal-content glass">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="close-btn" onclick="UI.closeModal('profileModal')">×</button>
                </div>
                <form id="profileForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <label>Name</label>
                    <input type="text" id="profName" class="glass-input" value="${user.name}" required>
                    <label>Phone Number</label>
                    <input type="text" id="profPhone" class="glass-input" value="${user.phone}" required>
                    <label>Password</label>
                    <input type="password" id="profPass" class="glass-input" value="${user.password || 'password'}" required>
                    ${empIdField}
                    <button type="submit" class="glass-btn" style="margin-top: 10px;">Save Profile</button>
                </form>
            </div>
        `;
        UI.showModal('profileModal');

        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('profName').value;
            const newPhone = document.getElementById('profPhone').value;
            const newPass = document.getElementById('profPass').value;

            let currentUser = Storage.get('currentUser');
            currentUser.name = newName;
            currentUser.phone = newPhone;
            currentUser.password = newPass;

            if (document.getElementById('profEmpId') && !(currentUser.role === 'server' || currentUser.role === 'kitchen')) {
                currentUser.employeeId = document.getElementById('profEmpId').value;
            }

            const users = Storage.get('users');
            const idx = users.findIndex(u => u.id === currentUser.id);
            if (idx > -1) {
                users[idx].name = newName;
                users[idx].phone = newPhone;
                users[idx].password = newPass;
                if (currentUser.employeeId) users[idx].employeeId = currentUser.employeeId;
                Storage.set('users', users);
            }
            Storage.set('currentUser', currentUser);

            const profileName = document.getElementById('profileName');
            if (profileName) profileName.textContent = newName;
            const profileAvatar = document.getElementById('userAvatar');
            if (profileAvatar) profileAvatar.textContent = newName.charAt(0).toUpperCase();

            UI.showToast('Profile updated!', 'success');
            UI.closeModal('profileModal');
        });
    }

    static toggleTheme() {
        // Dark/Light theme toggle feature 
        document.body.classList.toggle('light-theme');
    }
}

// Global modal close handlers
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
    if (e.target.closest('.close-btn')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
    }
});
