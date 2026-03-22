# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedVoice is a clinical documentation platform where physicians dictate notes that are converted into structured SOAP reports via the Anthropic Claude API.

## Development Setup

**Prerequisites**: Node.js 20+, Docker Desktop

```bash
# Start databases (PostgreSQL + Redis)
docker-compose up -d

# Backend setup
cd backend && npm install
cp .env.example .env  # then add ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npx prisma generate
npm run dev  # http://localhost:3001

# Frontend setup (separate terminal)
cd frontend && npm install
npm run dev  # http://localhost:5173
```

## Common Commands

```bash
# Backend
cd backend
npm run dev           # Start with hot reload (tsx watch)
npm run build         # Compile TypeScript to dist/
npm test              # Run Vitest
npx prisma migrate dev --name <name>  # Create + apply migration
npx prisma studio     # Open Prisma GUI

# Frontend
cd frontend
npm run dev           # Vite dev server
npm run build         # TypeScript check + Vite bundle
npm test              # Run Vitest
```

## Architecture

**Stack**: React 18 + Vite + Tailwind (frontend) · Express + Prisma + PostgreSQL (backend) · Redis (caching) · Anthropic Claude API (AI)

**Auth**: JWT issued on login, validated via `authMiddleware` on protected routes. Token stored in Zustand (`frontend/src/store/`) and sent as `Authorization: Bearer <token>`.

**AI Report Generation**: `POST /api/visits` triggers `backend/src/services/` which calls the Claude API to convert a raw dictated note into a structured SOAP report (chiefComplaint, historyOfPresentIllness, physicalExamination, assessment, plan). Reports are locked after signing (`status: SIGNED`).

**Frontend API calls**: All requests go to `/api/*` — Vite proxies this to `http://localhost:3001` in dev. The API client wrapper lives in `frontend/src/lib/`.

**Data flow**:
1. Doctor creates visit with raw note → backend calls Claude → Report created in DB
2. Doctor edits Report fields (DRAFT only) via `PATCH /api/visits/:id/report`
3. Doctor signs visit → `POST /api/visits/:id/sign` → status locked to SIGNED

**Key models**: `Doctor` → `Visit` → `Report` (1:1), `Visit` → `Patient` (many:1), `AuditLog` (compliance trail per visit action)

## Environment Variables

All defined in `backend/.env.example`. Key ones:
- `ANTHROPIC_API_KEY` — required for report generation
- `DATABASE_URL` — defaults to `postgresql://medvoice:medvoice_dev@localhost:5432/medvoice`
- `JWT_SECRET` — must be at least 32 chars
- `AWS_*` — S3 credentials for audio file storage (optional in dev)
- `FRONTEND_URL` — used for CORS (`http://localhost:5173` in dev)
