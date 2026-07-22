import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/cloudinary.js', () => ({
  uploadBufferToCloudinary: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/demo/resume.pdf',
    public_id: 'mock_resume_id',
  }),
  default: {},
}));

const request = (await import('supertest')).default;
const { connect, closeDatabase, clearDatabase } = await import('./setup.js');
const { default: app } = await import('../src/app.js');

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
};

describe('Applications', () => {
  it('allows a candidate to apply to a job with a resume upload', async () => {
    const recruiter = await registerAndLogin({ email: 'recruiter@example.com', role: 'recruiter' });
    const candidate = await registerAndLogin({ email: 'candidate@example.com', role: 'candidate' });

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send(sampleJob);
    const jobId = jobRes.body.data.job._id;

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.token}`)
      .field('jobId', jobId)
      .field('coverLetter', 'I am a great fit for this role.')
      .attach('resume', Buffer.from('%PDF-1.4 fake resume content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.application.resumeUrl).toContain('cloudinary');
  });

  it('prevents duplicate applications to the same job', async () => {
    const recruiter = await registerAndLogin({ email: 'recruiter2@example.com', role: 'recruiter' });
    const candidate = await registerAndLogin({ email: 'candidate2@example.com', role: 'candidate' });

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send(sampleJob);
    const jobId = jobRes.body.data.job._id;

    const apply = () =>
      request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidate.token}`)
        .field('jobId', jobId)
        .attach('resume', Buffer.from('%PDF-1.4 fake resume content'), {
          filename: 'resume.pdf',
          contentType: 'application/pdf',
        });

    await apply();
    const res = await apply();
    expect(res.status).toBe(409);
  });

  it('forbids a recruiter from applying to a job', async () => {
    const recruiter = await registerAndLogin({ email: 'recruiter3@example.com', role: 'recruiter' });

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send(sampleJob);
    const jobId = jobRes.body.data.job._id;

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .field('jobId', jobId)
      .attach('resume', Buffer.from('%PDF-1.4 fake resume content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(403);
  });

  it('lets the owning recruiter update application status', async () => {
    const recruiter = await registerAndLogin({ email: 'recruiter4@example.com', role: 'recruiter' });
    const candidate = await registerAndLogin({ email: 'candidate4@example.com', role: 'candidate' });

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send(sampleJob);
    const jobId = jobRes.body.data.job._id;

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.token}`)
      .field('jobId', jobId)
      .attach('resume', Buffer.from('%PDF-1.4 fake resume content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });
    const applicationId = appRes.body.data.application._id;

    const res = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send({ status: 'shortlisted' });

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('shortlisted');
  });
});
