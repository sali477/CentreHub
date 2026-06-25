# CentreHub Morocco

A full-stack educational platform connecting students with centers, teachers, and courses across Morocco.

## Features

- Multi-role authentication (Student, Teacher, Center Owner, Admin)
- Center discovery with filters, maps, and reviews
- Course enrollment, progress tracking, quizzes, and exams
- Real-time messaging and live classes (WebRTC + Socket.io)
- Center owner dashboard (teachers, courses, revenue, analytics)
- Stripe and CMI payment integration
- **CentreHub AI** — ChatGPT-style assistant (`/ai` page + floating widget), MongoDB chat history
- Optional AI features (search, quiz generation)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, Redux Toolkit, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, MongoDB, Mongoose, Socket.io |
| Auth | JWT, Google OAuth |
| Media | Cloudinary |
| Payments | Stripe, CMI |
| DevOps | Docker Compose, GitHub Actions |

## Project Structure

```
CenterHubApp/
├── backend/          # Express API + MongoDB
├── frontend/         # React SPA
├── docker-compose.yml
├── .github/workflows # CI pipeline
└── ROADMAP.md        # Feature roadmap
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Optional: Cloudinary, Google OAuth/Maps, Groq API, Stripe keys

### Quick Start (recommended)

```bash
# Clone the repository
git clone https://github.com/sali477/CenterHubApp.git
cd CenterHubApp

# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Configure environment files
cp backend/.env.example backend/.env    # Linux/macOS
copy backend\.env.example backend\.env   # Windows

cp frontend/.env.example frontend/.env
copy frontend\.env.example frontend\.env

# Start backend + frontend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

### Run Services Separately

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Web app
cd frontend && npm run dev
```

### Troubleshooting: `ECONNREFUSED 127.0.0.1:5000`

Vite proxies `/api` to the backend. This error means the **API server is not running** (or not ready yet).

1. Start both apps from the project root: `npm run dev`
2. Or start the backend in a separate terminal: `cd backend && npm run dev`
3. Wait until you see: `CentreHub Morocco API running on http://127.0.0.1:5000`
4. Confirm: open http://127.0.0.1:5000/api/health
5. If port 5000 is busy: `cd backend && npm run kill-port`, then `npm run dev` again
6. Ensure **MongoDB** is running (Windows service “MongoDB” or `mongod`)

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all configuration options.  
Only `MONGODB_URI` and `JWT_SECRET` are required for basic local development.

### CentreHub AI chat

- Full page: http://localhost:5173/ai
- Floating widget: purple button on every page (except `/ai`)
- Logged-in users: multiple conversations saved in MongoDB
- Guests: local browser history only

### Enable AI chat (Groq)

The assistant uses **Groq** (`llama-3.3-70b-versatile`). Set `GROQ_API_KEY` in `backend/.env`.

1. Create an API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Edit `backend/.env`:

   ```
   GROQ_API_KEY=your-groq-api-key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. **Restart the backend** — env vars load only on startup.
4. Verify:

   ```bash
   cd backend
   npm run check:groq
   ```

5. Open http://127.0.0.1:5000/api/ai/status — `"configured": true` means it is working.

On startup you should see: `AI chat: groq (llama-3.3-70b-versatile)` in the backend terminal.

## Docker

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/centers` | List centers |
| GET | `/api/courses` | List courses |
| POST | `/api/enrollments` | Enroll in a course |
| POST | `/api/ai/smart-search` | AI-powered search |
| GET | `/api/admin/analytics` | Admin analytics |

## User Roles

| Role | Capabilities |
|------|--------------|
| Student | Search, enroll, track progress |
| Teacher | Create courses, live sessions, join centers |
| Center Owner | Manage center, teachers, courses, revenue |
| Admin | Verify accounts, reports, platform analytics |

## Creating an Admin User

After registering, update the role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@centrehub.ma" },
  { $set: { role: "admin", isVerified: true } }
)
```

## License

MIT — see [LICENSE](LICENSE).
