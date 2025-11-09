# SmartTech Connect

SmartTech Connect is a full-stack hyperlocal technician marketplace that pairs households with verified service professionals.  
It combines a responsive React (Vite) frontend, a Node/Express REST API, and MongoDB Atlas to deliver dynamic dashboards, KYC-compliant onboarding, OTP-secured authentication, and data-driven insight cards for both customers and technicians.

> Original GitHub source: [subodh-001/smarttech_connect-main](https://github.com/subodh-001/smarttech_connect-main.git).  
> This repository re-organises the code into dedicated `frontend/` and `backend/` workspaces and adds the latest functionality described below.

---

## Table of Contents

1. [Features](#features)  
2. [Architecture](#architecture)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
5. [Environment Variables](#environment-variables)  
6. [Available Scripts](#available-scripts)  
7. [Demo Accounts & Seed Data](#demo-accounts--seed-data)  
8. [API Overview](#api-overview)  
9. [Frontend Routes](#frontend-routes)  
10. [Notable Workflows](#notable-workflows)  
11. [Development Notes](#development-notes)  
12. [Roadmap Ideas](#roadmap-ideas)

---

## Features

### Customer Experience
- **OTP-protected onboarding** – email-based verification using hashed codes and expiry windows.
- **Dynamic dashboard** – live service history, booking stats, spending insights, and recommended services.
- **Service request management** – create, view, and track bookings with technician status updates.
- **Help Center & Support** – searchable articles plus support ticket submission that hits the backend.

### Technician Experience
- **Profile & KYC** – upload government ID + selfie, track review state, and meet compliance before accepting work.
- **Availability control** – toggle online/offline, update working hours, track active jobs.
- **Job pipeline** – browse available requests, accept/decline jobs (post-KYC approval), and monitor earnings.
- **Schedule view** – prioritised link in the profile dropdown for rapid planning.

### Platform Operations
- **Role-based JWT auth** with reusable middleware.
- **Seeded demo data** – sample users, technicians, and service requests for instant testing.
- **Extensible help centre content** stored in MongoDB with feedback tracking.
- **Support ticket logging** – creates MongoDB entries tied to authenticated users when available.
- **Environment-aware configuration** – MongoDB Atlas connection with in-memory fallback for offline dev.

---

## Architecture

```
smarttech_connect-main/
├── frontend/                     # Vite + React app (UI, routing, state)
│   ├── src/
│   │   ├── components/           # Shared UI + layout primitives
│   │   ├── pages/                # Route-level screens (dashboard, profile, onboarding, etc.)
│   │   ├── contexts/             # Auth & global state providers
│   │   └── hooks/utils/assets    # Supporting modules
│   └── vite.config.mjs           # Proxy / alias configuration
├── backend/                      # Node/Express API
│   ├── src/
│   │   ├── index.js              # App bootstrap, database connection, seeding
│   │   ├── middleware/           # JWT auth
│   │   ├── models/               # Mongoose schemas (User, Technician, ServiceRequest, HelpArticle, SupportTicket, OtpToken, etc.)
│   │   ├── routes/               # REST endpoints (auth, users, technicians, service-requests, dashboard, help-center, support)
│   │   └── seeders/              # Help centre seeding utilities
│   └── .env.example              # Configure environment secrets (create manually)
└── README.md
```

- Frontend API calls are proxied to `http://localhost:5000` during development (`/api/*`).
- Backend defaults to `PORT=5000`, but honour `process.env.PORT` when provided.

---

## Tech Stack

| Layer      | Main Libraries & Tools |
|------------|------------------------|
| **Frontend** | React 18, Vite, React Router v6, Redux Toolkit, Tailwind CSS, Lucide Icons, Framer Motion, React Hook Form, Axios, Recharts, D3.js |
| **Backend**  | Node.js, Express, Mongoose, MongoDB Atlas, bcrypt, jsonwebtoken, Nodemailer, MongoDB Memory Server (fallback) |
| **Tooling**  | ESLint, Prettier (via Vite config), Nodemon, npm scripts |

---

## Getting Started

### Prerequisites
- Node.js **18+**
- npm (bundled with Node)
- MongoDB Atlas account (or accept the in-memory fallback for local tests)

### 1. Clone the repository
```bash
git clone https://github.com/subodh-001/smarttech_connect-main.git
cd smarttech_connect-main
```

### 2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Configure environment variables
See [Environment Variables](#environment-variables) for details.  
Create `backend/.env` before running the API.

### 4. Start development servers
Run the backend first (port 5000), then the frontend (port 5173 by default).

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd ../frontend
npm run dev
```

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Proxy: Frontend requests to `/api/*` are automatically forwarded to the backend.

---

## Environment Variables

Create `backend/.env` with the following keys (values shown here are placeholders):

```
MONGODB_URI=mongodb+srv://<username>:<password>@smarttech.xc49ynv.mongodb.net/?appName=SmartTech
JWT_SECRET=change-me
EMAIL_USER=your_gmail_username@gmail.com
EMAIL_PASS=your_gmail_app_password   # Use an app password for Gmail
EMAIL_FROM="SmartTech Connect <your_gmail_username@gmail.com>"
PORT=5000                            # Optional override
```

- `EMAIL_*` is required for sending OTPs. During development, codes are still logged to the console when email fails.
- The backend falls back to an in-memory MongoDB instance if `MONGODB_URI` is missing (helpful for rapid prototyping).
- No mandatory frontend environment variables at the moment, but you can add them via `frontend/.env` as needed.

---

## Available Scripts

### Frontend (`frontend/`)
| Command            | Description                                          |
|--------------------|------------------------------------------------------|
| `npm run dev`      | Start Vite dev server with API proxy                 |
| `npm run build`    | Production build (outputs to `frontend/dist`)        |
| `npm run preview`  | Preview the built frontend locally                   |

### Backend (`backend/`)
| Command            | Description                                          |
|--------------------|------------------------------------------------------|
| `npm run dev`      | Start Nodemon-powered development server             |
| `npm start`        | Start the API in production mode                     |

---

## Demo Accounts & Seed Data

On startup the backend seeds demo users and service requests:

| Role        | Email                     | Password     | Notes                                           |
|-------------|---------------------------|--------------|-------------------------------------------------|
| Customer    | `demo.user@example.com`   | `Demo@12345` | Pre-populated dashboard bookings                |
| Technician  | `demo.tech@example.com`   | `Demo@12345` | KYC status defaults to `not_submitted`          |
| Admin       | `demo.admin@example.com`  | `Demo@12345` | Included for future admin tooling               |

Technician KYC documents are cleared unless the status is `approved`, ensuring realistic onboarding.

---

## API Overview

Key REST endpoints (all prefixed with `/api`):

| Method & Path                               | Purpose                                                     |
|---------------------------------------------|-------------------------------------------------------------|
| `POST /api/auth/send-otp`                   | Issue OTP to email (Nodemailer-backed)                      |
| `POST /api/auth/verify-otp`                 | Validate OTP prior to registration                          |
| `POST /api/auth/register` / `POST /login`   | Create or authenticate accounts                             |
| `GET /api/users/me`                         | Authenticated user profile                                  |
| `PUT /api/users/me`                         | Update profile & address data                               |
| `GET /api/dashboard/user`                   | Customer dashboard metrics & bookings                       |
| `GET /api/service-requests/available`       | Technician job pool (requires technician role + JWT)        |
| `POST /api/service-requests`                | Customer creates new request                                |
| `PATCH /api/service-requests/:id/status`    | Update status, cost, or assignment                          |
| `GET /api/technicians/me/kyc`               | Fetch KYC state for technician                              |
| `POST /api/technicians/me/kyc`              | Upload KYC documents (Multer multipart handling)            |
| `GET /api/help-center/categories`           | List help categories with counts                            |
| `GET /api/help-center/articles`             | Query published help articles                               |
| `GET /api/help-center/articles/:slug`       | Retrieve full article content                               |
| `POST /api/help-center/articles/:id/view`   | Increment article view counter                              |
| `POST /api/help-center/articles/:id/feedback` | Track helpful/not helpful feedback                        |
| `POST /api/support/tickets`                 | Submit support ticket (authenticated optional)              |
| `GET /api/support/tickets`                  | List user’s submitted tickets (auth required)               |

All protected routes require the `Authorization: Bearer <token>` header. The JWT payload encodes `sub` (user id), `role`, and `email`.

---

## Frontend Routes

| Path                          | Description / Access Control                      |
|-------------------------------|---------------------------------------------------|
| `/`                           | Redirect based on auth role (user/technician/admin) |
| `/user-login`                 | Shared login screen                               |
| `/user-registration`          | Registration + OTP flow                           |
| `/user-dashboard`             | Customer dashboard (requires role `user`)         |
| `/user-profile` `/account`    | Profile manager, KYC UI, notifications            |
| `/service-request-creation`   | Create new request                                |
| `/technician-dashboard`       | Technician console with tabbed navigation         |
| `/technician-onboarding`      | Entry point for new technicians                   |
| `/help` `/help-center`        | Help centre with search + contact support         |
| `/booking-management`         | Customer booking management                       |
| `/chat-communication`         | Placeholder for messaging module (protected)      |
| `/admin-dashboard`            | Admin placeholder (restricted to role `admin`)    |

`ProtectedRoute` components wrap routes to enforce JWT-based role checks.

---

## Notable Workflows

### 1. OTP Registration
1. User submits email + basic info → `/api/auth/send-otp`.
2. OTP stored hashed in MongoDB (`OtpToken` model) with 5-minute TTL.
3. User enters code in modal → `/api/auth/verify-otp`.
4. On success, registration proceeds using the validated email.

### 2. Technician KYC
1. Technician uploads government ID + optional selfie via `POST /api/technicians/me/kyc`.
2. Files stored under `/uploads/kyc/*` and old assets are removed.
3. Status transitions: `not_submitted` → `under_review` → (`approved` or `rejected`).
4. Technicians cannot accept jobs or go online until `approved`.

### 3. Help Centre & Support
1. `ensureHelpCenterSeed()` populates baseline articles on first boot.
2. Frontend fetches categories + featured articles, provides search with text index fallback.
3. Users rated articles, feedback recorded per JWT or fingerprint.
4. Contact form posts support tickets to `/api/support/tickets`.

---

## Development Notes

- **Proxy configuration**: Adjust Vite proxy in `frontend/vite.config.mjs` if your backend runs on a different host/port.
- **Uploads**: KYC documents are served from `/uploads/kyc`. Ensure the uploads directory exists or is writable in production.
- **Caching**: ETag is disabled in the backend to avoid stale dashboard payloads.
- **Email delivery**: For non-Gmail SMTP servers configure `EMAIL_*` accordingly; the Nodemailer transport auto-detects the provider.
- **Error handling**: API responses follow a consistent `{ error: string }` shape on failure for simpler frontend consumption.

---

## Roadmap Ideas

- Admin moderation dashboard for KYC approvals and ticket responses.
- Notifications & messaging via websockets.
- Payment gateway integration for booking deposits.
- Automated tests (unit + integration) and CI pipeline.
- Deployment scripts (Docker/Compose, Terraform, etc.).

---

Happy building! 🚀
