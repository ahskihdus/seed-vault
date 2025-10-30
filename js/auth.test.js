/**
 * auth.test.js
 * Pure Node + Jest test file (no jsdom)
 */

const { login } = require('seed-vault/js/auth'); // assumes login() is exported from auth.js

describe('Login function (pure logic tests)', () => {
  test('✅ logs in successfully with correct credentials', () => {
    const result = login('admin', 'seedvault');
    expect(result.success).toBe(true);
    expect(result.role).toBe('admin');
  });

  test('❌ fails login with incorrect password', () => {
    const result = login('admin', 'wrongpassword');
    expect(result.success).toBe(false);
  });

  test('❌ fails login with incorrect username', () => {
    const result = login('wronguser', 'seedvault');
    expect(result.success).toBe(false);
  });

  test('❌ fails login with both invalid username and password', () => {
    const result = login('x', 'y');
    expect(result.success).toBe(false);
  });
});
