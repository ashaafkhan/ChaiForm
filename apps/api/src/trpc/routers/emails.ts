import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import { db } from '@chaiforms/db';
import { forms } from '@chaiforms/db';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const emailsRouter = router({
  getSettings: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const form = await db.query.forms.findFirst({ where: eq(forms.id, input.formId) });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
      if (form.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      const settings = (form.settings as any) || {};
      return {
        notifyCreator: settings.notifyCreator ?? true,
        notifyRespondent: settings.notifyRespondent ?? false,
        respondentEmailSubject: settings.respondentEmailSubject ?? 'Thank you for your response',
        respondentEmailBody: settings.respondentEmailBody ?? 'Thank you for submitting the form!',
        creatorEmailSubject: settings.creatorEmailSubject ?? 'New form response received',
        creatorEmailBody: settings.creatorEmailBody ?? 'You have received a new response.',
        collectRespondentEmail: settings.collectRespondentEmail ?? false,
      };
    }),

  updateSettings: protectedProcedure
    .input(z.object({
      formId: z.string().uuid(),
      notifyCreator: z.boolean().optional(),
      notifyRespondent: z.boolean().optional(),
      respondentEmailSubject: z.string().optional(),
      respondentEmailBody: z.string().optional(),
      creatorEmailSubject: z.string().optional(),
      creatorEmailBody: z.string().optional(),
      collectRespondentEmail: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const form = await db.query.forms.findFirst({ where: eq(forms.id, input.formId) });
      if (!form) throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
      if (form.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      const { formId, ...updates } = input;
      const currentSettings = (form.settings as any) || {};
      await db.update(forms).set({ settings: { ...currentSettings, ...updates } }).where(eq(forms.id, formId));
      return { success: true };
    }),

  getSampleTags: protectedProcedure.query(() => {
    return [
      { tag: '{form_title}', description: 'Form title' },
      { tag: '{respondent_email}', description: 'Respondent email' },
      { tag: '{response_count}', description: 'Total responses' },
      { tag: '{submission_date}', description: 'Submission date' },
    ];
  }),
});
