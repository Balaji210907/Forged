# Deployment Architecture

This project has been refactored to use a split architecture:
- **Frontend**: React application deployed on Vercel
- **Backend**: Express/Node.js API deployed on Render
- **Database**: Supabase (PostgreSQL)

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Vercel    │         │   Render    │         │  Supabase   │
│  (Frontend) │────────▶│  (Backend)  │────────▶│ (Database)  │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Frontend (Vercel)

The frontend is a TanStack Start application that:
- Handles all UI rendering and user interactions
- Manages Supabase authentication client-side
- Makes API calls to the backend for AI generation
- Uses Supabase directly for database queries (with RLS)

### Environment Variables (Vercel)

Set these in your Vercel project settings:

```bash
VITE_SUPABASE_URL=https://osrkkhugqczpisydteoa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=osrkkhugqczpisydteoa
VITE_BACKEND_API_URL=https://your-backend-url.onrender.com
```

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Import the project
3. Set the environment variables above
4. Deploy

## Backend (Render)

The backend is an Express.js server that:
- Handles the `/api/generate` endpoint for AI-powered code generation
- Manages AI gateway integration with Lovable
- Performs authenticated database operations
- Implements file write/delete tools for the AI

### Environment Variables (Render)

Set these in your Render service:

```bash
PORT=3001
SUPABASE_URL=https://osrkkhugqczpisydteoa.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOVABLE_API_KEY=your_lovable_api_key
```

### Deployment Steps

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Set the environment variables above
5. Deploy

## Database (Supabase)

Supabase is used as the database and authentication provider. It includes:
- PostgreSQL database
- Row Level Security (RLS) policies
- Authentication system
- Real-time subscriptions

### Required Tables

The following tables should exist in your Supabase project:
- `projects` - User projects
- `project_files` - Virtual filesystem for projects
- `chat_messages` - Chat history
- `checkpoints` - Project snapshots

### Environment Variables

Both frontend and backend need Supabase credentials:
- Frontend uses the publishable key (client-side)
- Backend uses the service role key (server-side, bypasses RLS)

## Local Development

### Frontend

```bash
cd forge-studio-98278aa2-main
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

The backend will run on `http://localhost:3001`

## API Communication

The frontend communicates with the backend via the `/api/generate` endpoint:

```typescript
// Frontend (ChatPane.tsx)
const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || "/api/generate";
const transport = new DefaultChatTransport({
  api: backendApiUrl,
  // ...
});
```

## Security Considerations

1. **CORS**: The backend uses CORS to allow frontend requests
2. **Authentication**: All API calls include the Supabase auth token
3. **RLS**: Database queries use Row Level Security for user data
4. **Service Role Key**: Backend uses service role key for admin operations
5. **Environment Variables**: Sensitive keys are never committed to git

## Troubleshooting

### Frontend can't connect to backend
- Ensure `VITE_BACKEND_API_URL` is set correctly in Vercel
- Check that the backend is running and accessible
- Verify CORS settings on the backend

### Backend authentication fails
- Verify `SUPABASE_PUBLISHABLE_KEY` is correct
- Check that the token is being passed in the Authorization header
- Ensure Supabase auth is properly configured

### Database connection issues
- Verify Supabase URL and keys are correct
- Check that RLS policies allow the required operations
- Ensure the backend service role key has proper permissions
