import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@chaiforms/api/trpc/router';
import { env } from './env';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      trpc.httpBatchLink({
        url: `${env.NEXT_PUBLIC_API_URL}/trpc`,
        credentials: 'include',
      }),
    ],
  });
}
