# MedVoice — Clinical Documentation Platform

Voice-to-structured-report web app for physicians.

## Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (via Docker), Redis
- **AI**: Anthropic Claude API (report generation)
- **Auth**: JWT + bcrypt

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone & install
```bash
cd medvoice
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your ANTHROPIC_API_KEY
```

### 4. Run database migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start both servers (two terminals)
```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a doctor |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/patients | List patients |
| POST | /api/patients | Register patient |
| GET | /api/patients/:id | Patient + visit history |
| PATCH | /api/patients/:id | Update patient |
| GET | /api/visits | All visits |
| POST | /api/visits | Create visit + generate AI report |
| PATCH | /api/visits/:id/report | Edit report fields |
| POST | /api/visits/:id/sign | Sign & lock report |
| GET | /api/reports | All reports (with filters) |

## Project Structure
```
medvoice/
├── docker-compose.yml        # PostgreSQL + Redis
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Routes
│   │   ├── components/
│   │   │   └── layout/       # Sidebar layout
│   │   ├── pages/            # All screens
│   │   ├── store/auth.ts     # Zustand auth store
│   │   ├── lib/api.ts        # All API calls
│   │   └── types/index.ts    # Shared TypeScript types
│   ├── tailwind.config.js
│   └── vite.config.ts
└── backend/
    ├── src/
    │   ├── index.ts          # Express server entry
    │   ├── routes/           # auth, patients, visits, reports
    │   ├── services/
    │   │   └── reportService.ts  # Claude API integration
    │   ├── middleware/       # auth guard, error handler
    │   └── lib/prisma.ts     # DB client singleton
    └── prisma/
        └── schema.prisma     # Database schema
```
