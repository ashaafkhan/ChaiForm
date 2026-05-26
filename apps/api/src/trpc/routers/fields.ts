import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { CreateFieldSchema, UpdateFieldSchema, ReorderFieldsSchema } from '@chaiforms/schemas';
import { fields, forms } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';

export const fieldsRouter = router({
  create: protectedProcedure
    .input(CreateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      // Get the next order number
      const lastField = await db.query.fields.findFirst({
        where: eq(fields.formId, input.formId),
        orderBy: (fields, { desc }) => desc(fields.order),
      });

      const nextOrder = (lastField?.order ?? 0) + 1;

      const newField = await db
        .insert(fields)
        .values({
          formId: input.formId,
          type: input.type,
          label: input.label,
          description: input.description,
          placeholder: input.placeholder,
          order: nextOrder,
          page: input.page || 1,
          isRequired: input.isRequired || false,
          validation: input.validation || {},
          options: input.options || [],
          conditionalLogic: input.conditionalLogic,
        })
        .returning();

      return {
        success: true,
        field: newField[0],
      };
    }),

  update: protectedProcedure
    .input(UpdateFieldSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { fieldId, ...updateData } = input;

      // Verify access by checking form ownership
      const field = await db.query.fields.findFirst({
        where: eq(fields.id, fieldId),
        with: { form: true },
      });

      if (!field || field.form.userId !== userId) {
        throw new Error('Field not found or you do not have access');
      }

      const updated = await db
        .update(fields)
        .set(updateData)
        .where(eq(fields.id, fieldId))
        .returning();

      return {
        success: true,
        field: updated[0],
      };
    }),

  delete: protectedProcedure
    .input(z.object({ fieldId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify access
      const field = await db.query.fields.findFirst({
        where: eq(fields.id, input.fieldId),
        with: { form: true },
      });

      if (!field || field.form.userId !== userId) {
        throw new Error('Field not found or you do not have access');
      }

      await db.delete(fields).where(eq(fields.id, input.fieldId));

      return { success: true };
    }),

  reorder: protectedProcedure
    .input(ReorderFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      // Update all field orders
      for (let i = 0; i < input.fieldIds.length; i++) {
        await db
          .update(fields)
          .set({ order: i + 1 })
          .where(eq(fields.id, input.fieldIds[i]));
      }

      return { success: true };
    }),

  getByFormId: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
        orderBy: (fields, { asc }) => asc(fields.order),
      });

      return formFields;
    }),

  duplicate: protectedProcedure
    .input(z.object({ fieldId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify access
      const field = await db.query.fields.findFirst({
        where: eq(fields.id, input.fieldId),
        with: { form: true },
      });

      if (!field || field.form.userId !== userId) {
        throw new Error('Field not found or you do not have access');
      }

      // Get next order
      const lastField = await db.query.fields.findFirst({
        where: eq(fields.formId, field.formId),
        orderBy: (fields, { desc }) => desc(fields.order),
      });

      const nextOrder = (lastField?.order ?? 0) + 1;

      const newField = await db
        .insert(fields)
        .values({
          formId: field.formId,
          type: field.type,
          label: `${field.label} (Copy)`,
          description: field.description,
          placeholder: field.placeholder,
          order: nextOrder,
          page: field.page,
          isRequired: field.isRequired,
          validation: field.validation,
          options: field.options,
          conditionalLogic: field.conditionalLogic,
        })
        .returning();

      return {
        success: true,
        field: newField[0],
      };
    }),
});
