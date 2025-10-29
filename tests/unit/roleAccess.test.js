const AuthSystem = require('../../src/auth/AuthSystem');

describe('Role-based Feature Access', () => {
    let auth;

    beforeEach(() => {
        auth = new AuthSystem();
    });

    describe('Admin Feature Access', () => {
        test('admin can access admin-only features', () => {
            auth.login('admin', 'admin123');
            
            // Simulate admin features
            const canAddElements = auth.hasPermission('add');
            const canRemoveElements = auth.hasPermission('remove');
            const canClearCanvas = auth.hasPermission('clear');
            
            expect(canAddElements).toBe(true);
            expect(canRemoveElements).toBe(true);
            expect(canClearCanvas).toBe(true);
        });

        test('guest cannot access admin features', () => {
            auth.login('guest', 'guest123');
            
            const canAddElements = auth.hasPermission('add');
            const canRemoveElements = auth.hasPermission('remove');
            const canClearCanvas = auth.hasPermission('clear');
            
            expect(canAddElements).toBe(false);
            expect(canRemoveElements).toBe(false);
            expect(canClearCanvas).toBe(false);
        });
    });

    describe('Guest Feature Access', () => {
        test('guest can access view features', () => {
            auth.login('guest', 'guest123');
            
            const canView = auth.hasPermission('view');
            
            expect(canView).toBe(true);
        });

        test('admin can also access view features', () => {
            auth.login('admin', 'admin123');
            
            const canView = auth.hasPermission('view');
            
            expect(canView).toBe(true);
        });
    });
});
