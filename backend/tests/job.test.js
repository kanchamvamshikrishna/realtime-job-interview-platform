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

const registerAndLogin = async (overrides) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email: 'user@example.com', password: 'Password123', ...overrides });
  return { token: res.body.data.accessToken, user: res.body.data.user };
};

const sampleJob = {
  title: 'Backend Engineer',
  description: 'Build and maintain backend services for our platform.',
  company: 'Acme Corp',
  location: 'Remote',
  type: 'full-time',
  skills: ['Node.js', 'MongoDB'],
};

describe('Jobs', () => {
  it('allows a recruiter to create a job', async () => {
    const { token } = await registerAndLogin({ email: 'recruiter@example.com', role: 'recruiter' });

    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(sampleJob);

    expect(res.status).toBe(201);
    expect(res.body.data.job.title).toBe(sampleJob.title);
  });

  it('forbids a candidate from creating a job', async () => {
    const { token } = await registerAndLogin({ email: 'candidate@example.com', role: 'candidate' });

    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(sampleJob);

    expect(res.status).toBe(403);
  });

  it('lists open jobs publicly without auth', async () => {
    const { token } = await registerAndLogin({ email: 'recruiter2@example.com', role: 'recruiter' });
    await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(sampleJob);

    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.length).toBe(1);
  });

  it('prevents a recruiter from editing another recruiter\'s job', async () => {
    const owner = await registerAndLogin({ email: 'owner@example.com', role: 'recruiter' });
    const other = await registerAndLogin({ email: 'other@example.com', role: 'recruiter' });

    const createRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(sampleJob);
    const jobId = createRes.body.data.job._id;

    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });
});
