# AI LMS SaaS

An AI-powered Learning Management System that lets you create personalized AI tutors (companions) for voice-based learning sessions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router DOM v7 |
| Auth / DB | Supabase (PostgreSQL + Auth + RLS) |
| Voice AI | Vapi AI |
| Payments | Stripe |
| Production | Nginx, Docker |

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and **Docker Compose** (for containerized setup)
- A **Supabase** project ([supabase.com](https://supabase.com))
- (Optional) **Vapi AI** account for voice features
- (Optional) **Stripe** account for payment processing

## Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |
| `VITE_VAPI_API_KEY` | No | Vapi AI key for voice sessions |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key for payments |

> **Note:** The app includes hardcoded fallback values for all keys in `src/lib/config.ts`, so it will run even without a `.env` file. However, setting your own Supabase project is recommended.

## Database Setup

1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Copy the entire contents of `supabase-schema.sql` and run it
4. This creates 4 tables (`users`, `companions`, `sessions`, `subscriptions`) with Row Level Security policies and auto-update triggers

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env with your Supabase credentials
cp .env.example .env

# 3. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

### Other Local Commands

```bash
npm run build       # Type-check + production build (output: dist/)
npm run preview     # Preview the production build locally
npm run typecheck   # TypeScript type checking only
```

## Running with Docker

```bash
# 1. Create .env with your credentials
cp .env.example .env

# 2. Build and start
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

The app runs at `http://localhost:8080`.

### Docker Commands

```bash
docker compose up --build      # Build image and start container
docker compose up --build -d   # Same, in background
docker compose down            # Stop and remove container
docker compose logs -f         # Stream container logs
docker compose exec app sh     # Open a shell in the container
```

### How Docker Build Works

The Dockerfile uses a multi-stage build:

1. **Builder stage** (`node:20-alpine`) - Installs dependencies and runs `npm run build`. Environment variables are injected as build args so Vite can embed them into the bundle.
2. **Production stage** (`nginx:alpine`) - Copies the built static files and serves them with Nginx on port 80.

Docker Compose reads your `.env` file and passes the values as build arguments automatically.

## Project Structure

```
src/
  components/
    ui/                   # shadcn/ui components (button, card, input, etc.)
    dashboard-layout.tsx  # Dashboard shell (sidebar + header)
    header.tsx            # Top navigation bar
    sidebar.tsx           # Collapsible sidebar navigation
  lib/
    auth-context.tsx      # AuthProvider + useAuth hook (Supabase Auth)
    config.ts             # Fallback API keys
    supabase.ts           # Supabase client singleton
    utils.ts              # cn() utility (clsx + tailwind-merge)
  pages/
    home.tsx              # Landing page
    sign-in.tsx           # Sign in form
    sign-up.tsx           # Sign up form
    pricing.tsx           # Pricing (Free / Pro)
    dashboard.tsx         # Dashboard overview
    companions.tsx        # AI companion CRUD
    session.tsx           # Live voice learning session
    sessions.tsx          # Session history
    analytics.tsx         # Learning analytics
    profile.tsx           # User profile & subscription
  types/
    index.ts              # TypeScript interfaces
  App.tsx                 # Root component with routes
  main.tsx                # Entry point
  index.css               # Global styles + CSS variables
```

## Routes

| Path | Page | Auth |
|------|------|------|
| `/` | Landing page | No |
| `/sign-in` | Sign in | No |
| `/sign-up` | Sign up | No |
| `/pricing` | Pricing plans | No |
| `/dashboard` | Dashboard overview | Yes |
| `/dashboard/companions` | Manage AI companions | Yes |
| `/dashboard/companions/:id` | Live learning session | Yes |
| `/dashboard/sessions` | Session history | Yes |
| `/dashboard/analytics` | Learning analytics | Yes |
| `/dashboard/profile` | User profile | Yes |

## API / Services

- **Supabase** handles authentication (email/password), database (PostgreSQL), and row-level security
- **Vapi AI** powers real-time voice conversations with AI tutors (integration is currently simulated for demo)
- **Stripe** manages subscription billing (Free tier: 10 sessions/month, Pro tier: unlimited)

## Troubleshooting

**Build fails with TypeScript errors:**
```bash
npm run typecheck
```

**Docker build fails or uses wrong env vars:**
```bash
docker compose down
docker system prune -f
docker compose up --build --no-cache
```

**Supabase connection issues:**
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Make sure you ran `supabase-schema.sql` in your Supabase SQL Editor
- Check that RLS policies are enabled on all tables

**Port 8080 already in use:**
Edit `docker-compose.yml` and change `"8080:80"` to another port like `"3000:80"`.
