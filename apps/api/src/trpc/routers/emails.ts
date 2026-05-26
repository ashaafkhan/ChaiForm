import { t } from '../index';
import { db } from '@chaiforms/db';
import { forms } from '@chaiforms/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, getRespondentEmailHtml, getCreatorEmailHtml } from '@chaiforms/email';
import {
  UpdateEmailSettingsSchema,
  SendTestEmailSchema,
} from '@chaiforms/schemas';
import { TRPCError } from '@trpc/server';

export const emailsRouter = t.router({
  // Get email settings for a form
  getSettings: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input({ formId: t._def.meta! as any })
    .query(async ({ input, ctx }) => {
      try {
        const form = await db.query.forms.findFirst({
          where: eq(forms.id, input.formId),
        });

        if (!form) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Form not found',
          });
        }

        if (form.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this form',
          });
        }

        const settings = form.settings as any || {};

        return {
          notifyCreator: settings.notifyCreator ?? true,
          notifyRespondent: settings.notifyRespondent ?? false,
          respondentEmailSubject: settings.respondentEmailSubject ?? 'Thank you for your response',
          respondentEmailBody: settings.respondentEmailBody ?? 'Thank you for submitting the form!',
          creatorEmailSubject: settings.creatorEmailSubject ?? 'New form response received',
          creatorEmailBody: settings.creatorEmailBody ?? 'You have received a new response to your form.',
          collectRespondentEmail: settings.collectRespondentEmail ?? false,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch email settings',
        });
      }
    }),

  // Update email settings for a form
  updateSettings: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input(UpdateEmailSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const form = await db.query.forms.findFirst({
          where: eq(forms.id, input.formId),
        });

        if (!form) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Form not found',
          });
        }

        if (form.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this form',
          });
        }

        const currentSettings = form.settings as any || {};
        const updatedSettings = {
          ...currentSettings,
          notifyCreator: input.notifyCreator ?? currentSettings.notifyCreator,
          notifyRespondent: input.notifyRespondent ?? currentSettings.notifyRespondent,
          respondentEmailSubject: input.respondentEmailSubject ?? currentSettings.respondentEmailSubject,
          respondentEmailBody: input.respondentEmailBody ?? currentSettings.respondentEmailBody,
          creatorEmailSubject: input.creatorEmailSubject ?? currentSettings.creatorEmailSubject,
          creatorEmailBody: input.creatorEmailBody ?? currentSettings.creatorEmailBody,
          collectRespondentEmail: input.collectRespondentEmail ?? currentSettings.collectRespondentEmail,
        };

        await db
          .update(forms)
          .set({ settings: updatedSettings })
          .where(eq(forms.id, input.formId));

        return {
          success: true,
          message: 'Email settings updated successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update email settings',
        });
      }
    }),

  // Send test email
  sendTestEmail: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input(SendTestEmailSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const form = await db.query.forms.findFirst({
          where: eq(forms.id, input.formId),
        });

        if (!form) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Form not found',
          });
        }

        if (form.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to send test emails for this form',
          });
        }

        const settings = form.settings as any || {};

        if (input.type === 'respondent') {
          const html = getRespondentEmailHtml({
            formTitle: form.title,
            message: settings.respondentEmailBody || 'Thank you for your response!',
          });

          await sendEmail({
            to: input.email,
            subject: settings.respondentEmailSubject || 'Thank you for your response',
            html,
          });
        } else {
          const html = getCreatorEmailHtml({
            formTitle: form.title,
            message: settings.creatorEmailBody || 'You have received a new response',
            responseCount: form.responseCount,
          });

          await sendEmail({
            to: input.email,
            subject: settings.creatorEmailSubject || 'New form response received',
            html,
          });
        }

        return {
          success: true,
          message: 'Test email sent successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send test email',
        });
      }
    }),

  // Get available email template tags/variables
  getSampleTags: t.procedure.query(() => {
    return [
      { tag: '{form_title}', description: 'Form title' },
      { tag: '{form_description}', description: 'Form description' },
      { tag: '{respondent_email}', description: 'Respondent email address' },
      { tag: '{respondent_name}', description: 'Respondent name' },
      { tag: '{response_count}', description: 'Total responses received' },
      { tag: '{submission_date}', description: 'Submission date and time' },
      { tag: '{form_link}', description: 'Link to the published form' },
      { tag: '{dashboard_link}', description: 'Link to dashboard' },
    ];
  }),

  // Send email on form submission (called from responses router)
  sendSubmissionEmails: t.procedure
    .input({
      formId: t._def.meta! as any,
      respondentEmail: t._def.meta! as any,
      respondentName: t._def.meta! as any,
      responseCount: t._def.meta! as any,
    })
    .mutation(async ({ input }) => {
      try {
        const form = await db.query.forms.findFirst({
          where: eq(forms.id, input.formId),
        });

        if (!form) return { success: false };

        const settings = form.settings as any || {};
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, form.userId),
        });

        if (!user) return { success: false };

        // Send respondent email
        if (settings.notifyRespondent && input.respondentEmail) {
          try {
            const html = getRespondentEmailHtml({
              formTitle: form.title,
              message: settings.respondentEmailBody || 'Thank you for your response!',
            });

            await sendEmail({
              to: input.respondentEmail,
              subject: settings.respondentEmailSubject || 'Thank you for your response',
              html,
            });
          } catch (err) {
            console.error('Failed to send respondent email:', err);
          }
        }

        // Send creator email
        if (settings.notifyCreator) {
          try {
            const html = getCreatorEmailHtml({
              formTitle: form.title,
              message: settings.creatorEmailBody || 'You have received a new response',
              responseCount: input.responseCount,
            });

            await sendEmail({
              to: user.email,
              subject: settings.creatorEmailSubject || 'New form response received',
              html,
            });
          } catch (err) {
            console.error('Failed to send creator email:', err);
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Failed to send submission emails:', error);
        return { success: false };
      }
    }),
});
