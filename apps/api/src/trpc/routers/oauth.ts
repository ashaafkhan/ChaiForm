import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { users, socialAccounts } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const oauthRouter = router({
  getOAuthUrl: publicProcedure
    .input(z.object({
      provider: z.enum(['google', 'github']),
    }))
    .query(({ input }) => {
      const state = crypto.randomBytes(32).toString('hex');
      const clientId = process.env[`${input.provider.toUpperCase()}_CLIENT_ID`];

      if (!clientId) {
        throw new Error(`${input.provider} OAuth not configured`);
      }

      let authUrl = '';
      if (input.provider === 'google') {
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback/${input.provider}`,
          response_type: 'code',
          scope: 'openid profile email',
          state,
          access_type: 'offline',
        }).toString()}`;
      } else if (input.provider === 'github') {
        authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback/${input.provider}`,
          scope: 'user:email',
          state,
        }).toString()}`;
      }

      return { authUrl, state };
    }),

  handleCallback: publicProcedure
    .input(z.object({
      provider: z.enum(['google', 'github']),
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const clientId = process.env[`${input.provider.toUpperCase()}_CLIENT_ID`];
      const clientSecret = process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`];

      if (!clientId || !clientSecret) {
        throw new Error(`${input.provider} OAuth not configured`);
      }

      try {
        // Exchange code for token
        let tokenResponse;
        if (input.provider === 'google') {
          tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code: input.code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/callback/${input.provider}`,
              grant_type: 'authorization_code',
            }).toString(),
          });
        } else if (input.provider === 'github') {
          tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
            body: new URLSearchParams({
              code: input.code,
              client_id: clientId,
              client_secret: clientSecret,
            }).toString(),
          });
        }

        if (!tokenResponse || !tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get user info from provider
        let userInfo;
        if (input.provider === 'google') {
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          userInfo = await userResponse.json();
        } else if (input.provider === 'github') {
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          userInfo = await userResponse.json();
        }

        // Check if social account exists
        const existingSocialAccount = await db.query.socialAccounts.findFirst({
          where: and(
            eq(socialAccounts.provider, input.provider),
            eq(socialAccounts.providerAccountId, userInfo.id || userInfo.sub)
          ),
        });

        if (existingSocialAccount) {
          // Account already linked, return user
          return {
            userId: existingSocialAccount.userId,
            isNewUser: false,
          };
        }

        // Check if user with this email exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, userInfo.email),
        });

        let userId: string;
        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create new user
          const newUser = await db.insert(users).values({
            name: userInfo.name || userInfo.login || userInfo.email.split('@')[0],
            email: userInfo.email,
            avatarUrl: userInfo.picture || userInfo.avatar_url,
            isVerified: true,
            passwordHash: null,
          }).returning();
          userId = newUser[0].id;
        }

        // Link social account
        await db.insert(socialAccounts).values({
          userId,
          provider: input.provider,
          providerAccountId: userInfo.id || userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.login,
          image: userInfo.picture || userInfo.avatar_url,
          accessToken,
          refreshToken: tokenData.refresh_token,
          expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        });

        return {
          userId,
          isNewUser: !existingUser,
        };
      } catch (error) {
        console.error('OAuth callback error:', error);
        throw new Error('Failed to process OAuth callback');
      }
    }),

  getSocialAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;

      const accounts = await db.query.socialAccounts.findMany({
        where: eq(socialAccounts.userId, userId!),
      });

      return accounts.map(({ accessToken, refreshToken, ...rest }) => rest);
    }),

  unlinkSocialAccount: protectedProcedure
    .input(z.object({
      provider: z.enum(['google', 'github']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      await db.delete(socialAccounts)
        .where(
          and(
            eq(socialAccounts.userId, userId!),
            eq(socialAccounts.provider, input.provider)
          )
        );

      return { success: true };
    }),
});
