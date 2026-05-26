import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { themes, forms } from '@chaiforms/db';
import { eq, and, like } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const themesRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      let results;
      if (input.category) {
        results = await db.query.themes.findMany({
          where: like(themes.category, `%${input.category}%`),
          limit: input.limit,
          offset: input.offset,
        });
      } else {
        results = await db.query.themes.findMany({
          limit: input.limit,
          offset: input.offset,
        });
      }
      return results;
    }),

  getById: publicProcedure
    .input(z.object({ themeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const theme = await db.query.themes.findFirst({
        where: eq(themes.id, input.themeId),
      });
      if (!theme) throw new TRPCError({ code: 'NOT_FOUND', message: 'Theme not found' });
      return theme;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const theme = await db.query.themes.findFirst({
        where: eq(themes.slug, input.slug),
      });
      if (!theme) throw new TRPCError({ code: 'NOT_FOUND', message: 'Theme not found' });
      return theme;
    }),

  applyToForm: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      themeId: z.string().uuid().optional().nullable(),
      customTheme: z.record(z.unknown()).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });

      if (input.themeId) {
        const theme = await db.query.themes.findFirst({ where: eq(themes.id, input.themeId) });
        if (!theme) throw new TRPCError({ code: 'NOT_FOUND', message: 'Theme not found' });
      }

      await db.update(forms).set({
        themeId: input.themeId ?? null,
        customTheme: input.customTheme ?? null,
      }).where(eq(forms.id, input.formId));

      return { success: true };
    }),

  getFormTheme: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
        with: { theme: true },
      });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
      return { themeId: form.themeId, customTheme: form.customTheme, theme: form.theme };
    }),
});
