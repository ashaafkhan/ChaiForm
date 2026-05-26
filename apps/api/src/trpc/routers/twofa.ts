import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { TRPCError } from '@trpc/server';

// Stub 2FA router — speakeasy dependency not available in dev
export const twoFactorRouter = router({
  setup: protectedProcedure
    .mutation(async () => {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: '2FA setup coming soon' });
    }),

  verify: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async () => {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: '2FA verify coming soon' });
    }),

  disable: protectedProcedure
    .mutation(async () => {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: '2FA disable coming soon' });
    }),

  getStatus: protectedProcedure
    .query(async () => {
      return { enabled: false, setupRequired: false };
    }),
});
