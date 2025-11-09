# SmartTech Connect

A full‑stack hyperlocal technician marketplace built with React (Vite) on the frontend and a Node/Express API on the backend.  
This repo now separates the codebase into clear `frontend/` and `backend/` workspaces while retaining the original functionality from the GitHub source ([subodh-001/smarttech_connect-main](https://github.com/subodh-001/smarttech_connect-main.git)).

---

## 📁 Project Structure

```
smarttech_connect-main/
├── frontend/            # Vite + React application (original src/, public/, etc.)
│   ├── package.json
│   ├── src/
│   └── ...              # Tailwind config, build output, static assets
├── backend/             # Express + MongoDB API (renamed from server/)
│   ├── package.json
│   ├── .env             # MongoDB URI & JWT secret (see below)
│   └── src/
└── README.md
```

- Everything that previously lived at the repo root (Vite project, `src/`, `public/`, `dist/`, etc.) now sits inside `frontend/`.
- The original `server/` folder has been renamed to `backend/`.

---

## 🔐 Environment Variables

The backend has been configured with the MongoDB Atlas connection string you provided:

```
backend/.env
└── MONGODB_URI=mongodb+srv://Subodh:8w-Yvsi4aA..3XU@smarttech.xc49ynv.mongodb.net/?appName=SmartTech
└── JWT_SECRET=dev-secret-change-me
└── EMAIL_USER=your_gmail_username@gmail.com
└── EMAIL_PASS=your_gmail_app_password
└── EMAIL_FROM="SmartTech Connect <your_gmail_username@gmail.com>"
```

Feel free to replace these values with your own secure credentials for production.

If the frontend requires environment variables, place them under `frontend/.env` (none are bundled by default).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Install & Run Frontend
```bash
cd frontend
npm install
npm run dev         # starts Vite dev server (default http://localhost:5173)
```

### Install & Run Backend
```bash
cd backend
npm install
npm run dev         # nodemon server on http://localhost:5000
```

> The backend automatically connects to the MongoDB Atlas cluster via `MONGODB_URI`.  
> If the URI is missing, it falls back to an in-memory MongoDB instance for local testing.

---

## 🧰 Tech Stack (unchanged from original project)

**Frontend**
- React 18 (Vite)
- React Router v6
- Redux Toolkit
- Tailwind CSS + tailwindcss-animate
- Framer Motion
- Recharts, D3.js
- React Hook Form, Axios, Lucide icons, etc.

**Backend**
- Node.js / Express
- Mongoose / MongoDB Atlas
- JWT auth, bcrypt
- MongoDB Memory Server for fallback development

---

## ✅ Migration Notes

- The entire history from the original GitHub repo has been restored into `frontend/`.
- The backend folder structure and code remain unchanged aside from the rename and refreshed `.env`.
- No source code was modified beyond moving files and updating configuration paths.

You can now continue development with a clean separation between the React frontend and the Express backend.

Happy building! 🚀
