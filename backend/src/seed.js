import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Job } from './models/Job.js';

const upsertUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });
  if (user) {
    console.log(`Skipping existing user: ${email}`);
    return user;
  }
  user = await User.create({ name, email, password, role, isVerified: true });
  console.log(`Created ${role}: ${email}`);
  return user;
};

const run = async () => {
  await connectDB();

  await upsertUser({
    name: 'Platform Admin',
    email: env.seed.adminEmail,
    password: env.seed.adminPassword,
    role: 'admin',
  });

  const recruiter = await upsertUser({
    name: 'Riya Recruiter',
    email: env.seed.recruiterEmail,
    password: env.seed.recruiterPassword,
    role: 'recruiter',
  });

  const secondRecruiter = await upsertUser({
    name: 'Sam Talent',
    email: 'sam.recruiter@kribudwebtech.com',
    password: env.seed.recruiterPassword,
    role: 'recruiter',
  });

  await upsertUser({
    name: 'Chris Candidate',
    email: env.seed.candidateEmail,
    password: env.seed.candidatePassword,
    role: 'candidate',
  });

  await upsertUser({
    name: 'Priya Patel',
    email: 'priya.candidate@kribudwebtech.com',
    password: env.seed.candidatePassword,
    role: 'candidate',
  });

  await upsertUser({
    name: 'Jordan Lee',
    email: 'jordan.candidate@kribudwebtech.com',
    password: env.seed.candidatePassword,
    role: 'candidate',
  });

  const bulkJobs = [
    {
      title: 'Full Stack MERN Developer',
      description:
        'We are looking for a Full Stack MERN developer to build and maintain scalable web applications.',
      company: 'KRIBUDWEBTECH',
      location: 'Remote',
      type: 'full-time',
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.IO'],
      salaryMin: 60000,
      salaryMax: 90000,
      postedBy: recruiter._id,
    },
    {
      title: 'Frontend Engineer (React)',
      description:
        'Build accessible, performant UIs with React and Tailwind CSS as part of a small product team.',
      company: 'KRIBUDWEBTECH',
      location: 'Bengaluru, India',
      type: 'full-time',
      skills: ['React', 'Tailwind CSS', 'Redux Toolkit', 'TypeScript'],
      salaryMin: 45000,
      salaryMax: 70000,
      postedBy: recruiter._id,
    },
    {
      title: 'Backend Engineer (Node.js)',
      description:
        'Design and maintain REST APIs, background jobs, and database schemas powering our platform.',
      company: 'KRIBUDWEBTECH',
      location: 'Remote',
      type: 'full-time',
      skills: ['Node.js', 'Express', 'MongoDB', 'Redis'],
      salaryMin: 55000,
      salaryMax: 85000,
      postedBy: recruiter._id,
    },
    {
      title: 'DevOps Engineer',
      description: 'Own our CI/CD pipelines, Docker/Kubernetes infrastructure, and monitoring stack.',
      company: 'CloudNine Systems',
      location: 'Hyderabad, India',
      type: 'full-time',
      skills: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions'],
      salaryMin: 70000,
      salaryMax: 100000,
      postedBy: secondRecruiter._id,
    },
    {
      title: 'QA Automation Engineer',
      description: 'Build and maintain automated test suites (Jest, Playwright) across our web apps.',
      company: 'CloudNine Systems',
      location: 'Remote',
      type: 'contract',
      skills: ['Jest', 'Playwright', 'CI/CD'],
      salaryMin: 40000,
      salaryMax: 60000,
      postedBy: secondRecruiter._id,
    },
    {
      title: 'UI/UX Designer',
      description: 'Design clean, accessible interfaces and collaborate closely with engineering.',
      company: 'CloudNine Systems',
      location: 'Pune, India',
      type: 'part-time',
      skills: ['Figma', 'Design Systems', 'Accessibility'],
      salaryMin: 30000,
      salaryMax: 50000,
      postedBy: secondRecruiter._id,
    },
    {
      title: 'Software Engineering Intern',
      description: 'Work alongside senior engineers on real product features for the summer term.',
      company: 'KRIBUDWEBTECH',
      location: 'Remote',
      type: 'internship',
      skills: ['JavaScript', 'Git', 'React'],
      salaryMin: 10000,
      salaryMax: 15000,
      postedBy: recruiter._id,
    },
    {
      title: 'Mobile App Developer (React Native)',
      description: 'Build and ship cross-platform mobile features for our candidate-facing app.',
      company: 'CloudNine Systems',
      location: 'Remote',
      type: 'full-time',
      skills: ['React Native', 'JavaScript', 'REST APIs'],
      salaryMin: 50000,
      salaryMax: 80000,
      postedBy: secondRecruiter._id,
    },
  ];

  for (const jobData of bulkJobs) {
    const exists = await Job.findOne({ title: jobData.title, postedBy: jobData.postedBy });
    if (!exists) {
      await Job.create(jobData);
      console.log(`Created job: ${jobData.title}`);
    }
  }

  console.log('\nSeed complete. Test credentials:');
  console.log(`  Admin:     ${env.seed.adminEmail} / ${env.seed.adminPassword}`);
  console.log(`  Recruiter: ${env.seed.recruiterEmail} / ${env.seed.recruiterPassword}`);
  console.log(`  Candidate: ${env.seed.candidateEmail} / ${env.seed.candidatePassword}`);

  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
