import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { fields, forms } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const FieldTypeSchema = z.enum([
  'short_text', 'long_text', 'email', 'number', 'phone',
  'single_select', 'multi_select', 'dropdown', 'yes_no',
  'rating', 'scale', 'date', 'time', 'file_upload',
  'matrix', 'ranking', 'statement', 'page_break', 'signature',
]);

const FieldOptionSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1, 'Option label required').max(500).transform(sanitize),
  value: z.string().min(1).max(500),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().max(2048).optional(),
});

const FieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  pattern: z.string().max(500).optional(),
  maxRating: z.number().int().min(2).max(10).optional(),
  maxFileSize: z.number().int().min(1).optional(),
  allowedFileTypes: z.array(z.string().max(20)).max(20).optional(),
}).partial().optional();

const ConditionalLogicSchema = z.object({
  enabled: z.boolean().default(false),
  conditions: z.array(z.object({
    fieldId: z.string().uuid(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty']),
    value: z.string().max(500),
  })).max(10),
  action: z.enum(['show', 'hide', 'require', 'skip_to']).default('show'),
  skipToFieldId: z.string().uuid().optional(),
}).optional();

const CreateFieldSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  type: FieldTypeSchema,
  label: z.string().min(1, 'Label is required').max(1000).transform(sanitize),
  description: z.string().max(2000).transform(sanitize).optional().nullable(),
  placeholder: z.string().max(500).transform(sanitize).optional().nullable(),
  isRequired: z.boolean().default(false),
  page: z.number().int().min(1).max(100).default(1),
  options: z.array(FieldOptionSchema).max(200).default([]),
  validation: FieldValidationSchema,
  conditionalLogic: ConditionalLogicSchema,
}).strict();

const UpdateFieldSchema = z.object({
  fieldId: z.string().uuid('Invalid field ID'),
  label: z.string().min(1).max(1000).transform(sanitize).optional(),
  description: z.string().max(2000).transform(sanitize).optional().nullable(),
  placeholder: z.string().max(500).transform(sanitize).optional().nullable(),
  isRequired: z.boolean().optional(),
  options: z.array(FieldOptionSchema).max(200).optional(),
  validation: FieldValidationSchema,
  conditionalLogic: ConditionalLogicSchema,
}).strict();

const ReorderSchema = z.object({
  formId: z.string().uuid(),
  fieldIds: z
    .array(z.string().uuid())
    .min(1, 'At least one field required')
    .max(500, 'Too many fields'),
});

// ─── Helper ───────────────────────────────────────────────────────────────────
async function assertFieldOwner(db: any, fieldId: string, userId: string) {
  const field = await db.query.fields.findFirst({
    where: eq(fields.id, fieldId),
    with: { form: { columns: { userId: true, id: true } } },
  });
  if (!field || field.form.userId !== userId) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Field not found or access denied.' });
  }
  return field;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const fieldsRouter = router({
  /** Add a new field to a form */
  create: protectedProcedure
    .input(CreateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { formId, ...fieldData } = input;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, formId), eq(forms.userId, userId)),
        columns: { id: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      // Cap at 200 fields per form
      const existingCount = await db.query.fields.findMany({
        where: eq(fields.formId, formId),
        columns: { id: true },
      });
      if (existingCount.length >= 200) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'A form cannot have more than 200 fields.',
        });
      }

      const lastField = await db.query.fields.findFirst({
        where: eq(fields.formId, formId),
        orderBy: (f: any, { desc }: any) => desc(f.order),
        columns: { order: true },
      });

      const [field] = await db.insert(fields).values({
        formId,
        ...fieldData,
        order: (lastField?.order ?? 0) + 1,
      }).returning();

      return { success: true, field };
    }),

  /** Update an existing field */
  update: protectedProcedure
    .input(UpdateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { fieldId, ...updates } = input;

      await assertFieldOwner(db, fieldId, userId);

      const [field] = await db.update(fields)
        .set(updates)
        .where(eq(fields.id, fieldId))
        .returning();

      return { success: true, field };
    }),

  /** Delete a field */
  delete: protectedProcedure
    .input(z.object({ fieldId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const field = await assertFieldOwner(db, input.fieldId, userId);

      await db.delete(fields).where(eq(fields.id, input.fieldId));

      // Compact order numbers after deletion
      const remaining = await db.query.fields.findMany({
        where: eq(fields.formId, field.formId),
        orderBy: (f: any, { asc }: any) => asc(f.order),
        columns: { id: true },
      });
      await Promise.all(
        remaining.map((f: any, i: number) =>
          db.update(fields).set({ order: i + 1 }).where(eq(fields.id, f.id))
        )
      );

      return { success: true };
    }),

  /** Reorder all fields of a form (drag-and-drop) */
  reorder: protectedProcedure
    .input(ReorderSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        columns: { id: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      // Update all orders in parallel for performance
      await Promise.all(
        input.fieldIds.map((fieldId: string, i: number) =>
          db.update(fields).set({ order: i + 1 }).where(eq(fields.id, fieldId))
        )
      );

      return { success: true };
    }),

  /** Get all fields for a form (sorted) */
  getByFormId: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        columns: { id: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      return db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        orderBy: (f: any, { asc }: any) => asc(f.order),
      });
    }),

  /** Duplicate a field (inserts copy after original) */
  duplicate: protectedProcedure
    .input(z.object({ fieldId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const field = await assertFieldOwner(db, input.fieldId, userId);

      const lastField = await db.query.fields.findFirst({
        where: eq(fields.formId, field.formId),
        orderBy: (f: any, { desc }: any) => desc(f.order),
        columns: { order: true },
      });

      const [newField] = await db.insert(fields).values({
        formId: field.formId,
        type: field.type,
        label: `${field.label} (Copy)`,
        description: field.description,
        placeholder: field.placeholder,
        order: (lastField?.order ?? 0) + 1,
        page: field.page,
        isRequired: false, // copies are not required by default
        validation: field.validation,
        options: field.options,
        conditionalLogic: field.conditionalLogic,
      }).returning();

      return { success: true, field: newField };
    }),
});
