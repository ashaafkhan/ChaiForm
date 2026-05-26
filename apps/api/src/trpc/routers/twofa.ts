import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { users } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const twoFactorRouter = router({
  generateSecret: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx;

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `ChaiForms (${process.env.NEXT_PUBLIC_APP_URL})`,
        issuer: 'ChaiForms',
        length: 32,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCode,
        otpauth_url: secret.otpauth_url,
      };
    }),

  verifySetup: protectedProcedure
    .input(z.object({
      secret: z.string(),
      code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify the code matches the secret
      const isValid = speakeasy.totp.verify({
        secret: input.secret,
        encoding: 'base32',
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      // Save the secret to the user
      await db.update(users)
        .set({
          twoFactorSecret: input.secret,
          twoFactorEnabled: true,
        })
        .where(eq(users.id, userId!));

      return {
        success: true,
        message: '2FA has been enabled on your account',
      };
    }),

  verify: protectedProcedure
    .input(z.object({
      code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId!),
      });

      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA not enabled');
      }

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      return { success: true };
    }),

  getTwoFactorStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId!),
      });

      return {
        enabled: user?.twoFactorEnabled || false,
      };
    }),

  disable: protectedProcedure
    .input(z.object({
      code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId!),
      });

      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA not enabled');
      }

      // Verify the code before disabling
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      // Disable 2FA
      await db.update(users)
        .set({
          twoFactorSecret: null,
          twoFactorEnabled: false,
        })
        .where(eq(users.id, userId!));

      return { success: true };
    }),

  verifyLogin: publicProcedure
    .input(z.object({
      userId: z.string().uuid(),
      code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA not enabled for this user');
      }

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      return { success: true };
    }),
});
