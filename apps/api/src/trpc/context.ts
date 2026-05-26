import { db } from '@chaiforms/db';
import { users } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import type { Context as HonoContext } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'chaiforms-dev-secret-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RequestContext {
  c: HonoContext;
  db: typeof db;
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
  ipAddress?: string;
}

export async function createContext({ c }: { c: HonoContext }): Promise<RequestContext> {
  let userId: string | undefined;
  let userEmail: string | undefined;
  let isAdmin = false;

  // Extract real IP (handles proxies)
  const ipAddress =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    c.req.header('x-real-ip') ||
    'unknown';

  try {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      // Basic token format check before crypto verify (saves CPU on garbage)
      if (token.length > 10 && token.includes('.')) {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Extra validation: ensure payload has required fields
        if (decoded.userId && typeof decoded.userId === 'string') {
          userId = decoded.userId;
          userEmail = decoded.email;

          // Fetch admin status from DB (can't trust JWT for privilege escalation)
          const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId),
            columns: { isAdmin: true, id: true },
          });
          isAdmin = user?.isAdmin ?? false;
        }
      }
    }
  } catch {
    // Expired, malformed, or tampered token — silently reject
    userId = undefined;
    userEmail = undefined;
    isAdmin = false;
  }

  return {
    c,
    db,
    userId,
    userEmail,
    isAdmin,
    ipAddress,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
