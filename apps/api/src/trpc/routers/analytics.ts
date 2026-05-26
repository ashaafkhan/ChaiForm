import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../init';
import { analyticsEvents, forms, responses } from '@chaiforms/db';
import { eq, and, gte, lte, count } from 'drizzle-orm';

export const analyticsRouter = router({
  trackEvent: publicProcedure
    .input(z.object({
      formId: z.string().uuid(),
      eventType: z.enum(['form_view', 'form_start', 'field_focus', 'field_blur', 'page_change', 'form_submit', 'form_abandon']),
      fieldId: z.string().uuid().optional(),
      metadata: z.record(z.unknown()).optional(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify form exists
      const form = await db.query.forms.findFirst({
        where: eq(forms.id, input.formId),
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Create event
      await db.insert(analyticsEvents).values({
        formId: input.formId,
        eventType: input.eventType,
        fieldId: input.fieldId,
        metadata: input.metadata || {},
        sessionId: input.sessionId,
      });

      // Update form view count for form_view events
      if (input.eventType === 'form_view') {
        await db
          .update(forms)
          .set({
            viewCount: (form.viewCount || 0) + 1,
          })
          .where(eq(forms.id, input.formId));
      }

      return { success: true };
    }),

  getSummary: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      dateRange: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (input.dateRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (input.dateRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (input.dateRange === '90d') startDate.setDate(now.getDate() - 90);
      else startDate = new Date('2000-01-01');

      // Get events
      const totalViewsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_view'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      const totalStartsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_start'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      const formResponsesResult = await db
        .select({ count: count() })
        .from(responses)
        .where(
          and(
            eq(responses.formId, input.formId),
            eq(responses.isComplete, true),
            gte(responses.submittedAt, startDate)
          )
        );

      const totalViews = totalViewsResult[0].count || 0;
      const totalStarts = totalStartsResult[0].count || 0;
      const totalCompletions = formResponsesResult[0].count || 0;

      return {
        totalViews,
        totalStarts,
        totalCompletions,
        completionRate: totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0,
        abandonRate: totalStarts > 0 ? Math.round(((totalStarts - totalCompletions) / totalStarts) * 100) : 0,
      };
    }),

  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, userId } = ctx;

      // Get user's forms
      const userForms = await db.query.forms.findMany({
        where: eq(forms.userId, userId!),
      });

      const formIds = userForms.map(f => f.id);
      const totalForms = userForms.length;
      const totalResponses = userForms.reduce((sum, form) => sum + (form.responseCount || 0), 0);
      const totalViews = userForms.reduce((sum, form) => sum + (form.viewCount || 0), 0);

      return {
        totalForms,
        totalResponses,
        totalViews,
        publishedForms: userForms.filter(f => f.status === 'published').length,
        draftForms: userForms.filter(f => f.status === 'draft').length,
      };
    }),

  getFieldAnalytics: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      fieldId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      // Verify form ownership
      const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, input.formId), eq(forms.userId, userId!)),
      });

      if (!form) {
        throw new Error('Form not found or you do not have access');
      }

      // Get field events
      const focusEvents = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.fieldId, input.fieldId),
            eq(analyticsEvents.eventType, 'field_focus')
          )
        );

      const blurEvents = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.fieldId, input.fieldId),
            eq(analyticsEvents.eventType, 'field_blur')
          )
        );

      return {
        fieldId: input.fieldId,
        focusCount: focusEvents[0].count || 0,
        blurCount: blurEvents[0].count || 0,
        engagementRate: (focusEvents[0].count || 0) > 0 ? 'High' : 'Low',
      };
    }),
});
