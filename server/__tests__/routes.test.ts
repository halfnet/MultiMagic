import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

const app = express();
const server = registerRoutes(app);

describe('API Integration Tests', () => {
  describe('GET /api/users', () => {
    it('should return an array of users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/login', () => {
    it('should create a new user if username does not exist', async () => {
      const response = await request(app).post('/api/login').send({ username: 'testuser' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
    });

    it('should return 400 for invalid username', async () => {
      const response = await request(app).post('/api/login').send({ username: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/daily-stats', () => {
    it('should return daily statistics', async () => {
      const response = await request(app).get('/api/daily-stats').query({ userId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('easy_count');
      expect(response.body).toHaveProperty('hard_count');
    });
  });
});
