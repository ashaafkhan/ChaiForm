import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { users } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'chaiforms-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12; // was 10 — 12 is OWASP recommended

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/** Strips HTML tags and normalises whitespace */
const sanitizeString = (s: string) =>
  s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const EmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email too long')
  .transform((s) => s.toLowerCase().trim()); // always lowercase + trim

const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const NameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .transform(sanitizeString);

const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: NameSchema,
});

const LoginSchema = z.object({
  email: EmailSchema,
  // Don't apply strong schema to login password — just presence check
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

const UpdateProfileSchema = z.object({
  name: NameSchema.optional(),
  avatarUrl: z
    .string()
    .url('Avatar must be a valid URL')
    .max(2048, 'URL too long')
    .optional()
    .nullable(),
}).refine(
  (data) => data.name !== undefined || data.avatarUrl !== undefined,
  { message: 'At least one field must be provided' }
);

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: 'New password must be different from current password', path: ['newPassword'] }
);

// ─── JWT helper ───────────────────────────────────────────────────────────────
function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function safeUser(user: { id: string; email: string; name: string; plan: string; isAdmin: boolean; isVerified: boolean; avatarUrl?: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const authRouter = router({
  /** Register a new user */
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Idempotency-safe duplicate check
      const existing = await db.query.users.findFirst({
        where: eq(users.email, input.email),
        columns: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists.',
        });
      }

      const passwordHash = await bcryptjs.hash(input.password, BCRYPT_ROUNDS);

      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
          isVerified: false,
          plan: 'free',
        })
        .returning();

      const token = signToken(user.id, user.email);

      return {
        success: true,
        user: safeUser(user),
        token,
      };
    }),

  /** Login with email + password */
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      // Use consistent timing to prevent user enumeration attacks
      if (!user || !user.passwordHash) {
        // Still run bcrypt compare to prevent timing attacks
        await bcryptjs.compare(input.password, '$2b$12$invalidhashpadding000000000000000000000000000000000000000');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const isValid = await bcryptjs.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        });
      }

      const token = signToken(user.id, user.email);

      return {
        success: true,
        requiresTwoFactor: false,
        user: safeUser(user),
        token,
      };
    }),

  /** Get current authenticated user */
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. Please sign in again.',
        });
      }

      return safeUser(user);
    }),

  /** Verify token validity (used by frontend on app boot) */
  getSession: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.userId) return null;

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      });

      if (!user) return null;

      return safeUser(user);
    }),

  /** Update name / avatar */
  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const updates: Partial<typeof users.$inferInsert> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;

      const [updated] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      return { success: true, user: safeUser(updated) };
    }),

  /** Change password (requires knowing current password) */
  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      const isCurrentValid = await bcryptjs.compare(input.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect.',
        });
      }

      const newHash = await bcryptjs.hash(input.newPassword, BCRYPT_ROUNDS);
      await db.update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, userId));

      return { success: true, message: 'Password changed successfully.' };
    }),

  /** Logout — client should discard token. Server logs the event. */
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      console.log(`[AUTH] User ${ctx.userId} logged out from IP ${ctx.ipAddress}`);
      return { success: true };
    }),
});
