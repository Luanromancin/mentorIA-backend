import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/user.model';
import sequelize from '../../src/config/database';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Sincronizar banco de dados de teste
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar dados entre testes
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        name: 'Test User',
        email: uniqueEmail,
        password: 'SenhaForte123!',
        birthDate: '2000-01-01',
        institution: 'Instituto Teste'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return error for duplicate email', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        name: 'Test User',
        email: uniqueEmail,
        password: 'SenhaForte123!',
        birthDate: '2000-01-01',
        institution: 'Instituto Teste'
      };

      // Registrar primeiro usuário
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Tentar registrar com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
        birthDate: 'invalid-date',
        institution: ''
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    let uniqueEmail: string;
    beforeEach(async () => {
      uniqueEmail = `test-${Date.now()}@example.com`;
      // Criar usuário para teste de login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'SenhaForte123!',
          birthDate: '2000-01-01',
          institution: 'Instituto Teste'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: uniqueEmail,
        password: 'SenhaForte123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: uniqueEmail,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should return error for non-existent email', async () => {
      const loginData = {
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'SenhaForte123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let uniqueEmail: string;

    beforeEach(async () => {
      uniqueEmail = `test-${Date.now()}@example.com`;
      // Registrar e fazer login para obter token
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'SenhaForte123!',
          birthDate: '2000-01-01',
          institution: 'Instituto Teste'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'SenhaForte123!'
        });

      authToken = loginResponse.body.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', uniqueEmail);
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 