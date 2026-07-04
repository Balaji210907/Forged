# Forge Studio Monorepo

A full-stack AI-powered web application with split architecture:

- **Frontend**: React + TanStack Start (deployed on Vercel)
- **Backend**: Express.js + Node.js (deployed on Render)
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
forge-studio-monorepo/
├── frontend/          # React application
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/           # Express API server
│   ├── server.js
│   ├── package.json
│   └── render.yaml
├── supabase/          # Supabase configuration
└── .env.example       # Environment variables template
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

- Supabase URL and keys
- Lovable API key
- Backend API URL (for frontend)
