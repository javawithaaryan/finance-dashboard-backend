# Finance Dashboard Backend

A RESTful backend for a finance dashboard with role-based access control.

## Stack
- Node.js + Express
- SQLite (`better-sqlite3`)
- JWT Authentication
- express-validator

## Setup

1. Clone and install:
   npm install

2. Configure `.env`:
   JWT_SECRET=supersecretkey123
   PORT=3000

3. Start:
   node src/app.js

4. Database notes:
   - SQLite DB file (`finance.db`) is created automatically at runtime.
   - Tables are auto-created from `src/db.js` on startup.

## Roles
| Role | Permissions |
|------|-------------|
| viewer | View records & dashboard |
| analyst | View records & dashboard |
| admin | Full CRUD + manage users |

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users (Admin only)
- GET /api/users
- PATCH /api/users/:id/role
- PATCH /api/users/:id/status

### Records
- GET /api/records?type=&category=&from=&to=&page=&limit=
- POST /api/records (admin)
- PUT /api/records/:id (admin)
- DELETE /api/records/:id (admin, soft delete)

### Dashboard (all roles)
- GET /api/dashboard/summary

## Assumptions
- Soft delete used for records (is_deleted flag)
- Analyst and Viewer have same read permissions
- JWT stored client-side, sent as Bearer token
