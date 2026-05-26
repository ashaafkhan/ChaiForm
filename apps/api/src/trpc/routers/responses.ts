import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { responses, forms } from '@chaiforms/db';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/** Single answer for one field */
const AnswerSchema = z.object({
  fieldId: z.string().uuid('Invalid field ID'),
  value: z.union([
    z.string().max(10_000).transform(sanitize), // text answers capped & sanitized
    z.number(),
    z.boolean(),
    z.array(z.string().max(500)),
    z.null(),
  ]),
}).strict();

const SubmitResponseSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  answers: z
    .array(AnswerSchema)
    .min(1, 'At least one answer is required')
    .max(500, 'Too many answers'),
  respondentEmail: z
    .string()
    .email('Invalid respondent email')
    .max(255)
    .toLowerCase()
    .optional()
    .nullable(),
  respondentName: z
    .string()
    .max(200)
    .transform(sanitize)
    .optional()
    .nullable(),
  completionTimeSeconds: z
    .number()
    .int()
    .min(0)
    .max(86_400) // max 24 hours
    .optional()
    .nullable(),
  metadata: z.record(z.unknown()).optional(), // custom tracking data
});

const ListResponsesSchema = z.object({
  formId: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const responsesRouter = router({
  /** Public — submit a form response */
  submit: publicProcedure
    .input(SubmitResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.status, 'published')),
        columns: {
          id: true, status: true, maxResponses: true, responseCount: true,
          expiresAt: true, slug: true,
        },
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found or no longer published.',
        });
      }

      if (form.maxResponses && form.responseCount >= form.maxResponses) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This form is no longer accepting responses (response limit reached).',
        });
      }

      if (form.expiresAt && new Date() > form.expiresAt) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This form has expired and is no longer accepting responses.',
        });
      }

      // Sanitize IP: pick first non-private IP from X-Forwarded-For
      const rawIp = ctx.c.req.header('x-forwarded-for') || ctx.c.req.header('x-real-ip') || '127.0.0.1';
      const ipAddress = rawIp.split(',')[0].trim();

      // Sanitize User-Agent (cap length)
      const userAgent = (ctx.c.req.header('user-agent') || '').slice(0, 512);
      const referrer = (ctx.c.req.header('referer') || '').slice(0, 2048);

      const [response] = await db.insert(responses).values({
        formId: input.formId,
        respondentEmail: input.respondentEmail ?? null,
        respondentName: input.respondentName ?? null,
        answers: input.answers,
        isComplete: true,
        ipAddress,
        userAgent,
        referrer,
        completionTimeSeconds: input.completionTimeSeconds ?? null,
      }).returning();

      // Atomically increment response count (fire-and-forget — doesn't block response)
      db.update(forms)
        .set({ responseCount: form.responseCount + 1 })
        .where(eq(forms.id, input.formId))
        .catch(console.error);

      return {
        success: true,
        responseId: response.id,
      };
    }),

  /** Owner — list responses for a form */
  list: protectedProcedure
    .input(ListResponsesSchema)
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        columns: { id: true, responseCount: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      const offset = (input.page - 1) * input.limit;
      const formResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        limit: input.limit,
        offset,
        orderBy: (r: any, { desc }: any) => desc(r.submittedAt),
      });

      return {
        responses: formResponses,
        page: input.page,
        limit: input.limit,
        total: form.responseCount ?? 0,
        totalPages: Math.ceil((form.responseCount ?? 0) / input.limit),
      };
    }),

  /** Owner — get a single response by ID */
  getById: protectedProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.responseId),
        with: { form: { columns: { userId: true } } },
      });

      if (!response || response.form.userId !== userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Response not found.' });
      }

      return response;
    }),

  /** Owner — delete a single response */
  delete: protectedProcedure
    .input(z.object({ responseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const response = await db.query.responses.findFirst({
        where: eq(responses.id, input.responseId),
        with: { form: { columns: { userId: true, id: true, responseCount: true } } },
      });

      if (!response || response.form.userId !== userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Response not found.' });
      }

      await db.delete(responses).where(eq(responses.id, input.responseId));

      // Keep count accurate
      await db.update(forms)
        .set({ responseCount: Math.max(0, (response.form.responseCount ?? 1) - 1) })
        .where(eq(forms.id, response.form.id));

      return { success: true };
    }),

  /** Owner — export responses as CSV with proper escaping */
  exportCsv: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        with: { fields: { orderBy: (f: any, { asc }: any) => asc(f.order) } },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      const allResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
        orderBy: (r: any, { asc }: any) => asc(r.submittedAt),
      });

      /** Escape a CSV cell value (RFC 4180) */
      const csvCell = (v: unknown): string => {
        const str = v === null || v === undefined ? '' : String(v);
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const fieldLabels = form.fields.map((f: any) => f.label);
      const headers = [
        'Response ID', 'Submitted At', 'Email', 'Name',
        'Completion Time (s)', 'IP Address',
        ...fieldLabels,
      ];

      const rows = allResponses.map((r) => {
        const answers = (r.answers as any[]) ?? [];
        const fieldValues = form.fields.map((f: any) => {
          const answer = answers.find((a: any) => a.fieldId === f.id);
          const val = answer?.value;
          return Array.isArray(val) ? val.join('; ') : val ?? '';
        });

        return [
          r.id,
          r.submittedAt.toISOString(),
          r.respondentEmail ?? '',
          r.respondentName ?? '',
          r.completionTimeSeconds ?? '',
          r.ipAddress ?? '',
          ...fieldValues,
        ];
      });

      const csv = [
        headers.map(csvCell).join(','),
        ...rows.map((row) => row.map(csvCell).join(',')),
      ].join('\r\n');

      return {
        csv,
        filename: `${form.slug}-responses-${new Date().toISOString().split('T')[0]}.csv`,
        totalRows: allResponses.length,
      };
    }),
});
