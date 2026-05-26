import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { forms, fields } from '@chaiforms/db';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const FormTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(500, 'Title too long (max 500 chars)')
  .transform(sanitize);

const FormDescSchema = z
  .string()
  .max(5000, 'Description too long (max 5000 chars)')
  .transform(sanitize)
  .optional();

const SlugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens')
  .transform((s) => s.toLowerCase().trim());

const FormSettingsSchema = z.object({
  submitButtonText: z.string().max(100).default('Submit'),
  successMessage: z.string().max(1000).default('Thank you for your response!'),
  redirectUrl: z.string().url().optional().nullable(),
  allowMultipleResponses: z.boolean().default(true),
  requireLogin: z.boolean().default(false),
  showProgressBar: z.boolean().default(true),
  shuffleFields: z.boolean().default(false),
  isMultiPage: z.boolean().default(false),
  notifyCreator: z.boolean().default(true),
  notifyRespondent: z.boolean().default(false),
  collectEmailOfRespondent: z.boolean().default(false),
}).partial();

const CreateFormSchema = z.object({
  title: FormTitleSchema,
  description: FormDescSchema,
}).strict();

const UpdateFormSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  title: FormTitleSchema.optional(),
  description: FormDescSchema,
  settings: FormSettingsSchema.optional(),
  password: z.string().max(100).nullable().optional(),
  maxResponses: z.number().int().min(1).max(1_000_000).nullable().optional(),
  expiresAt: z.date().nullable().optional(),
}).strict();

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function assertFormOwner(db: any, formId: string, userId: string) {
  const form = await db.query.forms.findFirst({
    where: and(eq(forms.id, formId), eq(forms.userId, userId)),
    columns: { id: true, status: true, slug: true, responseCount: true },
  });
  if (!form) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Form not found or you do not have access.',
    });
  }
  return form;
}

async function ensureUniqueSlug(db: any, base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const existing = await db.query.forms.findFirst({
      where: eq(forms.slug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    attempt++;
    if (attempt > 100) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not generate a unique slug.' });
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const formsRouter = router({
  /** Create a new form (draft) */
  create: protectedProcedure
    .input(CreateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const slug = await ensureUniqueSlug(db, input.title);

      const [form] = await db.insert(forms).values({
        userId,
        title: input.title,
        description: input.description ?? null,
        slug,
        status: 'draft',
        visibility: 'unlisted',
      }).returning();

      return { success: true, form };
    }),

  /** Update form metadata / settings */
  update: protectedProcedure
    .input(UpdateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { formId, ...updates } = input;

      await assertFormOwner(db, formId, userId);

      const [form] = await db.update(forms)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(forms.id, formId))
        .returning();

      return { success: true, form };
    }),

  /** Get a single form (owner only) with fields */
  getById: protectedProcedure
    .input(z.object({ formId: z.string().uuid('Invalid form ID') }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        with: {
          fields: { orderBy: (f: any, { asc }: any) => asc(f.order) },
          theme: true,
        },
      });

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      return form;
    }),

  /** List current user's forms, with optional status filter */
  list: protectedProcedure
    .input(PaginationSchema.extend({
      status: z.enum(['draft', 'published', 'archived']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const offset = (input.page - 1) * input.limit;

      const where = input.status
        ? and(eq(forms.userId, userId), eq(forms.status, input.status))
        : eq(forms.userId, userId);

      const userForms = await db.query.forms.findMany({
        where,
        limit: input.limit,
        offset,
        orderBy: (f: any, { desc }: any) => desc(f.updatedAt),
      });

      return { forms: userForms, page: input.page, limit: input.limit };
    }),

  /** Publish a form (requires at least 1 field) */
  publish: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      visibility: z.enum(['public', 'unlisted']).default('public'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      await assertFormOwner(db, input.formId, userId);

      // Guard: must have at least one field
      const fieldCount = await db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        columns: { id: true },
        limit: 1,
      });
      if (fieldCount.length === 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Add at least one field before publishing.',
        });
      }

      const [form] = await db.update(forms)
        .set({ status: 'published', visibility: input.visibility, publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(forms.id, input.formId))
        .returning();

      return { success: true, form };
    }),

  /** Revert to draft */
  unpublish: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      await assertFormOwner(db, input.formId, userId);

      const [form] = await db.update(forms)
        .set({ status: 'draft', publishedAt: null, updatedAt: new Date() })
        .where(eq(forms.id, input.formId))
        .returning();

      return { success: true, form };
    }),

  /** Archive a form */
  archive: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      await assertFormOwner(db, input.formId, userId);

      const [form] = await db.update(forms)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(forms.id, input.formId))
        .returning();

      return { success: true, form };
    }),

  /** Get public form by slug (for filling) */
  getPublicBySlug: publicProcedure
    .input(z.object({
      slug: SlugSchema,
      password: z.string().max(100).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.slug, input.slug), eq(forms.status, 'published')),
        with: {
          fields: { orderBy: (f: any, { asc }: any) => asc(f.order) },
          theme: true,
        },
      });

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found or no longer available.' });
      }

      if (form.expiresAt && form.expiresAt < new Date()) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'This form has expired.' });
      }

      if (form.maxResponses && form.responseCount >= form.maxResponses) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'This form is no longer accepting responses.' });
      }

      if (form.password) {
        if (!input.password) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'This form requires a password.' });
        }
        if (form.password !== input.password) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Incorrect password.' });
        }
      }

      // Increment view count asynchronously (non-blocking)
      db.update(forms)
        .set({ viewCount: (form.viewCount ?? 0) + 1 })
        .where(eq(forms.id, form.id))
        .catch(() => {}); // fire-and-forget

      // Strip internal fields before returning
      const { password: _pwd, userId: _uid, ...safeForm } = form;
      return safeForm;
    }),

  /** Explore public forms (for templates page) */
  listTemplates: publicProcedure
    .input(PaginationSchema.extend({
      category: z.string().max(50).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const offset = (input.page - 1) * input.limit;

      const where = and(
        eq(forms.status, 'published'),
        eq(forms.visibility, 'public'),
        eq(forms.isTemplate, true),
        ...(input.category ? [eq(forms.templateCategory, input.category)] : []),
      );

      const templates = await db.query.forms.findMany({
        where,
        limit: input.limit,
        offset,
        orderBy: (f: any, { desc }: any) => desc(f.viewCount),
        with: { fields: { columns: { id: true } } },
      });

      return { templates, page: input.page, limit: input.limit };
    }),

  /** Delete a form permanently */
  delete: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const form = await assertFormOwner(db, input.formId, userId);

      // Prevent deletion of published forms (must unpublish first)
      if (form.status === 'published') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Unpublish the form before deleting it.',
        });
      }

      await db.delete(forms).where(eq(forms.id, input.formId));
      return { success: true };
    }),

  /** Duplicate a form (creates draft copy) */
  duplicate: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const original = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        with: { fields: true },
      });

      if (!original) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      const newSlug = await ensureUniqueSlug(db, `${original.title} copy`);

      const [newForm] = await db.insert(forms).values({
        userId,
        title: `${original.title} (Copy)`,
        description: original.description,
        slug: newSlug,
        status: 'draft',
        visibility: 'unlisted',
        themeId: original.themeId,
        customTheme: original.customTheme,
        settings: original.settings,
      }).returning();

      return { success: true, form: newForm };
    }),
});
