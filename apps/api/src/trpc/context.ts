import { db } from '@chaiforms/db';
import type { Context as HonoContext } from 'hono';

export interface RequestContext {
  c: HonoContext;
  db: typeof db;
  userId?: string;
  session?: any;
}

export function createContext({ c }: { c: HonoContext }): RequestContext {
  // TODO: Implement session verification
  return {
    c,
    db,
    userId: undefined,
    session: undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
