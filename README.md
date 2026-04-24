# RealTimeChatApp (MERN + Socket.io)

A full-stack real-time communication platform built with the MERN stack.

It includes:
- JWT authentication with role-based access (`admin`, `organizer`, `user`)
- Real-time 1:1 and group chat using Socket.io
- Message reactions, edit/delete, read receipts, typing indicators
- File/image upload via Cloudinary
- Dashboard analytics (MongoDB-backed)
- Events and Products modules with search/filter/pagination
- Modern responsive frontend (React + Vite + Tailwind v4 + Framer Motion)

---

## 1) Project Analysis (Current State)

### Backend summary
The backend is an Express API server connected to MongoDB via Mongoose, with Socket.io attached to the same HTTP server.

Core responsibilities:
- Auth: register/login/profile/forgot/reset password/avatar upload
- Chat: private/group creation and membership operations
- Messaging: text/image/file messages + read status + reactions + edits/deletes
- Business modules: events/products CRUD (read + create currently)
- Analytics: dashboard summary from live MongoDB data

### Frontend summary
The frontend is a Vite React app using:
- React Router for route groups (`/`, auth routes, `/app/*` protected area)
- Axios service layer for API integration
- Contexts for auth/theme/notifications
- Tailwind CSS v4 + Framer Motion for modern UI/UX
- Socket.io client for live chat updates

### Data is live (MongoDB-backed)
Pages using real DB/API data:
- Dashboard (`/api/dashboard/summary`)
- Events (`/api/events`)
- Products (`/api/products`)
- Chat + messages (`/api/chat`, `/api/message`) + sockets

### Seed support
A seed script exists and has been integrated:
- `backend/scripts/seedData.js`
- `npm run seed` (inside `backend/`)

It upserts sample events/products and ensures at least one user exists.

---

## 2) Monorepo Structure

```text
RealTimeChatApp/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    server.js
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      routes/
      services/
      utils/
    vite.config.js
```

---

## 3) Tech Stack

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Socket.io
- Multer + Cloudinary

### Frontend
- React 19 + Vite
- React Router DOM
- Axios
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Recharts
- Socket.io Client

---

## 4) Data Models

### User
Main fields:
- `name`, `email`, `password` (hashed)
- `avatar`, `bio`
- `role`: `admin | organizer | user`
- `isOnline`, `lastSeen`
- `resetPasswordToken`, `resetPasswordExpire`

### Chat
- `chatName`
- `isGroupChat`
- `users[]`
- `latestMessage`
- `groupAdmin`

### Message
- `sender`, `chat`
- `content`
- `messageType`: `text | image | file`
- `fileUrl`, `fileName`
- `readBy[]`
- `reactions[]`
- `edited`

### Event
- `title`, `category`, `city`, `date`, `description`
- `createdBy`

### Product
- `name`, `type`, `price`, `rating`, `description`
- `createdBy`

---

## 5) API Overview

Base URL (backend): `http://localhost:5000/api`
Swagger UI: `http://localhost:5000/api/docs`

### Auth routes
- `POST /auth/register`
- `POST /auth/admin/create-user` (admin only)
- `POST /auth/login`
- `POST /auth/refresh` (refresh via httpOnly cookie)
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me` (protected)
- `PUT /auth/profile` (protected)
- `PUT /auth/profile/avatar` (protected, multipart)
- `GET /auth/users?search=...` (protected)

### Chat routes
- `POST /chat` (access/create direct chat)
- `GET /chat` (fetch user chats)
- `POST /chat/group`
- `PUT /chat/rename`
- `PUT /chat/group-add`
- `PUT /chat/group-remove`

### Message routes
- `POST /message/upload` (multipart)
- `POST /message/read`
- `POST /message/react`
- `POST /message`
- `PUT /message` (edit)
- `DELETE /message`
- `GET /message/:chatId`

### Dashboard / Events / Products
- `GET /dashboard/summary`
- `GET /events?search=&category=&page=&limit=`
- `POST /events` (admin/organizer)
- `GET /products?search=&page=&limit=`
- `POST /products` (admin/organizer)

---

## 6) Socket.io Events

### Client emits
- `setup`
- `join chat`
- `typing`
- `stop typing`
- `new message`
- `messages seen`
- `message reaction`
- `message edited`
- `message deleted`
- `user online`
- `user offline`

### Server emits
- `connected`
- `typing`
- `stop typing`
- `message received`
- `messages seen`
- `message reaction`
- `message edited`
- `message deleted`
- `user online`
- `user offline`

---

## 7) Frontend Routes

Public:
- `/`
- `/login`
- `/register`
- `/forgot-password`

Protected app shell:
- `/app/dashboard`
- `/app/chat`
- `/app/events`
- `/app/products`
- `/app/profile`
- `/app/admin` (admin only)

Error routes:
- `/unauthorized`
- `*` -> NotFound

---

## 8) Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_jwt_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=7
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000/api

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
# optional override
VITE_SOCKET_URL=http://localhost:5000
```

---

## 9) Local Setup

### Prerequisites
- Node.js 18+
- npm
- MongoDB (Atlas/local)

### Install

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### Run dev servers

Terminal 1:
```bash
cd backend
npm run server
```

Terminal 2:
```bash
cd frontend
npm run dev
```

### Seed database

```bash
cd backend
npm run seed
```

---

## 10) Build & Quality

Frontend:
```bash
cd frontend
npm run lint
npm run build
npm run preview
```

Backend scripts:
```bash
cd backend
npm run server
npm run seed
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## 11) Current Notes / Caveats

- Refresh tokens are stored as hashed values in MongoDB and sent via httpOnly cookies; access tokens are short-lived.
- `forgot-password` only returns `resetToken` outside production to support local testing.
- Backend now has a Vitest test suite (unit + integration + e2e API flow).
- Frontend route-level lazy loading has been added to reduce initial bundle size.

---

## 12) Suggested Next Improvements

- Integrate real email delivery (SendGrid/SES/Nodemailer) for password reset links.
- Add revoke-all-sessions and device/session management UI.
- Expand Swagger docs with detailed schemas/examples for every endpoint.
- Add frontend e2e browser tests (Playwright/Cypress) for auth/chat/dashboard flows.
- Add CI pipeline to run lint/tests/build automatically on PRs.

---

## 13) Production Hardening (Implemented)

- Backend security headers, request IDs, sanitized input middleware, and rate limiting.
- Auth flow hardened with `httpOnly` access + refresh cookies.
- Improved API resiliency with retry/backoff for transient failures.
- Frontend error boundary + route skeleton fallback.
- SEO meta + Open Graph tags in `index.html`.
- Session data moved from persistent `localStorage` to `sessionStorage`.
- CI workflow added at `.github/workflows/ci.yml`.
- Deployment checklist added at `docs/production-checklist.md`.
