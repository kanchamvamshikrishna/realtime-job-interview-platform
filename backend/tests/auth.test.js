import request from 'supertest';
import { connect, closeDatabase, clearDatabase } from './setup.js';
import app from '../src/app.js';

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Auth', () => {
  const candidate = {
    name: 'Test Candidate',
    email: 'candidate@example.com',
    password: 'Password123',
    role: 'candidate',
  };

  it('registers a new candidate', async () => {
    const res = await request(app).post('/api/auth/register').send(candidate);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(candidate.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects registering with an existing email', async () => {
    await request(app).post('/api/auth/register').send(candidate);
    const res = await request(app).post('/api/auth/register').send(candidate);
    expect(res.status).toBe(409);
  });

  it('rejects registering as admin via the public endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...candidate, role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(candidate);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: candidate.email, password: candidate.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(candidate);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: candidate.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('blocks access to /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows access to /me with a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(candidate);
    const token = registerRes.body.data.accessToken;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(candidate.email);
  });
});
