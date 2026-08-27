const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('API Security and Reliability Tests', () => {

  // Close mongoose connection after tests if it was opened
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Protected Routes', () => {
    it('should return 401 for unauthenticated access to /api/jobs POST', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Hacker',
          description: 'Trying to inject',
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 401 for unauthenticated access to /api/applications/my GET', async () => {
      const res = await request(app).get('/api/applications/my');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 when missing fields on register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User'
        });
        
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Please add all fields');
    });

    it('should return 400 for invalid email format on register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: 'password123',
          role: 'candidate'
        });
        
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Please provide a valid email');
    });
  });

});
