# Portfolio Backend Contracts

## Goals
- Persist all portfolio content in MongoDB so it can be edited later without touching code.
- Public endpoint returns content; admin endpoint updates it.
- Contact form (UART_TX) writes messages to DB; admin reads/deletes them.

## Environment
- `MONGO_URL`, `DB_NAME` — already set
- `ADMIN_PASSWORD` — single password for admin login (added to `backend/.env`)
- `JWT_SECRET` — signs admin session tokens (added to `backend/.env`)

## Collections
- `portfolio_content` — single doc `{ _id: "main", profile, about, skills, projects, experience, education, certifications, updatedAt }`
- `contact_messages` — `{ id (uuid), name, email, message, createdAt }`

## Public API (no auth)
- `GET /api/content` → full content doc. If missing, seeds from defaults and returns it.
- `POST /api/messages` → `{ name, email, message }` → creates message, returns `{ ok: true, id }`.

## Admin API (Bearer JWT)
- `POST /api/admin/login` → `{ password }` → `{ token, expiresAt }` if password matches.
- `GET /api/admin/me` → verify token.
- `PUT /api/admin/content` → `{ profile, about, skills, projects, experience, education, certifications }` (partial allowed) → returns updated doc.
- `GET /api/admin/messages` → list of messages (newest first).
- `DELETE /api/admin/messages/{id}` → deletes a message.

## Frontend changes
- Remove direct imports from `mock.js`; use new `ContentProvider` that:
  1. Calls `GET /api/content` on mount.
  2. Exposes `{ profile, about, skills, projects, experience, education, certifications, loading }` via `useContent()`.
  3. Falls back to mock defaults if API fails so the site still renders.
- `mock.js` stays as the single source of default content (used for fallback AND seeded by backend on first run).
- `Contact.jsx` POSTs to `/api/messages` instead of localStorage.
- New `/admin` route with:
  - Password login screen.
  - JSON editors for each content section + live save.
  - Inbox of contact messages with delete.

## Seeding
- On first `GET /api/content`, backend imports default content (mirrors `mock.js` structure) and inserts into MongoDB.

## Auth flow
- JWT payload: `{ sub: "admin", exp }`. TTL = 7 days.
- Frontend stores token in `localStorage.admin_token`. Attaches `Authorization: Bearer <token>` on admin calls.
