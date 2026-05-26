import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { CreateFormSchema, UpdateFormSchema } from '@chaiforms/schemas';
import { forms } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';
import { slugify } from '@chaiforms/utils';

export const formsRouter = router({
  create: protectedProcedure
    .input(CreateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      
      let slug = slugify(input.title);
      let counter = 1;
      
      // Ensure unique slug
      while (true) {
        const existing = await db.query.forms.findFirst({
          where: eq(forms.slug, slug),
        });
        if (!existing) break;
        slug = `${slugify(input.title)}-${counter++}`;
      }

      const newForm = await db
        .insert(forms)
        .values({
          userId: userId!,
          title: input.title,
          description: input.description,
          slug,
          status: 'draft',
          visibility: 'unlisted',
        })
        .returning();

      return {
        success: true,
        form: newForm[0],
      };
    }),

  update: protectedProcedure
    .input(UpdateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { formId, ...updateData } = input;

      // Verify ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const updated = await db
        .update(forms)
        .set(updateData)
        .where(eq(forms.id, formId))
        .returning();

      return {
        success: true,
        form: updated[0],
      };
    }),

  getById: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
        with: {
          fields: true,
          responses: {
            limit: 10,
          },
        },
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      return form;
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().int().default(1),
      limit: z.number().int().max(50).default(20),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const skip = (input.page - 1) * input.limit;

      let whereCondition: any = eq(forms.userId, userId!);
      if (input.status) {
        whereCondition = and(whereCondition, eq(forms.status, input.status));
      }

      const userForms = await db.query.forms.findMany({
        where: whereCondition,
        limit: input.limit,
        offset: skip,
        orderBy: (forms, { desc }) => desc(forms.createdAt),
      });

      return {
        forms: userForms,
        page: input.page,
        limit: input.limit,
      };
    }),

  publish: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      visibility: z.enum(['public', 'unlisted']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const updated = await db
        .update(forms)
        .set({
          status: 'published',
          visibility: input.visibility,
          publishedAt: new Date(),
        })
        .where(eq(forms.id, input.formId))
        .returning();

      return {
        success: true,
        form: updated[0],
      };
    }),

  unpublish: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const updated = await db
        .update(forms)
        .set({
          status: 'draft',
          publishedAt: null,
        })
        .where(eq(forms.id, input.formId))
        .returning();

      return {
        success: true,
        form: updated[0],
      };
    }),

  getPublicBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      password: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(
          eq(forms.slug, input.slug),
          eq(forms.status, 'published')
        ),
        with: {
          fields: {
            orderBy: (fields, { asc }) => asc(fields.order),
          },
        },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Check password if set
      if (form.password && form.password !== input.password) {
        throw new Error('Invalid password');
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        fields: form.fields,
        settings: form.settings,
        theme: form.customTheme,
      };
    }),

  explore: publicProcedure
    .input(z.object({
      page: z.number().int().default(1),
      limit: z.number().int().max(24).default(12),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const skip = (input.page - 1) * input.limit;

      const publicForms = await db.query.forms.findMany({
        where: and(
          eq(forms.status, 'published'),
          eq(forms.visibility, 'public')
        ),
        limit: input.limit,
        offset: skip,
        orderBy: (forms, { desc }) => desc(forms.viewCount),
      });

      return {
        forms: publicForms.map(f => ({
          id: f.id,
          title: f.title,
          slug: f.slug,
          responseCount: f.responseCount,
          viewCount: f.viewCount,
        })),
        page: input.page,
        limit: input.limit,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      await db.delete(forms).where(eq(forms.id, input.formId));

      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
        with: { fields: true },
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const newSlug = `${form.slug}-copy`;
      const newForm = await db
        .insert(forms)
        .values({
          userId: userId!,
          title: `${form.title} (Copy)`,
          description: form.description,
          slug: newSlug,
          status: 'draft',
          visibility: form.visibility,
          themeId: form.themeId,
          customTheme: form.customTheme,
          settings: form.settings,
        })
        .returning();

      return {
        success: true,
        form: newForm[0],
      };
    }),
});
