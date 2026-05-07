# Manoj Portfolio — Embedded Systems

A unique "system architecture diagram" portfolio where each section is an IC-style module connected by animated binary data streams. Built with React + FastAPI + MongoDB.

## ✨ Features
- System architecture aesthetic — modules with chip pins, animated binary/hex data buses
- Linux flavour — kernel boot log, rotating shell prompts, sudo-style admin login
- 8 sections: Core (hero), About, Skills, Projects, Experience, Education, Certifications, Contact
- Live admin panel at `/admin` — JSON editors for every section, contact-message inbox
- MongoDB-backed content with mock fallback if API is down

## 🧱 Tech Stack
- **Frontend:** React 19 (CRA + craco), TailwindCSS, shadcn/ui, lucide-react
- **Backend:** FastAPI, Motor (async MongoDB), PyJWT
- **Database:** MongoDB

## 🚀 Local Setup

```bash
# Backend
cd backend
cp .env.example .env       # fill in MONGO_URL, ADMIN_PASSWORD, JWT_SECRET
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend
cp .env.example .env       # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

Open http://localhost:3000 — admin at http://localhost:3000/admin

## 🔑 Admin
- Path: `/admin`
- Password: value of `ADMIN_PASSWORD` in `backend/.env`
- Edit any section as JSON; messages from the contact form land in the **Inbox** tab.

## 🛠 API Reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/content` | public | Full portfolio content (seeds defaults on first run) |
| POST | `/api/messages` | public | Save a contact-form submission |
| POST | `/api/admin/login` | password | Returns JWT |
| GET | `/api/admin/me` | bearer | Verify token |
| PUT | `/api/admin/content` | bearer | Partial update of content sections |
| GET | `/api/admin/messages` | bearer | List inbox |
| DELETE | `/api/admin/messages/{id}` | bearer | Delete a message |

## 📄 License
Personal portfolio — all rights reserved by Manoj.
