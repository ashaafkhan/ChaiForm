import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { users } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { generateSecret, verifyTOTP } from '../../services/totp';

export const twoFactorRouter = router({
  setup: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { db, userId } = ctx;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const secret = generateSecret();
      
      // Save secret to database as unverified setup
      await db.update(users).set({
        twoFactorSecret: secret,
      }).where(eq(users.id, userId));

      const email = encodeURIComponent(user.email);
      const issuer = encodeURIComponent('ChaiForms');
      const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
      const qrCode = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauthUrl)}`;

      return { secret, qrCode };
    }),

  verify: protectedProcedure
    .input(z.object({
      secret: z.string(),
      code: z.string().length(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user || user.twoFactorSecret !== input.secret) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid 2FA setup session' });
      }

      const isValid = verifyTOTP(input.secret, input.code);
      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid 2FA code. Please try again.' });
      }

      await db.update(users).set({
        twoFactorEnabled: true,
      }).where(eq(users.id, userId));

      return { success: true };
    }),

  disable: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { db, userId } = ctx;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      await db.update(users).set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
      }).where(eq(users.id, userId));

      return { success: true };
    }),

  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { twoFactorEnabled: true },
      });

      return {
        enabled: user?.twoFactorEnabled ?? false,
        setupRequired: false,
      };
    }),
});
