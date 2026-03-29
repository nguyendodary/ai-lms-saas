# AI LMS SaaS

AI-powered Learning Management System. Create personalized AI tutors and learn through real-time voice conversations.

## Features

- **AI Companions** -- Create tutors with custom name, subject, topic, voice, teaching style, and session duration
- **Voice Sessions** -- Real-time voice conversations with AI tutors (powered by Vapi AI)
- **13 Subjects** -- Mathematics, Science, History, English, Computer Science, Physics, Chemistry, Biology, Geography, Art, Music, Foreign Language, Economics
- **4 Teaching Styles** -- Professional, Friendly, Socratic, Direct
- **6 Voice Options** -- Alloy, Echo, Fable, Onyx, Nova, Shimmer
- **Session History** -- Browse past sessions with full transcripts
- **Analytics Dashboard** -- Total sessions, minutes learned, daily activity chart, subject breakdown
- **Subscription Plans** -- Free (10 sessions/month) and Pro ($19.99/month, unlimited)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router DOM v7 |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Voice | Vapi AI |
| Payments | Stripe |
| Deploy | Docker, Nginx |

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- Supabase account

## Setup

### 1. Clone and install

```bash
git clone https://github.com/nguyendodary/ai-lms-saas.git
cd ai-lms-saas
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_VAPI_API_KEY` | No | Vapi AI key (voice sessions) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (payments) |

> Fallback values are hardcoded in `src/lib/config.ts`. The app works without `.env` but uses a shared database.

### 3. Database

Run `supabase-schema.sql` in your Supabase SQL Editor. This creates:

- `users` -- profiles, plan, session limits
- `companions` -- AI tutor configurations
- `sessions` -- learning session records with transcripts
- `subscriptions` -- Stripe subscription data

All tables have Row Level Security enabled.

### 4. Disable email confirmation (development)

Supabase requires email verification by default. To skip it:

**Supabase Dashboard > Authentication > Providers > Email > Confirm email (OFF)**

## Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Run with Docker

```bash
cp .env.example .env   # fill in your keys
docker compose up --build
```

Opens at `http://localhost:8080`.

The Dockerfile uses multi-stage build: Node.js builds the app, Nginx serves static files. Environment variables from `.env` are passed as build args since Vite embeds them at build time.

### Docker commands

```bash
docker compose up --build -d   # start (background)
docker compose down             # stop
docker compose logs -f          # logs
docker compose exec app sh      # shell
```

## Scripts

```bash
npm run dev         # dev server
npm run build       # typecheck + production build
npm run preview     # preview production build
npm run typecheck   # typecheck only
```

## Project structure

```
.
├── Dockerfile                  # multi-stage build (node + nginx)
├── docker-compose.yml          # container orchestration
├── nginx.conf                  # production web server config
├── supabase-schema.sql         # database schema
├── package.json
├── index.html                  # vite entry point
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── main.tsx                # react entry
    ├── App.tsx                 # routes
    ├── index.css               # global styles + theme
    ├── components/
    │   ├── ui/                 # button, card, input, label, select, badge, progress, skeleton
    │   ├── dashboard-layout.tsx
    │   ├── header.tsx
    │   └── sidebar.tsx
    ├── lib/
    │   ├── auth-context.tsx    # AuthProvider, useAuth
    │   ├── supabase.ts         # supabase client
    │   ├── config.ts           # fallback keys
    │   └── utils.ts            # cn() helper
    ├── pages/
    │   ├── home.tsx            # landing page
    │   ├── sign-in.tsx
    │   ├── sign-up.tsx
    │   ├── pricing.tsx
    │   ├── dashboard.tsx       # overview + stats
    │   ├── companions.tsx      # CRUD companions
    │   ├── session.tsx         # live voice session
    │   ├── sessions.tsx        # session history
    │   ├── analytics.tsx       # learning analytics
    │   └── profile.tsx         # user profile
    └── types/
        └── index.ts
```

## Routes

| Path | Page | Auth |
|------|------|:----:|
| `/` | Landing | No |
| `/sign-in` | Sign in | No |
| `/sign-up` | Sign up | No |
| `/pricing` | Pricing | No |
| `/dashboard` | Overview | Yes |
| `/dashboard/companions` | Companions | Yes |
| `/dashboard/companions/:id` | Voice session | Yes |
| `/dashboard/sessions` | History | Yes |
| `/dashboard/analytics` | Analytics | Yes |
| `/dashboard/profile` | Profile | Yes |

## Troubleshooting

**Can't sign in after sign up** -- Disable email confirmation in Supabase (see step 4).

**TypeScript errors** -- Run `npm run typecheck` and fix reported issues.

**Docker build uses wrong env vars** -- Ensure `.env` exists in project root. Docker Compose reads it automatically.

**Supabase connection fails** -- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Verify `supabase-schema.sql` was executed.

**Port in use** -- Local: Vite picks next available port. Docker: change `"8080:80"` in `docker-compose.yml`.
