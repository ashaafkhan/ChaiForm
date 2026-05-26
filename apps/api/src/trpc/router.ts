import { router } from './init';
import { authRouter } from './routers/auth';
import { formsRouter } from './routers/forms';
import { fieldsRouter } from './routers/fields';
import { responsesRouter } from './routers/responses';
import { analyticsRouter } from './routers/analytics';
import { themesRouter } from './routers/themes';

export const appRouter = router({
  auth: authRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  themes: themesRouter,
});

export type AppRouter = typeof appRouter;
