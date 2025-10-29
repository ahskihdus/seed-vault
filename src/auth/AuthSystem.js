class AuthSystem {
    constructor() {
        this.users = {
            'admin': { password: 'admin123', role: 'admin' },
            'guest': { password: 'guest123', role: 'guest' }
        };
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    login(username, password) {
        if (this.users[username] && this.users[username].password === password) {
            this.currentUser = {
                username: username,
                role: this.users[username].role
            };
            this.isAuthenticated = true;
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        return { success: true };
    }

    isAdmin() {
        return this.isAuthenticated && this.currentUser.role === 'admin';
    }

    isGuest() {
        return this.isAuthenticated && this.currentUser.role === 'guest';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(action) {
        if (!this.isAuthenticated) return false;
        
        const permissions = {
            'admin': ['add', 'remove', 'clear', 'save', 'view'],
            'guest': ['view']
        };
        
        return permissions[this.currentUser.role]?.includes(action) || false;
    }
}

module.exports = AuthSystem;
