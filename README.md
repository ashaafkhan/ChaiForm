# ☕ ChaiForms — Next-Gen Interactive Form Builder SaaS

> A high-fidelity, type-safe Form Builder SaaS (Typeform alternative) built with Turborepo, Next.js 14, Hono, tRPC v11, and Drizzle ORM. Featuring premium, interactive, dynamic form themes with live customizers, debounced database sync, and real-time analytics.

---

## 🔗 Live & Quick Links

| Resource | Location / URL |
|----------|----------------|
| 🌐 **Live Website** | [chaiform.ashaaf.in](https://chaiform.ashaaf.in) |
| 📡 **API Backend** | `https://api.chaiform.ashaaf.in` (Deployed on Render) |
| 📖 **Scalar API Docs** | `https://api.chaiform.ashaaf.in/docs` |
| 💻 **Local Frontend** | `http://localhost:3000` |
| 🔌 **Local API Server** | `http://localhost:3001` |

---

## 🔑 Demo Access Credentials

Feel free to log in with these pre-configured creator and admin accounts to explore the dashboard, design panel, and analytics.

```yaml
Creator Account:
  Email: demo@chaiforms.dev
  Password: ChaiForms2026!

Admin Account:
  Email: admin@chaiforms.dev
  Password: AdminChai2026!
```

---

## 🎨 The 6 Premium "Crazy" Interactive Themes

ChaiForms features six highly immersive, theme-specific styles with custom animations, custom focus states, typography, glassmorphism, scanlines, and glow indicators that load reactively based on form selection.

| Theme | Identifier | Key Visual Highlights |
|---|---|---|
| 🟢 **The Matrix** | `the-matrix` | Monospaced Courier typography, bright lime green text-shadow glows, digital rain scanlines, retro-glowing buttons, and custom borderless green-accented inputs. |
| ⚡ **Cyberpunk** | `cyberpunk` | Sharp angles (0px border-radius), dual neon pink and cyan border glows, neon cybernetic grid lines, and glowing linear-gradient submit controls. |
| 🌌 **Interstellar** | `interstellar` | Deep cosmic radial starfields, elegant serif headings, warm amber/gold glows, and highly polished frosted glass containers. |
| 🔥 **Demon Slayer** | `demon-slayer` | Deep charcoal cards backed by burning crimson radial gradients, red-hot focus glows, and custom flame-styled headers and buttons. |
| 🌊 **Ocean Breeze** | `ocean-breeze` | Rounded card corners (`20px`), bottom-border input fields that glow teal on focus, and pill-shaped teal/blue gradient submit buttons. |
| 🔮 **Midnight** | `midnight` | Velvet violet backgrounds, premium glassmorphism containers (`backdrop-filter`), and deep royal purple ambient glows. |

---

## ⚡ Tech Stack & Architecture

ChaiForms uses a type-safe, modular monorepo architecture:

```
                  ┌──────────────────────┐
                  │   Next.js Frontend   │
                  │     (apps/web)       │
                  └──────────┬───────────┘
                             │
                      tRPC v11 Queries &
                         Mutations
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Hono API + tRPC     │
                  │     (apps/api)       │
                  └──────────┬───────────┘
                             │
                     Drizzle ORM Queries
                             │
                             ▼
                  ┌──────────────────────┐
                  │ PostgreSQL Database  │
                  └──────────────────────┘
```

*   **Monorepo Core**: [Turborepo](https://turbo.build/) for lightning-fast caching and workspace compilation.
*   **Frontend App**: **Next.js 14** (App Router, Server Components) styled with **Vanilla CSS** (for theme overrides) and **Tailwind CSS / shadcn/ui** (for dashboard components).
*   **API Server**: **Hono** combined with **tRPC v11** for end-to-end type safety between client and server.
*   **Database & ORM**: **Drizzle ORM** with a **PostgreSQL** client database layer.
*   **Bundler & Compiler**: `esbuild` for creating optimized, standalone production API builds.
*   **Verification Utilities**: **Zod** schema validations shared across web and API workspaces.

---

## 📁 Project Structure

```
chaiforms/
├── apps/
│   ├── web/               # Next.js frontend (Creator dashboard + Public forms)
│   └── api/               # Hono backend + tRPC server running on Node
├── packages/
│   ├── db/                # PostgreSQL schema definitions, Drizzle migrations, & seed scripts
│   ├── schemas/           # Shared Zod validation schemas (e.g. form fields, responses)
│   ├── trpc/              # Router type signatures & client factory setup
│   ├── ui/                # Shared layout & button components
│   ├── email/             # Resend email templates & configuration
│   └── utils/             # Helper utilities and type conversions
├── tsconfig.base.json     # Base TypeScript compiler settings
├── turbo.json             # Turborepo task pipeline config
└── pnpm-workspace.yaml    # Workspace packaging map
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
*   Node.js **≥ 18.0.0**
*   pnpm **≥ 8.0.0**
*   A running PostgreSQL instance (local or via Neon/Supabase)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/ashaafkhan/ChaiForm.git
cd ChaiForm

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root workspace (and matching files inside `apps/web` and `apps/api` if necessary, or simply declare them in your system environment):

```env
# Database Credentials
DATABASE_URL="postgresql://username:password@localhost:5432/chaiforms"

# Server Ports & URLs
PORT=3001
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication Secrets
JWT_SECRET="your-super-secret-key-here"

# Email Configuration (Resend)
RESEND_API_KEY="re_your_api_key"

# Redis Configuration (For Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

### 3. Database Migration & Seeding
```bash
# Push database schemas
pnpm db:migrate

# Seed standard schemas and theme presets
pnpm db:seed
```

### 4. Running the Development Servers
```bash
# Boot the Next.js dev server & the Hono API watch server in parallel
pnpm dev

# - Frontend will run at: http://localhost:3000
# - Backend API will run at: http://localhost:3001
# - Interactive API docs will run at: http://localhost:3001/docs
```

---

## 📦 Production Bundling & Deployment Fix

To ensure a seamless production deployment on platforms like Render, the API backend uses a custom build compiler setup:

### The Challenge
Standard Node.js ESM (`"type": "module"`) requires explicit extensions in file imports (e.g. `import './foo.js'`). TypeScript compiles relative paths without adding extensions. This normally causes Node.js deployments to crash with `ERR_MODULE_NOT_FOUND`. Furthermore, monorepo dependencies like `@chaiforms/db` point directly to `.ts` files, raising `ERR_UNKNOWN_FILE_EXTENSION`.

### The Solution
We integrated `esbuild` as the compiler bundle step in [apps/api/package.json](apps/api/package.json):
```json
"build": "tsc && esbuild src/index.ts --bundle --platform=node --target=node22 --outfile=dist/index.js --format=esm --external:hono --external:@hono/node-server --external:@scalar/hono-api-reference --external:@trpc/server --external:bcryptjs --external:drizzle-orm --external:jsonwebtoken --external:zod --external:pg"
```
*   **`tsc`**: Verifies type safety and enforces compilation standards.
*   **`esbuild`**: Bundles all local monorepo typescript imports and dependencies into a single production-ready `dist/index.js` file, while excluding external npm dependencies.
*   **Result**: Zero-config startup in native Node.js environments.

---

## 🚀 Key Features

*   **Design & Fields Workspace Split**: Tabbed side panel ("Fields" vs "Design") in the creator editor sidebar. Tab selection automatically transitions to the fields panel when modifying form fields in the live canvas.
*   **Interactive Theme Customizer**: Real-time picker enabling creators to override defaults (e.g. Background Color, Text Color, Accent Colors, Border Radius) and save configurations safely with debounced db mutations.
*   **Zod Schema Type-Safety**: Automated serialization mapping flat client-side responses to match Zod backend validation constraints, preventing form submission errors.
*   **Fully Responsive & Interactive Landing Showcase**: Interactive theme cards on the marketing landing page that dynamically render the active theme design to preview forms on-click.
*   **Scalar Interactive Docs**: Dynamic OpenAPI visual references for all endpoints accessible on `/docs`.

---

## 🤝 Contribution & Maintenance

This repository is maintained as a hackathon submission. For issues, optimization ideas, or pull requests, please open an issue in the repository.

---

**Built with ☕ for the MasterJi × Chai Code Hackathon 2026**
