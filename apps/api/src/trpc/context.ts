import { db } from '@chaiforms/db';
import type { Context as HonoContext } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
}

export interface RequestContext {
  c: HonoContext;
  db: typeof db;
  userId?: string;
  session?: any;
}

export function createContext({ c }: { c: HonoContext }): RequestContext {
  let userId: string | undefined;

  try {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      userId = decoded.userId;
    }
  } catch {
    // Token is invalid or not present, userId remains undefined
  }

  return {
    c,
    db,
    userId,
    session: undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
