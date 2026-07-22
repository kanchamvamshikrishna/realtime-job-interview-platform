import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Set to 'true' when the frontend and backend are on different hosts
  // (e.g. Vercel + Render) — the refresh-token cookie needs SameSite=None
  // (which requires Secure) to survive a cross-site request in that setup.
  crossOriginCookies: process.env.CROSS_ORIGIN_COOKIES === 'true',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job-interview-platform',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin@gmail.com',
    recruiterEmail: process.env.SEED_RECRUITER_EMAIL || 'recruiter@kribudwebtech.com',
    recruiterPassword: process.env.SEED_RECRUITER_PASSWORD || 'Recruiter@12345',
    candidateEmail: process.env.SEED_CANDIDATE_EMAIL || 'test@gmail.com',
    candidatePassword: process.env.SEED_CANDIDATE_PASSWORD || 'test@gmail.com',
  },
};
