import { router } from './init';
import { authRouter } from './routers/auth';
import { formsRouter } from './routers/forms';
import { fieldsRouter } from './routers/fields';
import { responsesRouter } from './routers/responses';
import { analyticsRouter } from './routers/analytics';
import { analyticsAdvancedRouter } from './routers/analytics-advanced';
import { themesRouter } from './routers/themes';
import { emailsRouter } from './routers/emails';
import { oauthRouter } from './routers/oauth';
import { twoFactorRouter } from './routers/twofa';

export const appRouter = router({
  auth: authRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  analyticsAdvanced: analyticsAdvancedRouter,
  themes: themesRouter,
  emails: emailsRouter,
  oauth: oauthRouter,
  twoFactor: twoFactorRouter,
});

export type AppRouter = typeof appRouter;
