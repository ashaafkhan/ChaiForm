import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { SubmitResponseSchema } from '@chaiforms/schemas';
import { responses, forms } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';

export const responsesRouter = router({
  submit: publicProcedure
    .input(SubmitResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get form to check if it's published
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.status, 'published')),
      });

      if (!form) {
        throw new Error('Form not found or not published');
      }

      // Check response limits
      if (form.maxResponses && form.responseCount >= form.maxResponses) {
        throw new Error('Form has reached max responses limit');
      }

      // Check expiration
      if (form.expiresAt && new Date() > form.expiresAt) {
        throw new Error('Form has expired');
      }

      // Submit response
      const newResponse = await db
        .insert(responses)
        .values({
          formId: input.formId,
          respondentEmail: input.respondentEmail,
          answers: input.answers,
          isComplete: true,
          ipAddress: ctx.c.req.header('X-Forwarded-For')?.split(',')[0] || '127.0.0.1',
          userAgent: ctx.c.req.header('User-Agent'),
          referrer: ctx.c.req.header('Referer'),
          completionTimeSeconds: input.completionTimeSeconds,
        })
        .returning();

      // Increment response count
      await db
        .update(forms)
        .set({
          responseCount: (form.responseCount ?? 0) + 1,
        })
        .where(eq(forms.id, input.formId));

      return {
        success: true,
        response: newResponse[0],
      };
    }),

  list: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      page: z.number().int().default(1),
      limit: z.number().int().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const skip = (input.page - 1) * input.limit;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      const formResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        limit: input.limit,
        offset: skip,
        orderBy: (responses, { desc }) => desc(responses.submittedAt),
      });

      return {
        responses: formResponses,
        page: input.page,
        limit: input.limit,
        total: form.responseCount || 0,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Get response and verify form ownership
      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.responseId),
        with: {
          form: true,
        },
      });

      if (!response || response.form.userId !== userId) {
        throw new Error('Response not found or you do not have access');
      }

      return response;
    }),

  delete: protectedProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify access
      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.responseId),
        with: { form: true },
      });

      if (!response || response.form.userId !== userId) {
        throw new Error('Response not found or you do not have access');
      }

      await db.delete(responses).where(eq(responses.id, input.responseId));

      // Decrement response count
      await db
        .update(forms)
        .set({
          responseCount: Math.max(0, (response.form.responseCount || 1) - 1),
        })
        .where(eq(forms.id, response.formId));

      return { success: true };
    }),

  exportCsv: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      // Get all responses
      const formResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
      });

      // Convert to CSV (simplified)
      const headers = ['ID', 'Email', 'Submitted At', 'Answers'];
      const rows = formResponses.map(r => [
        r.id,
        r.respondentEmail || 'Anonymous',
        r.submittedAt.toISOString(),
        JSON.stringify(r.answers),
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return {
        success: true,
        csv,
        filename: `${form.slug}-responses-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),
});
