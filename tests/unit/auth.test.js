const AuthSystem = require('../../src/auth/AuthSystem');

describe('Authentication System', () => {
    let auth;

    beforeEach(() => {
        auth = new AuthSystem();
    });

    describe('Login Functionality', () => {
        test('should login successfully with valid admin credentials', () => {
            const result = auth.login('admin', 'admin123');
            
            expect(result.success).toBe(true);
            expect(auth.isAuthenticated).toBe(true);
            expect(auth.getCurrentUser().username).toBe('admin');
            expect(auth.getCurrentUser().role).toBe('admin');
        });

        test('should login successfully with valid guest credentials', () => {
            const result = auth.login('guest', 'guest123');
            
            expect(result.success).toBe(true);
            expect(auth.isAuthenticated).toBe(true);
            expect(auth.getCurrentUser().username).toBe('guest');
            expect(auth.getCurrentUser().role).toBe('guest');
        });

        test('should fail login with invalid username', () => {
            const result = auth.login('invaliduser', 'password');
            
            expect(result.success).toBe(false);
            expect(auth.isAuthenticated).toBe(false);
            expect(auth.getCurrentUser()).toBeNull();
        });

        test('should fail login with invalid password', () => {
            const result = auth.login('admin', 'wrongpassword');
            
            expect(result.success).toBe(false);
            expect(auth.isAuthenticated).toBe(false);
        });

        test('should fail login with empty credentials', () => {
            const result1 = auth.login('', 'admin123');
            const result2 = auth.login('admin', '');
            
            expect(result1.success).toBe(false);
            expect(result2.success).toBe(false);
        });
    });

    describe('Role-based Access Control', () => {
        test('admin user should have admin role', () => {
            auth.login('admin', 'admin123');
            expect(auth.isAdmin()).toBe(true);
            expect(auth.isGuest()).toBe(false);
        });

        test('guest user should have guest role', () => {
            auth.login('guest', 'guest123');
            expect(auth.isGuest()).toBe(true);
            expect(auth.isAdmin()).toBe(false);
        });

        test('unauthenticated user should have no roles', () => {
            expect(auth.isAdmin()).toBe(false);
            expect(auth.isGuest()).toBe(false);
        });
    });

    describe('Permission System', () => {
        test('admin should have all permissions', () => {
            auth.login('admin', 'admin123');
            
            expect(auth.hasPermission('add')).toBe(true);
            expect(auth.hasPermission('remove')).toBe(true);
            expect(auth.hasPermission('clear')).toBe(true);
            expect(auth.hasPermission('save')).toBe(true);
            expect(auth.hasPermission('view')).toBe(true);
        });

        test('guest should have limited permissions', () => {
            auth.login('guest', 'guest123');
            
            expect(auth.hasPermission('view')).toBe(true);
            expect(auth.hasPermission('changeColors')).toBe(false); // Not in basic permissions
            expect(auth.hasPermission('add')).toBe(false);
            expect(auth.hasPermission('remove')).toBe(false);
        });

        test('unauthenticated user should have no permissions', () => {
            expect(auth.hasPermission('view')).toBe(false);
            expect(auth.hasPermission('add')).toBe(false);
        });
    });

    describe('Logout Functionality', () => {
        test('should logout successfully', () => {
            auth.login('admin', 'admin123');
            expect(auth.isAuthenticated).toBe(true);
            
            const result = auth.logout();
            
            expect(result.success).toBe(true);
            expect(auth.isAuthenticated).toBe(false);
            expect(auth.getCurrentUser()).toBeNull();
        });

        test('user state should be cleared after logout', () => {
            auth.login('guest', 'guest123');
            auth.logout();
            
            expect(auth.isAdmin()).toBe(false);
            expect(auth.isGuest()).toBe(false);
            expect(auth.hasPermission('view')).toBe(false);
        });
    });

    describe('Session Management', () => {
        test('multiple logins should update current user', () => {
            auth.login('admin', 'admin123');
            expect(auth.getCurrentUser().username).toBe('admin');
            
            auth.login('guest', 'guest123');
            expect(auth.getCurrentUser().username).toBe('guest');
        });

        test('login state should persist until logout', () => {
            auth.login('admin', 'admin123');
            
            // Simulate multiple operations
            expect(auth.isAuthenticated).toBe(true);
            expect(auth.hasPermission('add')).toBe(true);
            
            // State should remain consistent
            expect(auth.getCurrentUser().username).toBe('admin');
        });
    });
});
