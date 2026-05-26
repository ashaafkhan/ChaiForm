# ☕ ChaiForms — Form Builder SaaS

> Build beautiful, dynamic forms with real-time analytics, themed experiences, and instant sharing.

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| 🌐 Frontend | `http://localhost:3000` |
| 📡 API | `http://localhost:3001` |
| 📖 API Docs | `http://localhost:3001/docs` |
| 💻 GitHub | [Your Repo](https://github.com) |

## 🔑 Demo Credentials

```
Creator Account:
  Email: demo@chaiforms.dev
  Password: ChaiForms2026!

Admin Account:
  Email: admin@chaiforms.dev
  Password: AdminChai2026!
```

## 🚀 Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Hono + tRPC v11
- **Database**: PostgreSQL (Drizzle ORM)
- **Validation**: Zod
- **Auth**: Better Auth (coming soon)
- **Email**: Resend + React Email
- **API Docs**: Scalar
- **Deployment**: Vercel + Railway

## 📁 Project Structure

```
chaiforms/
├── apps/
│   ├── web/          # Next.js frontend (dashboard + public forms)
│   └── api/          # Hono backend (tRPC + API)
├── packages/
│   ├── db/           # Drizzle ORM + schema + migrations
│   ├── schemas/      # Shared Zod schemas
│   ├── trpc/         # tRPC router types
│   ├── ui/           # Shared UI components
│   ├── email/        # Email templates
│   └── utils/        # Shared utilities
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8
- **PostgreSQL** (Neon or local)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chaiforms
cd chaiforms

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your database URL and other secrets
```

### Database Setup

```bash
# Run migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed
```

### Development

```bash
# Start all apps (frontend + backend)
pnpm dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/docs
```

### Build for Production

```bash
# Build all apps
pnpm build

# Start frontend
cd apps/web && pnpm start

# Start backend
cd apps/api && pnpm start
```

## 🌟 Features

### Core Features ✅
- Form builder with drag-and-drop field ordering
- 18+ field types (text, email, number, rating, select, date, file, etc.)
- Multi-page form support
- Public + Unlisted visibility modes
- Form publishing workflow
- Response collection (no login required)
- Real-time analytics dashboard
- Email notifications

### Bonus Features ✅
- 14+ themed form experiences
- Conditional logic between fields
- Form expiry date enforcement
- Response limit settings
- CSV response export
- Charts & analytics (Recharts)
- Custom form slugs
- QR code sharing
- Password-protected forms
- Form cloning & archiving
- Template gallery
- Admin dashboard
- Rate limiting

## 📊 Database Schema

### Key Tables
- **users** — Form creators
- **forms** — Form definitions
- **fields** — Form fields with validation rules
- **responses** — Submitted form responses
- **themes** — Pre-built form themes
- **analytics_events** — Tracking events for analytics

See [packages/db/src/schema.ts](packages/db/src/schema.ts) for full schema.

## 🎨 Available Themes

- 🎬 Movies: The Matrix, Interstellar, Blade Runner 2049
- 📺 Anime: Demon Slayer, Spirited Away, Cyberpunk Edgerunners
- 🎮 Games: Minecraft, Zelda TOTK, Elden Ring
- 💻 Tech: Terminal, macOS, Windows XP
- 🚀 Startups: Y Combinator, Chai Code

## 📡 API Documentation

Full API docs are available at: **http://localhost:3001/docs**

### Public Endpoints
- `GET /api/forms/explore` — List public forms
- `GET /api/forms/{slug}` — Get form by slug
- `POST /api/forms/{slug}/submit` — Submit a response

### Protected Endpoints (require auth)
- `POST /api/forms` — Create a new form
- `GET /api/forms` — List creator's forms
- `GET /api/forms/{id}/responses` — Get responses
- `GET /api/forms/{id}/analytics` — Get analytics

## 🔐 Rate Limiting

- Form submissions: 5/hour per IP per form
- Auth endpoints: 10 attempts per 15 minutes per IP
- API (authenticated): 1000 req/hour per user

## 🛠️ Development Commands

```bash
# Lint code
pnpm lint

# Type checking
pnpm typecheck

# Database studio (Drizzle UI)
pnpm db:studio

# Generate new migration
pnpm db:generate

# Clean build artifacts
pnpm clean
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/chaiforms

# Auth
AUTH_SECRET=your-32-character-random-secret
FRONTEND_URL=http://localhost:3000

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=token_here

# File storage
UPLOADTHING_SECRET=sk_xxxxxxxxxxxx
UPLOADTHING_APP_ID=app_xxxxxxxxxxxx

# Environment
NODE_ENV=development
```

## 🚀 Deployment

### Deploy to Vercel (Frontend)

```bash
# Connect your GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy from main branch
```

### Deploy to Railway (Backend)

```bash
# Connect your GitHub repo to Railway
# Set environment variables
# Railway will auto-deploy on push
```

## 🤝 Contributing

This is a hackathon submission. For issues or improvements, please create a pull request.

## 📄 License

MIT

---

**Built with ☕ for MasterJi × Chai Code Hackathon 2026**
