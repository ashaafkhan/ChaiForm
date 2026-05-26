# ChaiForms Development Workflow

This file contains customization instructions for GitHub Copilot while working on ChaiForms.

## Project Overview

ChaiForms is a production-grade Form Builder SaaS built on:
- **Turborepo** monorepo with multiple apps and packages
- **Next.js 14** frontend dashboard
- **Hono + tRPC** backend API
- **PostgreSQL + Drizzle ORM** database
- **Zod** for end-to-end type safety

## Architecture

```
Frontend (apps/web) ←→ API (apps/api) ←→ Database (PostgreSQL)
      ↓                      ↓
   Next.js 14         Hono + tRPC v11
   shadcn/ui          Type-safe APIs
   Tailwind CSS       Zod validation
```

## Key Principles

1. **Type Safety First** — Zod schemas drive validation on both client & server
2. **No Duplication** — Shared types, schemas, and utilities in packages/
3. **Modular Routing** — Each domain (forms, responses, analytics) has its own tRPC router
4. **Database-First Design** — Drizzle ORM with migrations handled in packages/db

## Implementation Strategy

### Stage 1: Foundation (Currently Active)
- ✅ Turborepo structure created
- ✅ All packages scaffolded (db, schemas, trpc, ui, email, utils)
- ✅ Both apps scaffolded (web, api)
- ✅ tRPC routers initialized with basic structure
- ⏳ Next: Database migrations & seed data

### Stage 2: Form CRUD (Next)
- Implement forms router fully
- Add fields router
- Create form editor UI
- Publish/unpublish flow

### Stage 3-10: See PRD sections 23-24

## File Organization Rules

- Database schema: `packages/db/src/schema.ts`
- Zod schemas: `packages/schemas/src/index.ts`
- tRPC routers: `apps/api/src/trpc/routers/*.ts`
- Frontend pages: `apps/web/src/app/**/*.tsx`
- Components: `apps/web/src/components/**/*.tsx`
- Utilities: `packages/utils/src/index.ts`

## Coding Standards

1. **TypeScript Strict Mode** — All files must pass `pnpm typecheck`
2. **No `any` types** — Be specific with types
3. **Zod schemas** — Every input must have a corresponding schema
4. **Shared over Monorepo** — Don't repeat code across apps
5. **Error Handling** — Use tRPC error codes consistently

## Common Tasks

### Add a new tRPC router
1. Create file in `apps/api/src/trpc/routers/[domain].ts`
2. Export router with `t.router({})`
3. Import and merge in `apps/api/src/trpc/router.ts`

### Add a new database table
1. Add to `packages/db/src/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate`
4. Update `packages/schemas/src/index.ts` with Zod schema

### Add a new page
1. Create file in `apps/web/src/app/**/*.tsx`
2. Use tRPC hooks: `trpc.forms.list.useQuery()`
3. Style with Tailwind classes
4. Import components from `@chaiforms/ui`

### Test the full stack
1. `pnpm dev` (runs all apps in parallel)
2. Frontend: http://localhost:3000
3. API: http://localhost:3001
4. API Docs: http://localhost:3001/docs

## Important Notes for Copilot

- When creating components, use shadcn/ui patterns from `@chaiforms/ui`
- Always handle loading/error states with proper Tailwind skeletons
- Mobile-first responsive design (use Tailwind breakpoints)
- Form validation errors should use Zod error messages
- Export types from shared packages, don't redefine locally
- tRPC queries should use React Query hooks (`useQuery`, `useMutation`)

## Debugging

- Enable server logs: `DEBUG=*` before `pnpm dev`
- Check database with Drizzle Studio: `pnpm db:studio`
- API endpoints tested at `http://localhost:3001/docs`
- Frontend errors in browser DevTools

---

**Last Updated:** May 26, 2026
**Deadline:** May 27, 2026 (24 hours)
