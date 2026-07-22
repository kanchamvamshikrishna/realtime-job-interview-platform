# Real-Time Job Interview Platform

A production-ready MERN recruitment platform with JWT role-based authentication, live
recruiter↔candidate chat, real-time interview status updates, job management, and role-specific
analytics dashboards. Built for the KRIBUDWEBTECH MERN assessment.

## Tech Stack

- **Frontend:** React 19 (Vite) + Tailwind CSS + Redux Toolkit (RTK Query) + React Router + Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh) with role-based access control (Admin / Recruiter / Candidate)
- **Real-time:** Socket.IO (chat, typing indicators, online presence, live application status updates)
- **File uploads:** Multer + Cloudinary (resumes)
- **Validation:** Zod
- **API docs:** Swagger (swagger-jsdoc + swagger-ui-express)
- **Testing:** Jest + Supertest + mongodb-memory-server
- **Bonus:** Docker + docker-compose, dark mode, GitHub Actions CI

## Architecture

```
KRIBUDWEBTECH/
  backend/                 Express API + Socket.IO server
    src/
      config/               env, MongoDB, Cloudinary, Swagger config
      models/                User, Job, Application, Message, Notification (Mongoose)
      controllers/           route handlers, one per resource
      routes/                Express routers, wired with middleware + Zod validation
      middleware/            JWT auth, role guard, Zod validate, Multer upload, error handler
      validators/            Zod schemas per resource
      sockets/               Socket.IO init, JWT socket auth, chat + presence handlers
      utils/                 ApiError/ApiResponse envelopes, asyncHandler, token helpers
      seed.js                Seeds admin/recruiter/candidate test users + a sample job
    tests/                   Jest + Supertest integration tests (auth, jobs, applications)
  frontend/                 Vite + React SPA
    src/
      app/                   Redux store, RTK Query base API (with auto refresh-token retry)
      features/              auth, jobs, applications, chat, dashboard, users — RTK Query slices
      pages/                 One component per route
      components/            Shared UI (Navbar, route guards, JobCard, Pagination, etc.)
      context/                Theme (dark mode) and Socket.IO context providers
  docker-compose.yml        mongo + backend + frontend, for one-command local deployment
  .github/workflows/ci.yml  Backend tests + frontend lint/build on push/PR
```

### Data model

- **User** — name, email, hashed password, `role` (admin/recruiter/candidate), verification/reset
  tokens, online/lastSeen presence fields.
- **Job** — recruiter-owned posting with text-indexed title/description/skills/company for search,
  plus location/type/status filters.
- **Application** — links a candidate to a job with a Cloudinary resume URL, cover letter, and a
  status enum (`applied → shortlisted → interview_scheduled → rejected/hired`). Unique index on
  `(job, candidate)` prevents duplicate applications.
- **Message** — chat messages keyed by a deterministic `conversationId` (sorted pair of user ids).
- **Notification** — lightweight record backing the real-time toasts (new application, status change).

### Real-time design (Socket.IO)

- A socket middleware verifies the JWT access token on `handshake.auth.token` before allowing a
  connection; each authenticated socket auto-joins a personal room (`user:<id>`).
- **Chat:** `join_conversation` / `send_message` / `typing` / `stop_typing`. Messages are persisted to
  MongoDB and delivered once per participant via their personal room (not the shared conversation
  room), avoiding double-delivery when both users have the conversation open simultaneously.
- **Presence:** `user_online` / `user_offline` broadcast on connect/disconnect, backed by
  `User.isOnline` / `lastSeen`.
- **Interview status updates:** when a recruiter changes an application's status via the REST API,
  the server emits `application_status_updated` to the candidate's personal room — no client-side
  polling required.

### Auth flow

- Register/login issue a short-lived JWT access token (returned in the response body) and a
  long-lived refresh token (httpOnly cookie). RTK Query's base query automatically calls
  `/api/auth/refresh` and retries once on a 401, then logs the user out if that also fails.
- Email verification and password reset are **mocked**: no real email is sent. The "email" content
  (with the verification/reset link) is logged to the backend console and also returned in the API
  response body so it can be exercised in this assessment build without an SMTP provider.

## Getting Started (local, without Docker)

### Prerequisites

- Node.js 20+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- (Optional) A Cloudinary account for real resume uploads — required for the application/resume-upload
  feature to work outside of the automated tests, which mock Cloudinary.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI / JWT secrets / Cloudinary keys
npm run seed            # creates admin, recruiter, candidate test users + a sample job
npm run dev              # starts the API + Socket.IO server on http://localhost:4000
```

API docs: **http://localhost:4000/api-docs**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api and /socket.io to :4000
```

### Test credentials (from `npm run seed`)

| Role      | Email                            | Password         |
|-----------|-----------------------------------|------------------|
| Admin     | admin@kribudwebtech.com          | Admin@12345      |
| Recruiter | recruiter@kribudwebtech.com      | Recruiter@12345  |
| Candidate | candidate@kribudwebtech.com      | Candidate@12345  |

(Override these via `SEED_*` env vars in `backend/.env` before running `npm run seed`.)

## Running with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend/API docs: http://localhost:4000 / http://localhost:4000/api-docs
- MongoDB: exposed on 27017 for local inspection

Then seed test users inside the running backend container:

```bash
docker compose exec backend npm run seed
```

Set `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and the `CLOUDINARY_*` variables in a root `.env` file
(read by `docker-compose.yml`) before deploying anywhere beyond localhost.

## Tests

```bash
cd backend
npm test
```

Runs Jest + Supertest against an in-memory MongoDB instance (`mongodb-memory-server`) — no external
database needed. Covers auth (register/login/RBAC), job CRUD + ownership checks, and the application
flow (resume upload via a mocked Cloudinary call, duplicate-application prevention, status updates).

## Deployment

_Fill in after deploying:_

- Frontend URL:
- Backend URL:
- Admin credentials: (use the seeded admin above, or rotate after deploying)

## Notes on scope

- Email verification and password reset are mocked per the assessment brief (no real email is sent).
- Resume uploads go through Cloudinary; the automated tests mock the Cloudinary call so `npm test`
  doesn't require real credentials, but running the app locally with actual file uploads does need a
  Cloudinary account (free tier is enough).
