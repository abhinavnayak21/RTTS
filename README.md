<div align="center">

# RTTS — Real-Time Ticketing System 🎫⚡

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLAlchemy-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A modern, high-performance customer support and issue-tracking platform with **Interactive Kanban boards**, role-based access control (RBAC), and an enterprise-ready FastAPI backend.

</div>

---

## ✨ Key Features

- **Interactive Kanban Board:** Drag-and-drop workflow across **Open**, **In Progress**, and **Done** with glowing status pills and category tags.
- **Customer Workspace:** Dual-view toggle (Kanban Board vs. Paginated Table), in-place ticket creation, and ticket management.
- **Admin Queue:** Centralized support management, ticket triage, and operational metrics.
- **Security & RBAC:** JWT authentication, password hashing (`bcrypt`), and strict role-based access.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Custom CSS Design System, Lucide Icons
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy ORM, Pydantic v2, Alembic
- **Database:** PostgreSQL (Supabase / Render) / SQLite (Local)

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate  # On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
> API & Docs live at `http://localhost:8000/docs`

### 2. Frontend
```bash
cd frontend
pnpm install && pnpm run dev   # Or: npm install && npm run dev
```
> App will live at `http://localhost:3000`

---

## 📖 Core API Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register customer / admin | ❌ |
| `POST` | `/auth/login` | Authenticate & get JWT token | ❌ |
| `GET` / `POST` | `/tickets/` | List (with filters) / Create ticket | ✅ |
| `GET` / `PUT` / `DELETE` | `/tickets/{id}` | Inspect / Update / Delete ticket | ✅ |
| `GET` | `/admin/stats` | Platform queue metrics | ✅ (Admin) |

---

## 📄 License

MIT License.
