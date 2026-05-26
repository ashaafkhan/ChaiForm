import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { analyticsEvents, responses, forms, fields } from '@chaiforms/db';
import { eq, and, gte, count } from 'drizzle-orm';

export const analyticsAdvancedRouter = router({
  getResponseTimeline: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      days: z.number().int().positive().default(30),
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

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Get all responses in date range
      const allResponses = await db.query.responses.findMany({
        where: and(
          eq(responses.formId, input.formId),
          gte(responses.submittedAt, startDate)
        ),
      });

      // Group by date
      const timelineMap = new Map<string, number>();
      for (let i = input.days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        timelineMap.set(dateStr, 0);
      }

      // Count responses per day
      allResponses.forEach((response) => {
        if (response.submittedAt) {
          const dateStr = response.submittedAt.toISOString().split('T')[0];
          timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
        }
      });

      // Convert to array
      const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
        date,
        responses: count,
      }));

      return timeline;
    }),

  getConversionFunnel: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      days: z.number().int().positive().default(30),
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

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Get funnel metrics
      const views = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_view'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      const starts = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_start'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      const submissions = await db
        .select({ count: count() })
        .from(responses)
        .where(
          and(
            eq(responses.formId, input.formId),
            eq(responses.isComplete, true),
            gte(responses.submittedAt, startDate)
          )
        );

      const viewCount = views[0]?.count || 0;
      const startCount = starts[0]?.count || 0;
      const submissionCount = submissions[0]?.count || 0;

      return {
        funnel: [
          { stage: 'Views', count: viewCount, percentage: 100 },
          {
            stage: 'Starts',
            count: startCount,
            percentage: viewCount > 0 ? Math.round((startCount / viewCount) * 100) : 0,
          },
          {
            stage: 'Submissions',
            count: submissionCount,
            percentage: startCount > 0 ? Math.round((submissionCount / startCount) * 100) : 0,
          },
        ],
        conversionRate: viewCount > 0 ? Math.round((submissionCount / viewCount) * 100) : 0,
      };
    }),

  getFieldEngagement: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
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

      // Get form fields
      const formFields = await db.query.fields.findMany({
        where: eq(fields.formId, input.formId),
      });

      // Get engagement for each field
      const engagement = await Promise.all(
        formFields.map(async (field) => {
          const focuses = await db
            .select({ count: count() })
            .from(analyticsEvents)
            .where(
              and(
                eq(analyticsEvents.fieldId, field.id),
                eq(analyticsEvents.eventType, 'field_focus')
              )
            );

          const blurs = await db
            .select({ count: count() })
            .from(analyticsEvents)
            .where(
              and(
                eq(analyticsEvents.fieldId, field.id),
                eq(analyticsEvents.eventType, 'field_blur')
              )
            );

          return {
            fieldId: field.id,
            fieldLabel: field.label,
            focusCount: focuses[0]?.count || 0,
            blurCount: blurs[0]?.count || 0,
            engagementScore: Math.max(focuses[0]?.count || 0, blurs[0]?.count || 0),
          };
        })
      );

      return engagement.sort((a, b) => b.engagementScore - a.engagementScore);
    }),

  getResponseMetrics: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
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

      // Get all responses
      const allResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
      });

      const totalResponses = allResponses.length;
      const completeResponses = allResponses.filter((r) => r.isComplete).length;
      const incompleteResponses = totalResponses - completeResponses;

      // Calculate completion rate
      const completionRate = totalResponses > 0 ? Math.round((completeResponses / totalResponses) * 100) : 0;

      // Calculate average time if timestamps exist
      const responseTimes: number[] = allResponses
        .filter((r) => r.submittedAt && r.createdAt)
        .map((r) => {
          const start = r.createdAt?.getTime() || 0;
          const end = r.submittedAt?.getTime() || 0;
          return end - start;
        });

      const averageTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000)
        : 0;

      return {
        totalResponses,
        completeResponses,
        incompleteResponses,
        completionRate,
        averageTimeSeconds: averageTime,
      };
    }),

  getResponseDistribution: protectedProcedure
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

      // Get all responses for this form
      const allResponses = await db.query.responses.findMany({
        where: eq(responses.formId, input.formId),
      });

      // Parse answer data
      const distribution = new Map<string, number>();
      allResponses.forEach((response) => {
        if (response.answers) {
          const answers = typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers;
          const answer = answers[input.fieldId];
          if (answer) {
            const key = String(answer);
            distribution.set(key, (distribution.get(key) || 0) + 1);
          }
        }
      });

      return Array.from(distribution.entries()).map(([answer, count]) => ({
        answer,
        count,
        percentage: allResponses.length > 0 ? Math.round((count / allResponses.length) * 100) : 0,
      }));
    }),

  getAbandonmentAnalysis: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      days: z.number().int().positive().default(30),
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

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      // Get form starts
      const starts = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_start'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      // Get form abandons
      const abandons = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.formId, input.formId),
            eq(analyticsEvents.eventType, 'form_abandon'),
            gte(analyticsEvents.createdAt, startDate)
          )
        );

      // Get completions
      const completions = await db
        .select({ count: count() })
        .from(responses)
        .where(
          and(
            eq(responses.formId, input.formId),
            eq(responses.isComplete, true),
            gte(responses.submittedAt, startDate)
          )
        );

      const startCount = starts[0]?.count || 0;
      const abandonCount = abandons[0]?.count || 0;
      const completionCount = completions[0]?.count || 0;

      return {
        totalStarts: startCount,
        completions: completionCount,
        abandonments: abandonCount,
        inProgress: startCount - completionCount - abandonCount,
        abandonmentRate: startCount > 0 ? Math.round((abandonCount / startCount) * 100) : 0,
        completionRate: startCount > 0 ? Math.round((completionCount / startCount) * 100) : 0,
      };
    }),
});
