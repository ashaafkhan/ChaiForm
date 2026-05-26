import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { SignUpSchema, LoginSchema } from '@chaiforms/schemas';
import { users } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

interface JWTPayload {
  userId: string;
  email: string;
}

export const authRouter = router({
  register: publicProcedure
    .input(SignUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { email, password, name } = input;

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash: hashedPassword,
          isVerified: false,
        })
        .returning();

      const user = newUser[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    }),

  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { email, password } = input;

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Return temporary session ID for 2FA verification
        const tempToken = jwt.sign(
          { userId: user.id, email: user.email, temp: true },
          JWT_SECRET,
          { expiresIn: '5m' }
        );

        return {
          success: true,
          requiresTwoFactor: true,
          tempToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        requiresTwoFactor: false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    }),

  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      // TODO: Implement token blacklist in production
      return { success: true, message: 'Logged out successfully' };
    }),

  getSession: publicProcedure
    .input(z.object({ token: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const token = input?.token || ctx.c.req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return null;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      } catch {
        return null;
      }
    }),

  verifyTwoFactorLogin: publicProcedure
    .input(z.object({
      tempToken: z.string(),
      code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      
      try {
        // Verify temp token
        const decoded = jwt.verify(input.tempToken, JWT_SECRET) as JWTPayload & { temp?: boolean };
        
        if (!decoded.temp) {
          throw new Error('Invalid temporary token');
        }

        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
        });

        if (!user || !user.twoFactorSecret) {
          throw new Error('2FA not enabled for this user');
        }

        // Verify the 2FA code using speakeasy
        const speakeasy = await import('speakeasy');
        const isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: input.code,
          window: 2,
        });

        if (!isValid) {
          throw new Error('Invalid 2FA code');
        }

        // Generate permanent JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email } as JWTPayload,
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        };
      } catch (error) {
        throw new Error('Failed to verify 2FA code');
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().optional(), avatarUrl: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const updatedUser = await db
        .update(users)
        .set({
          name: input.name,
          avatarUrl: input.avatarUrl,
        })
        .where(eq(users.id, userId!))
        .returning();

      return {
        success: true,
        user: updatedUser[0],
      };
    }),
});
