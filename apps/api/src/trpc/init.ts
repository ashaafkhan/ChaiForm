import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

// ─── Middleware: Request Logger ───────────────────────────────────────────────
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  const status = result.ok ? '✅' : '❌';
  console.log(`${status} [${type.toUpperCase()}] ${path} — ${durationMs}ms`);
  return result;
});

// ─── Middleware: Input Sanitizer ──────────────────────────────────────────────
// Strips any prototype-polluting keys from raw input
const sanitizerMiddleware = t.middleware(async ({ rawInput, next }) => {
  if (rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput)) {
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    for (const key of dangerous) {
      delete (rawInput as Record<string, unknown>)[key];
    }
  }
  return next();
});

// ─── Middleware: Auth Guard ───────────────────────────────────────────────────
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please sign in.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // non-nullable now
    },
  });
});

// ─── Middleware: Admin Guard ──────────────────────────────────────────────────
const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
  }
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required.' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// ─── Procedures ──────────────────────────────────────────────────────────────
export const publicProcedure = t.procedure
  .use(loggerMiddleware)
  .use(sanitizerMiddleware);

export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(sanitizerMiddleware)
  .use(authMiddleware);

export const adminProcedure = t.procedure
  .use(loggerMiddleware)
  .use(sanitizerMiddleware)
  .use(adminMiddleware);
