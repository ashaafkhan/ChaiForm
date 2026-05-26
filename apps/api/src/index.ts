import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';

const app = new Hono();

// Middleware
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// tRPC endpoint
app.all('/trpc/:path*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext({ c }),
    onError: ({ error, path }) => {
      console.error(`❌ tRPC error on ${path}:`, error);
    },
  });
});

// Scalar API docs
app.get('/docs', apiReference({
  theme: 'deepSpace',
  spec: {
    title: 'ChaiForms API',
    version: '1.0.0',
    openApiUrl: '/openapi.json',
  },
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (c) => {
  return c.json({
    name: 'ChaiForms API',
    version: '1.0.0',
    docs: '/docs',
    health: '/health',
  });
});

const port = parseInt(process.env.PORT || '3001', 10);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 API running at http://localhost:${info.port}`);
});
