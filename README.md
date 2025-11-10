# SmartTech Connect

SmartTech Connect is a full-stack hyperlocal marketplace that connects households with verified technicians.  
The codebase pairs a Vite/React frontend with an Express/MongoDB backend and now includes specialty-driven technician matching, KYC-enforced onboarding, surge-aware pricing, collaborative booking flows, live tracking, and in-app messaging.

> Original GitHub source: [subodh-001/smarttech_connect-main](https://github.com/subodh-001/smarttech_connect-main.git).  
> This fork re-organises the repo into `frontend/` and `backend/` workspaces and layers in all functionality documented below.

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
10. [Key Workflows](#key-workflows)  
11. [Development Notes](#development-notes)  
12. [Roadmap Ideas](#roadmap-ideas)

---

## Features

### Customer Experience
- **OTP-protected onboarding** – timeboxed email verification with hashed codes.
- **Dynamic dashboard & booking stats** – active jobs, completed bookings, rupee-formatted spending, recommendations.
- **Service request creation** – category + subcategory + description validation; priority-based surge pricing (+10% high, +20% urgent) baked into the request payload.
- **Technician discovery & matching** – filters by specialties, live distance/ETA, responsive list + map, comparison modal, and a pending “Request Booking” flow that requires technician confirmation.
- **Booking management** – end-to-end CRUD of created requests, reschedule, cancel, submit reviews, and view complete history in INR.
- **Live chat with technicians** – real conversations backed by persisted message history (text, location, images, booking updates) and booking context panel.
- **Live tracking** – fully data-driven service tracking page showing map, route, ETA, service phases, technician info, and notifications.
- **Help centre & support** – searchable knowledge base plus support ticket creation.

### Technician Experience
- **KYC workflow** – upload government ID/selfie, auto-track status, capture review feedback for rejected attempts.
- **Profile & specialties** – manage multi-specialty expertise, service radius, years of experience, certifications, hourly rate, bio.
- **Availability control** – toggle online/offline post-KYC, update last-known location, and view jobs filtered by pending/active/completed.
- **Job matching & acceptance** – see only requests inside specialty radius, receive pending bookings to approve, and update job status through the technician dashboard.
- **Earnings dashboard** – daily/weekly/monthly insights with rupee formatting, completion ratio, and badges.

### Platform & Admin
- **Role-based JWT auth** with middleware guards (`user`, `technician`, `admin`).
- **Admin dashboard** – user/technician/service overview cards, document links, KYC review queue, live stats, and reports pipeline improvements.
- **Technician matching service** – radius filtering with Haversine distance, ETA computation, and surge price projection (used by booking + technician search pages).
- **Messaging persistence** – service requests now embed conversation history; REST endpoints power the chat UI.
- **Support ticket logging** and **Help centre seeding** remain intact.

---

## Architecture

```
smarttech_connect-main/
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared UI primitives
│   │   ├── pages/               # Route-level views (dashboards, booking, chat, tracking, admin, etc.)
│   │   ├── contexts/            # Auth & global providers (JWT-aware)
│   │   └── utils/hooks/assets   # Helpers and styling
│   └── vite.config.mjs          # Dev server & proxy configuration
├── backend/
│   ├── src/
│   │   ├── index.js             # App bootstrap, database connection, seeding
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── models/              # Mongoose schemas (User, Technician, ServiceRequest, HelpArticle, SupportTicket, OtpToken, etc.)
│   │   ├── routes/              # REST endpoints (auth, users, technicians, service-requests, dashboard, help-center, support)
│   │   └── services/            # Matching & utility modules
│   └── .env.example             # Env hints
└── README.md
```

- Frontend API calls proxy to `http://localhost:5000` during dev.
- Backend defaults to `PORT=5000` but honours `process.env.PORT`.

---

## Tech Stack

| Layer      | Main Libraries & Tools |
|------------|------------------------|
| **Frontend** | React 18, Vite, React Router v6, Zustand/Auth context, Tailwind CSS, Lucide Icons, Framer Motion, React Hook Form, Axios, Recharts |
| **Backend**  | Node.js, Express, Mongoose, MongoDB Atlas, bcrypt, jsonwebtoken, Nodemailer, Multer, MongoDB Memory Server |
| **Tooling**  | ESLint, Prettier, Nodemon, npm scripts |

---

## Getting Started

### Prerequisites
- Node.js **18+**
- npm (included with Node)
- MongoDB Atlas account (or rely on in-memory fallback for local testing)

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
See [Environment Variables](#environment-variables) and create `backend/.env`.

### 4. Start development servers
Run backend first, then frontend.
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

---

## Environment Variables

`backend/.env` (example values):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@smarttech.xc49ynv.mongodb.net/?appName=SmartTech
JWT_SECRET=change-me
EMAIL_USER=your_gmail_username@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="SmartTech Connect <your_gmail_username@gmail.com>"
PORT=5000
ENABLE_DEMO_SEED=true
```
- `ENABLE_DEMO_SEED` populates demo users/technicians/requests for testing.
- Without `MONGODB_URI`, the backend spins up an in-memory MongoDB.
- Frontend does not require env vars but accepts standard Vite `VITE_*` flags.

---

## Available Scripts

### Frontend (`frontend/`)
| Command           | Description                                 |
|-------------------|---------------------------------------------|
| `npm run dev`     | Start Vite dev server                        |
| `npm run build`   | Production build (outputs to `dist/`)        |
| `npm run preview` | Preview the production build locally         |

### Backend (`backend/`)
| Command           | Description                                 |
|-------------------|---------------------------------------------|
| `npm run dev`     | Nodemon auto-reload server                   |
| `npm start`       | Production server                            |
| `npm run create-admin -- <email> <password> "Name"` | Promote or create an admin |

---

## Demo Accounts & Seed Data

With `ENABLE_DEMO_SEED=true` on startup:

| Role        | Email                     | Password     | Notes                                           |
|-------------|---------------------------|--------------|-------------------------------------------------|
| Customer    | `demo.user@example.com`   | `Demo@12345` | Pre-filled bookings & chat history              |
| Technician  | `demo.tech@example.com`   | `Demo@12345` | Specialties, location, pending bookings         |
| Admin       | `demo.admin@example.com`  | `Demo@12345` | Full dashboard access                           |

Disable the flag to remove demo artefacts for clean environments. KYC uploads reset unless already approved.

---

## API Overview

Key REST endpoints (`/api/*`):

| Method & Path                                  | Purpose                                                            |
|------------------------------------------------|--------------------------------------------------------------------|
| `POST /api/auth/send-otp`                      | Issue OTP for registration/password reset                         |
| `POST /api/auth/verify-otp`                    | Validate OTP                                                       |
| `POST /api/auth/register` / `POST /auth/login` | Register or login users                                            |
| `GET /api/users/me` / `PUT /api/users/me`      | Fetch/update authenticated profile                                |
| `GET /api/dashboard/user`                      | Customer dashboard metrics                                         |
| `GET /api/service-requests`                    | List requests (filtered by role + query params)                    |
| `POST /api/service-requests`                   | Create a service request                                           |
| `PATCH /api/service-requests/:id/status`       | Update status, final cost, technician assignment, review fields    |
| `GET /api/service-requests/:id`                | Fetch single request                                               |
| `GET /api/service-requests/conversations`      | Summaries for in-app messaging                                     |
| `GET /api/service-requests/:id/messages`       | Paginated conversation history (marks incoming messages as read)   |
| `POST /api/service-requests/:id/messages`      | Send message (text/image/location/booking update)                  |
| `GET /api/service-requests/available`          | Technician job pool                                                |
| `GET /api/technicians/available`               | Specialty + radius-based matching feed                             |
| `GET/PUT /api/technicians/me/profile`          | Manage technician specialties, bio, rates, radius                  |
| `GET /api/technicians/me/kyc` / `POST ...`     | Technician KYC status & uploads                                    |
| `GET /api/help-center/*` / `POST /feedback`    | Help centre browsing & feedback                                    |
| `POST /api/support/tickets` / `GET`            | Submit and list support tickets                                    |

All protected routes expect `Authorization: Bearer <token>`.

---

## Frontend Routes

| Path                          | Description / Access                                                    |
|-------------------------------|---------------------------------------------------------------------------|
| `/`                           | Role-based landing redirect                                              |
| `/user-login`                 | Unified login (OTP + password)                                           |
| `/user-registration`          | Registration wizard with OTP verification                                |
| `/forgot-password`            | Request + confirm reset                                                   |
| `/user-dashboard`             | Customer dashboard (role `user`)                                         |
| `/user-profile`               | Profile editor, KYC status, notification preferences                      |
| `/service-request-creation`   | Request creation wizard (category, location, scheduling, surge pricing)   |
| `/technician-selection`       | Technician list/map with specialty filtering and booking request flow     |
| `/technician-dashboard`       | Technician dashboards, live jobs, availability toggle                     |
| `/booking-management`         | Manage customer bookings (reschedule, cancel, review)                     |
| `/chat-communication`         | Full messaging experience (requires authenticated user or technician)     |
| `/live-tracking`              | Real-time tracking for the active/pending booking                         |
| `/help` / `/help-center`      | Help centre and support ticket entry                                     |
| `/admin-dashboard`            | Admin control panel (role `admin`)                                       |

---

## Key Workflows

### Booking Flow
1. Customer submits request with category, description (>=30 chars), budget, schedule.
2. Backend stores request with computed surge pricing and matches technicians by specialty & radius.
3. Customer reviews technicians (distance, ETA, surge rate) and submits a **pending** booking request.
4. Technician sees pending job, accepts/declines, and updates status (confirmed → in progress → completed).
5. Customer monitors status in Booking Management and Live Tracking; can reschedule, cancel with refund guidance, or review after completion.

### Messaging
1. Each service request has an embedded conversation array.
2. `/conversations` returns lightweight cards (participant, booking summary, unread count).
3. `/messages` returns chronological history, marking inbound messages as read.
4. `/messages` POST supports `text`, `image` (base64 or URL), `location` (lat/lng), and `booking_update` types.
5. Frontend chat renders status indicators, location previews, image previews, and quick actions.

### Technician Specialties & KYC
1. Technician edits specialties/experience/radius via `/api/technicians/me/profile`.
2. Matching service ensures only relevant technicians appear for a given category.
3. KYC uploads (gov ID + selfie) stored under `/uploads/kyc`, with statuses reflected across dashboards.
4. Until KYC is approved, technicians cannot toggle availability or accept jobs.

---

## Development Notes
- **Proxy configuration**: update `frontend/vite.config.mjs` if backend host/port changes.
- **Uploads**: ensure `/uploads/kyc` exists and is writable in production deployments.
- **Mongo Memory fallback**: great for local development; disable for production.
- **Error handling**: API errors conform to `{ error: string }` responses, simplifying frontend alerts.
- **Rupee formatting**: all monetary displays rely on `toLocaleString('en-IN')` for currency consistency.

---

## Roadmap Ideas
- Admin moderation UI for approving KYC documents and responding to tickets in-app.
- Real-time notifications via WebSockets (booking updates, message receipts).
- Payment integration for deposits and invoices.
- Automated testing (unit + integration) and CI pipeline.
- Infrastructure-as-code + Dockerisation for reproducible deployments.

---

Happy building! 🚀
