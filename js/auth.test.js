// js/auth.test.js
const request = require('supertest');
const app = require('../server/app');

describe('Login API Tests', () => {
  test('✅ Should return 200 and success for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('❌ Should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'wrong', password: 'password' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
