import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { users, socialAccounts } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const oauthRouter = router({
  getOAuthUrl: publicProcedure
    .input(z.object({ provider: z.enum(['google', 'github']) }))
    .query(({ input }) => {
      const state = crypto.randomBytes(32).toString('hex');
      const clientId = process.env[`${input.provider.toUpperCase()}_CLIENT_ID`];

      if (!clientId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `${input.provider} OAuth is not configured on this server.`,
        });
      }

      let authUrl = '';
      const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/callback/${input.provider}`;

      if (input.provider === 'google') {
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid profile email',
          state,
          access_type: 'offline',
        }).toString()}`;
      } else {
        authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: 'user:email',
          state,
        }).toString()}`;
      }

      return { authUrl, state };
    }),

  handleCallback: publicProcedure
    .input(z.object({
      provider: z.enum(['google', 'github']),
      code: z.string().min(1),
      state: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const clientId     = process.env[`${input.provider.toUpperCase()}_CLIENT_ID`];
      const clientSecret = process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`];

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `${input.provider} OAuth is not configured on this server.`,
        });
      }

      try {
        const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/callback/${input.provider}`;

        // Exchange code for token
        let tokenResponse: Response;
        if (input.provider === 'google') {
          tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code: input.code, client_id: clientId, client_secret: clientSecret,
              redirect_uri: redirectUri, grant_type: 'authorization_code',
            }).toString(),
          });
        } else {
          tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
            body: new URLSearchParams({
              code: input.code, client_id: clientId, client_secret: clientSecret,
            }).toString(),
          });
        }

        if (!tokenResponse.ok) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to exchange OAuth code for token.' });
        }

        const tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in?: number };
        const accessToken = tokenData.access_token;

        // Fetch user profile from provider
        let profile: { id?: string; sub?: string; email: string; name?: string; login?: string; picture?: string; avatar_url?: string };
        if (input.provider === 'google') {
          const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          profile = await r.json();
        } else {
          const r = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
          });
          profile = await r.json();
        }

        const providerAccountId = String(profile.id || profile.sub);
        const normalizedEmail   = profile.email?.toLowerCase()?.trim();

        if (!normalizedEmail) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'OAuth provider did not return an email address.' });
        }

        // Check if social account already linked
        const existing = await db.query.socialAccounts.findFirst({
          where: and(eq(socialAccounts.provider, input.provider), eq(socialAccounts.providerAccountId, providerAccountId)),
        });
        if (existing) return { userId: existing.userId, isNewUser: false };

        // Upsert user by email
        let userId: string;
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, normalizedEmail),
          columns: { id: true },
        });

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const [newUser] = await db.insert(users).values({
            name: profile.name || profile.login || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            avatarUrl: profile.picture || profile.avatar_url || null,
            isVerified: true,
            passwordHash: null,
          }).returning();
          userId = newUser.id;
        }

        // Link social account
        await db.insert(socialAccounts).values({
          userId,
          provider: input.provider,
          providerAccountId,
          email: normalizedEmail,
          name: profile.name || profile.login || null,
          image: profile.picture || profile.avatar_url || null,
          accessToken,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        });

        return { userId, isNewUser: !existingUser };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error('OAuth callback error:', err);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'OAuth callback failed. Please try again.' });
      }
    }),

  getSocialAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;
      const accounts = await db.query.socialAccounts.findMany({
        where: eq(socialAccounts.userId, userId),
      });
      // Never expose tokens
      return accounts.map(({ accessToken: _a, refreshToken: _r, ...safe }) => safe);
    }),

  unlinkSocialAccount: protectedProcedure
    .input(z.object({ provider: z.enum(['google', 'github']) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      await db.delete(socialAccounts).where(
        and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, input.provider))
      );
      return { success: true };
    }),
});
