# ☕ ChaiForms — Next-Gen Interactive Form Builder SaaS

> A highly immersive, premium, and type-safe Form Builder SaaS (Typeform alternative) built with Turborepo, Next.js 14, Hono, tRPC v11, and Drizzle ORM. Featuring premium, interactive, dynamic form themes with live customizers, debounced database sync, and real-time analytics.

---

## 🔗 Live & Quick Links

| Resource | Location / URL | Description |
|:---|:---|:---|
| 🌐 **Live Website** | [chaiform.ashaaf.in](https://chaiform.ashaaf.in) | Production Landing Page & Creator Hub |
| 📡 **API Backend** | `https://api.chaiform.ashaaf.in` | Hono Backend Server (Render) |
| 📖 **Scalar API Docs** | `https://api.chaiform.ashaaf.in/docs` | Interactive OpenAPI playground |
| 💻 **Local Frontend** | `http://localhost:3000` | Local Next.js Workspace |
| 🔌 **Local API Server** | `http://localhost:3001` | Local Hono tRPC server |

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

## 🚀 Detailed Features & Screen Breakdowns

### 1. Marketing & Landing Page Showcase (`/`)
*   **Hero Section**: Modern dark mode UI with glassmorphic cards, highlighting key performance metrics and the "6 Stunning Themes".
*   **Interactive Theme Showcase**: Interactive mock form next to the theme selection cards. Visitors can click on any theme card (Matrix, Cyberpunk, Interstellar, etc.) and immediately see the live mock form transform its typography, backgrounds, gridlines, inputs, buttons, and animations on the spot.

### 2. Creator Dashboard (`/dashboard`)
*   **Form Management**: Overview cards for total forms, cumulative responses, and average completion rate.
*   **Form List Grid**: Interactive list showing form status (Draft, Published, Archived), visibility, created date, and response count. Supports duplication, deletion, archiving, and editing.
*   **Explore Hub (`/explore`)**: Community-wide public forms gallery allowing creators to test other public forms and clone templates.

### 3. Workspace Editor Panel (`/forms/[formId]/edit`)
*   **Live Drag-and-Drop Canvas**: Add, edit, delete, and re-order 18+ input types (Short Text, Long Text, Email, Number, Ratings, Select Checkboxes, Dropdowns, Date-pickers, File uploads, and more) with immediate live previews.
*   **Tabbed sidebar panel ("Fields" vs "Design")**:
    *   **Fields Tab**: Configure field label, placeholders, helper description texts, required toggles, validation rules (minimum/maximum bounds, regex expressions, customized error messages), and conditional visibility logic. Clicking a field on the canvas instantly focuses this tab.
    *   **Design Tab**: Accesses the `ThemeSelector` and `ThemeCustomizer` components. Let's creators toggle between the 6 premium presets or define custom overrides (background colors, primary/secondary accents, text colors, corner roundness, focus ring glows) which automatically sync to the database via debounced queries.

### 4. Share & Embed Workspace (`/forms/[formId]/share`)
*   **Custom Slugs**: Update the default unique ID slug to a vanity url (e.g. `/f/my-custom-feedback`).
*   **Direct Sharing**: One-click clipboard copy for direct form links.
*   **QR Code Generator**: Generates high-definition downloadable QR codes matching the form's custom colors.
*   **Embed Options**: Code snippets for responsive iframe embedding.

### 5. Submissions Workspace (`/forms/[formId]/responses`)
*   **Submissions Grid**: Paginated grid of all completed form answers with search capabilities.
*   **Details Drawer**: Slide-out panel to inspect individual response metrics, user IP, user-agent, completion duration, and comprehensive field-by-field answers.
*   **CSV Exporter**: Generates instant structured CSV exports of all response data.

### 6. Real-Time Analytics Panel (`/forms/[formId]/analytics`)
*   **Conversion Metrics**: Visualizes views vs submissions, calculating precise completion rates.
*   **Engagement Charts**: Custom Recharts diagrams showing submission trends over time, device breakdowns (Desktop vs Mobile), and browser distributions.
*   **Duration Metrics**: Displays average completion time in seconds/minutes to pinpoint friction.

### 7. Form Security Settings (`/settings/security`)
*   **Password Protection**: Restricts form accessibility using secure password checks.
*   **Availability Enforcements**: Set expiration dates/times or response submission ceilings (e.g., close form after 500 responses).
*   **Rate Limits**: Configures Redis-based submit throttling per IP.

---

## 🎨 The 6 Premium "Crazy" Interactive Themes

ChaiForms applies high-fidelity styling for each theme using custom parent CSS selectors (`.form-page-theme-{slug}`). Below is the style spec sheet:

```
                            THEME VISUAL SYSTEM
 ┌───────────────────┬────────────────────────────────────────────────────────┐
 │ Theme Name        │ CSS Design & Animation Details                         │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ 🟢 The Matrix     │ - Monospaced Courier font family                       │
 │                   │ - Glowing green font text-shadows                      │
 │                   │ - Repeating linear-gradient terminal scanlines         │
 │                   │ - Borderless neon green inputs & retro submit buttons │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ ⚡ Cyberpunk      │ - Sharp 0px borders (pure futuristic wireframe)        │
 │                   │ - Dual neon-pink & neon-cyan glow borders              │
 │                   │ - Glowing linear gradient buttons with glitch hover    │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ 🌌 Interstellar   │ - Cosmical radial starfield dark gradients             │
 │                   │ - Serif headings & elegant golden glows                │
 │                   │ - Frosted glass containers (backdrop-filter: blur)    │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ 🔥 Demon Slayer   │ - Burning crimson-orange radial backgrounds           │
 │                   │ - Red-hot focus borders & flame-styled headers        │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ 🌊 Ocean Breeze   │ - Ultra rounded corners (border-radius: 20px)          │
 │                   │ - Deep-sea teal accents & bottom-border only inputs    │
 ├───────────────────┼────────────────────────────────────────────────────────┤
 │ 🔮 Midnight       │ - Royal velvet violet gradients                        │
 │                   │ - Deep purple soft ambient shadows & glassmorphism    │
 └───────────────────┴────────────────────────────────────────────────────────┘
```

---

## 📡 Database Schema Details (Drizzle ORM)

The database schema utilizes Postgres-specific data types and relational mappings:

```sql
users (Form Creators)
  ├── id: uuid (Primary Key)
  ├── email: varchar(255) (Unique)
  ├── passwordHash: text
  └── createdAt: timestamp

forms (Form Configuration & Security)
  ├── id: uuid (Primary Key)
  ├── creatorId: uuid (References users.id)
  ├── title: varchar(255)
  ├── slug: varchar(255) (Unique, Index)
  ├── description: text
  ├── themeId: uuid (References themes.id)
  ├── customThemeConfig: jsonb (Stores custom picker colors & radii overrides)
  ├── status: enum ('draft', 'published', 'archived')
  ├── isPublic: boolean (Toggles visibility in Explore page)
  ├── passwordHash: text (Optional, for password-protected forms)
  ├── expiresAt: timestamp (Optional, expiration check)
  ├── limitCount: integer (Optional, submission ceiling)
  └── createdAt / updatedAt: timestamp

fields (Form Fields)
  ├── id: uuid (Primary Key)
  ├── formId: uuid (References forms.id on delete cascade)
  ├── type: varchar(50) (e.g. text, rating, date)
  ├── label: text
  ├── placeholder: text
  ├── description: text
  ├── required: boolean
  ├── order: integer (Used for client ordering)
  ├── validation: jsonb (Min/max length, bounds, regex pattern)
  └── logicRules: jsonb (Conditional visibility logic)

responses (Submitted Forms)
  ├── id: uuid (Primary Key)
  ├── formId: uuid (References forms.id on delete cascade)
  ├── userIp: varchar(45) (For rate limiting and geo analysis)
  ├── userAgent: text (For device charts)
  ├── completedAt: timestamp
  └── createdAt: timestamp

answers (Individual field entries)
  ├── id: uuid (Primary Key)
  ├── responseId: uuid (References responses.id on delete cascade)
  ├── fieldId: uuid (References fields.id on delete cascade)
  └── value: jsonb (Holds responses based on field types)

themes (Theme Presets)
  ├── id: uuid (Primary Key)
  ├── name: varchar(100)
  ├── slug: varchar(100) (Unique)
  ├── config: jsonb (Preset styles)
  └── isPublic: boolean
```

---

## 🔄 Core Request-Response Flows

### 1. Form Submission & Zod Schema Validation
```
  [Client Form App]                     [Hono API Backend]                 [Database]
          │                                     │                              │
          │ 1. Map answers record to            │                              │
          │    { fieldId, value }[]             │                              │
          ├────────────────────────────────────>│                              │
          │    Mutate tRPC responses.submit     │                              │
          │                                     │ 2. Zod validation parser     │
          │                                     │    & Security/Limit checks   │
          │                                     ├───────────────┐              │
          │                                     │               │              │
          │                                     │<──────────────┘              │
          │                                     │                              │
          │                                     │ 3. Insert response record    │
          │                                     ├─────────────────────────────>│
          │                                     │ 4. Batch insert answers      │
          │                                     ├─────────────────────────────>│
          │                                     │                              │
          │ 5. Trigger email alert (optional)   │                              │
          │<────────────────────────────────────┤                              │
          │                                     │                              │
```

### 2. Live Theme Customizer Database Sync
```
  [Creator Customize Sidebar]                   [Hono API Backend]                 [Database]
          │                                     │                              │
          │ 1. Modify picker (e.g. accentColor) │                              │
          │                                     │                              │
          │ 2. Debounce trigger (1000ms)        │                              │
          ├────────────────────────────────────>│                              │
          │    Mutate tRPC themes.applyToForm   │                              │
          │                                     │ 3. Update forms table        │
          │                                     │    set customThemeConfig     │
          │                                     ├─────────────────────────────>│
          │                                     │                              │
```

---

## 🛠️ Local Development & Operations

### Prerequisites
*   Node.js **≥ 18.0.0**
*   pnpm **≥ 8.0.0**
*   PostgreSQL

### Initial Workspace Configuration
```bash
# Clone the repository
git clone https://github.com/ashaafkhan/ChaiForm.git
cd ChaiForm

# Install package dependencies
pnpm install

# Set up local environment variables
cp .env.example .env.local
```

### Database Migration & Seeding
```bash
# Push database schemas to your Postgres instance
pnpm db:migrate

# Seed standard schemas and theme presets
pnpm db:seed
```

### Run Dev Environment
```bash
# Spin up both next.js frontend and hono api watch servers
pnpm dev

# Main addresses:
# - Frontend: http://localhost:3000
# - API Backend: http://localhost:3001
# - Scalar Docs: http://localhost:3001/docs
```

### Monorepo Validation Commands
```bash
# Run lint check
pnpm lint

# Run type-checks across all packages
pnpm typecheck

# Build the entire monorepo
pnpm build
```

---

## 📦 Production Bundling & Deployment Guides

### Backend API App Bundler Config (`esbuild`)
Due to the monorepo structure, relative extensionless imports (e.g. `import { router } from './init'`) and typescript package references (`packages/db/src/index.ts`) will fail to run natively under Node.js ESM. 

To solve this, we configured `esbuild` to compile `apps/api/src/index.ts` into a self-contained bundle `dist/index.js` while leaving third-party node modules external:
```bash
npx esbuild src/index.ts --bundle --platform=node --target=node22 --outfile=dist/index.js --format=esm --external:hono --external:@hono/node-server --external:@scalar/hono-api-reference --external:@trpc/server --external:bcryptjs --external:drizzle-orm --external:jsonwebtoken --external:zod --external:pg
```
This is fully automated under the `build` script in `apps/api/package.json`.

---

### Step-by-Step Deployment Instructions

#### 1. Deploying the Backend API (Render)
1. Log in to the [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Link your Git repository.
3. Configure the following parameters in the Web Service setup:
   *   **Runtime**: `Node`
   *   **Build Command**: `npx pnpm install --no-frozen-lockfile && npx pnpm run build --filter=@chaiforms/api`
   *   **Start Command**: `node apps/api/dist/index.js`
4. Add the following **Environment Variables**:
   *   `NODE_VERSION`: `22.13.0`
   *   `DATABASE_URL`: `your_postgresql_connection_string`
   *   `FRONTEND_URL`: `https://chaiform.ashaaf.in`
   *   `JWT_SECRET`: `your_random_jwt_secret`
5. Click **Deploy Web Service**.

#### 2. Deploying the Frontend Web App (Vercel)
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Select your repository.
3. Configure the project settings:
   *   **Framework Preset**: `Next.js`
   *   **Root Directory**: `apps/web` (Keep "Keep settings from root directory" disabled)
   *   **Build Command**: `npx pnpm build --filter=@chaiforms/web...` (or standard next build)
4. Add the following **Environment Variables**:
   *   `NEXT_PUBLIC_API_URL`: `https://api.chaiform.ashaaf.in`
   *   `NEXT_PUBLIC_APP_URL`: `https://chaiform.ashaaf.in`
5. Click **Deploy**.

---

**Built with ☕ for the MasterJi × Chai Code Hackathon 2026**
