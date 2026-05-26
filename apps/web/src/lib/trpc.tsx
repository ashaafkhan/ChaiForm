'use client';

import React, { useState } from 'react';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken } from './auth';

import type { AppRouter } from '@chaiforms/trpc';

export const trpc = createTRPCReact<AppRouter>();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000, retry: 1 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          headers() {
            const token = getToken();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
