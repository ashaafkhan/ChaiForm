import { t } from '../index';
import { db } from '@chaiforms/db';
import { themes, forms } from '@chaiforms/db/schema';
import { eq, and, like } from 'drizzle-orm';
import {
  CreateThemeSchema,
  UpdateThemeSchema,
  ApplyThemeSchema,
  GetThemesSchema,
} from '@chaiforms/schemas';
import { TRPCError } from '@trpc/server';

export const themesRouter = t.router({
  // Get all themes with filtering
  list: t.procedure.input(GetThemesSchema).query(async ({ input }) => {
    try {
      let query = db.select().from(themes);

      if (input.category) {
        query = query.where(like(themes.category, `%${input.category}%`));
      }

      const allThemes = await query.limit(input.limit).offset(input.offset);
      return allThemes;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch themes',
      });
    }
  }),

  // Get a single theme by ID
  getById: t.procedure.input({ themeId: t._def.meta! as any }).query(async ({ input }) => {
    try {
      const theme = await db.query.themes.findFirst({
        where: eq(themes.id, input.themeId),
      });

      if (!theme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        });
      }

      return theme;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch theme',
      });
    }
  }),

  // Get theme by slug
  getBySlug: t.procedure
    .input({ slug: t._def.meta! as any })
    .query(async ({ input }) => {
      try {
        const theme = await db.query.themes.findFirst({
          where: eq(themes.slug, input.slug),
        });

        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Theme not found',
          });
        }

        return theme;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch theme',
        });
      }
    }),

  // Create a new theme (admin only)
  create: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input(CreateThemeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if slug already exists
        const existingTheme = await db.query.themes.findFirst({
          where: eq(themes.slug, input.slug),
        });

        if (existingTheme) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Theme slug already exists',
          });
        }

        const newTheme = await db.insert(themes).values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          category: input.category,
          isBuiltIn: input.isBuiltIn || false,
          config: input.config,
        });

        return {
          success: true,
          message: 'Theme created successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create theme',
        });
      }
    }),

  // Update a theme (admin only)
  update: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input(UpdateThemeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const theme = await db.query.themes.findFirst({
          where: eq(themes.id, input.themeId),
        });

        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Theme not found',
          });
        }

        // Check if new slug already exists (if slug is being changed)
        if (input.slug && input.slug !== theme.slug) {
          const existingTheme = await db.query.themes.findFirst({
            where: eq(themes.slug, input.slug),
          });

          if (existingTheme) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Theme slug already exists',
            });
          }
        }

        await db
          .update(themes)
          .set({
            name: input.name || theme.name,
            slug: input.slug || theme.slug,
            description: input.description || theme.description,
            category: input.category || theme.category,
            config: input.config || theme.config,
          })
          .where(eq(themes.id, input.themeId));

        return {
          success: true,
          message: 'Theme updated successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update theme',
        });
      }
    }),

  // Delete a theme (admin only)
  delete: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input({ themeId: t._def.meta! as any })
    .mutation(async ({ input, ctx }) => {
      try {
        const theme = await db.query.themes.findFirst({
          where: eq(themes.id, input.themeId),
        });

        if (!theme) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Theme not found',
          });
        }

        if (theme.isBuiltIn) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot delete built-in themes',
          });
        }

        await db.delete(themes).where(eq(themes.id, input.themeId));

        return {
          success: true,
          message: 'Theme deleted successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete theme',
        });
      }
    }),

  // Apply theme to a form
  applyToForm: t.procedure
    .use(async (opts) => {
      if (!opts.ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        });
      }
      return opts.next();
    })
    .input(ApplyThemeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if form exists and belongs to user
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

        // If themeId provided, verify theme exists
        if (input.themeId) {
          const theme = await db.query.themes.findFirst({
            where: eq(themes.id, input.themeId),
          });

          if (!theme) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Theme not found',
            });
          }
        }

        await db
          .update(forms)
          .set({
            themeId: input.themeId || null,
            customTheme: input.customTheme || null,
          })
          .where(eq(forms.id, input.formId));

        return {
          success: true,
          message: 'Theme applied successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to apply theme',
        });
      }
    }),

  // Get theme for a form
  getFormTheme: t.procedure
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

        let theme = null;
        if (form.themeId) {
          theme = await db.query.themes.findFirst({
            where: eq(themes.id, form.themeId),
          });
        }

        return {
          form: {
            id: form.id,
            themeId: form.themeId,
            customTheme: form.customTheme,
          },
          theme,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch form theme',
        });
      }
    }),
});
