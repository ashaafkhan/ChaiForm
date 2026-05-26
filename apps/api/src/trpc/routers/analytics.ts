import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { analyticsEvents, forms, responses } from '@chaiforms/db';
import { eq, and, gte, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const EventTypeSchema = z.enum([
  'form_view', 'form_start', 'field_focus', 'field_blur',
  'page_change', 'form_submit', 'form_abandon',
]);

const DateRangeSchema = z.enum(['7d', '30d', '90d', 'all']).default('30d');

function getStartDate(range: '7d' | '30d' | '90d' | 'all'): Date {
  if (range === 'all') return new Date('2020-01-01');
  const d = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range];
  d.setDate(d.getDate() - days);
  return d;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const analyticsRouter = router({
  /** Public — track a form interaction event */
  trackEvent: publicProcedure
    .input(z.object({
      formId: z.string().uuid('Invalid form ID'),
      eventType: EventTypeSchema,
      fieldId: z.string().uuid().optional(),
      sessionId: z.string().max(128).optional(),
      metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Only verify form exists — don't throw loudly (don't block form UX)
      const form = await db.query.forms.findFirst({
        where: eq(forms.id, input.formId),
        columns: { id: true, viewCount: true },
      });
      if (!form) return { success: false }; // silent fail — don't expose form existence

      await db.insert(analyticsEvents).values({
        formId: input.formId,
        eventType: input.eventType,
        fieldId: input.fieldId ?? null,
        metadata: input.metadata ?? {},
        sessionId: input.sessionId ?? null,
      });

      // Async view counter bump — doesn't block response
      if (input.eventType === 'form_view') {
        db.update(forms)
          .set({ viewCount: (form.viewCount ?? 0) + 1 })
          .where(eq(forms.id, input.formId))
          .catch(console.error);
      }

      return { success: true };
    }),

  /** Owner — summary stats for a form */
  getSummary: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      dateRange: DateRangeSchema,
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        columns: { id: true, responseCount: true, viewCount: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      const startDate = getStartDate(input.dateRange);

      const [viewsResult, startsResult, completionsResult] = await Promise.all([
        db.select({ count: count() })
          .from(analyticsEvents)
          .where(and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_view'),
            gte(analyticsEvents.createdAt, startDate),
          )),
        db.select({ count: count() })
          .from(analyticsEvents)
          .where(and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_start'),
            gte(analyticsEvents.createdAt, startDate),
          )),
        db.select({ count: count() })
          .from(responses)
          .where(and(
            eq(responses.formId, input.formId),
            eq(responses.isComplete, true),
            gte(responses.submittedAt, startDate),
          )),
      ]);

      const views = viewsResult[0].count ?? 0;
      const starts = startsResult[0].count ?? 0;
      const completions = completionsResult[0].count ?? 0;

      return {
        totalViews: views,
        totalStarts: starts,
        totalCompletions: completions,
        completionRate: starts > 0 ? Math.round((completions / starts) * 100) : 0,
        abandonRate: starts > 0 ? Math.round(((starts - completions) / starts) * 100) : 0,
        viewToStartRate: views > 0 ? Math.round((starts / views) * 100) : 0,
      };
    }),

  /** Owner — dashboard overview stats */
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;

      const userForms = await db.query.forms.findMany({
        where: eq(forms.userId, userId),
        columns: { id: true, status: true, responseCount: true, viewCount: true },
      });

      const totalResponses = userForms.reduce((s, f) => s + (f.responseCount ?? 0), 0);
      const totalViews = userForms.reduce((s, f) => s + (f.viewCount ?? 0), 0);

      return {
        totalForms: userForms.length,
        publishedForms: userForms.filter(f => f.status === 'published').length,
        draftForms: userForms.filter(f => f.status === 'draft').length,
        archivedForms: userForms.filter(f => f.status === 'archived').length,
        totalResponses,
        totalViews,
        avgResponsesPerForm: userForms.length > 0
          ? Math.round(totalResponses / userForms.length)
          : 0,
      };
    }),

  /** Owner — per-field engagement stats */
  getFieldAnalytics: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      fieldId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId)),
        columns: { id: true },
      });
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found.' });
      }

      const [focuses, blurs] = await Promise.all([
        db.select({ count: count() })
          .from(analyticsEvents)
          .where(and(
            eq(analyticsEvents.fieldId, input.fieldId),
            eq(analyticsEvents.eventType, 'field_focus'),
          )),
        db.select({ count: count() })
          .from(analyticsEvents)
          .where(and(
            eq(analyticsEvents.fieldId, input.fieldId),
            eq(analyticsEvents.eventType, 'field_blur'),
          )),
      ]);

      const focusCount = focuses[0].count ?? 0;
      const blurCount = blurs[0].count ?? 0;
      const dropRate = focusCount > 0
        ? Math.round(((focusCount - blurCount) / focusCount) * 100)
        : 0;

      return {
        fieldId: input.fieldId,
        focusCount,
        blurCount,
        dropRate,
        engagementLevel: focusCount > 50 ? 'High' : focusCount > 10 ? 'Medium' : 'Low',
      };
    }),
});
