import { z } from 'zod';

export const CreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(2000).optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  themeId: z.string().uuid().optional(),
  visibility: z.enum(['public', 'unlisted']).default('unlisted'),
});

export const UpdateFormSchema = CreateFormSchema.partial().extend({
  formId: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  settings: z.object({
    submitButtonText: z.string().default('Submit'),
    successMessage: z.string().default('Thank you for your response!'),
    redirectUrl: z.string().url().optional().nullable(),
    allowMultipleResponses: z.boolean().default(true),
    requireLogin: z.boolean().default(false),
    showProgressBar: z.boolean().default(true),
    shuffleFields: z.boolean().default(false),
    isMultiPage: z.boolean().default(false),
    notifyCreator: z.boolean().default(true),
    notifyRespondent: z.boolean().default(false),
    collectEmailOfRespondent: z.boolean().default(false),
  }).optional(),
  password: z.string().min(4).max(100).optional().nullable(),
  maxResponses: z.number().int().positive().optional().nullable(),
  expiresAt: z.date().optional().nullable(),
});

export const PublishFormSchema = z.object({
  formId: z.string().uuid(),
  visibility: z.enum(['public', 'unlisted']),
});

export const FieldValidationSchema = z.object({
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional(),
  maxRating: z.number().int().min(3).max(10).optional(),
  minSelections: z.number().int().positive().optional(),
  maxSelections: z.number().int().positive().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().positive().optional(),
});

export const FieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  value: z.string(),
});

export const ConditionSchema = z.object({
  fieldId: z.string().uuid(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
  value: z.string(),
});

export const ConditionalLogicSchema = z.object({
  enabled: z.boolean(),
  action: z.enum(['show', 'hide', 'jump', 'require']),
  targetFieldId: z.string().uuid().optional(),
  conditions: z.array(ConditionSchema),
  logicOperator: z.enum(['AND', 'OR']).default('AND'),
});

export const CreateFieldSchema = z.object({
  formId: z.string().uuid(),
  type: z.enum([
    'short_text', 'long_text', 'email', 'url', 'phone',
    'number', 'rating', 'scale',
    'single_select', 'multi_select', 'dropdown', 'checkbox', 'yes_no',
    'date', 'time', 'date_range',
    'file_upload', 'signature', 'matrix', 'ranking', 'statement', 'section_break',
  ]),
  label: z.string().min(1).max(1000),
  description: z.string().max(2000).optional(),
  placeholder: z.string().max(500).optional(),
  order: z.number().int().nonnegative(),
  page: z.number().int().positive().default(1),
  isRequired: z.boolean().default(false),
  validation: FieldValidationSchema.optional(),
  options: z.array(FieldOptionSchema).optional(),
  conditionalLogic: ConditionalLogicSchema.optional(),
});

export const UpdateFieldSchema = CreateFieldSchema.partial().extend({
  fieldId: z.string().uuid(),
});

export const ReorderFieldsSchema = z.object({
  formId: z.string().uuid(),
  fieldOrders: z.array(z.object({
    fieldId: z.string().uuid(),
    order: z.number().int().nonnegative(),
    page: z.number().int().positive().optional(),
  })),
});

export const SubmitResponseSchema = z.object({
  formId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ])),
  respondentEmail: z.string().email().optional(),
  formPassword: z.string().optional(),
  completionTimeSeconds: z.number().int().nonnegative().optional(),
  sessionId: z.string().optional(),
});

// Auth schemas
export const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Theme schemas
export const ThemeConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#10b981'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#f59e0b'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1f2937'),
  borderColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#e5e7eb'),
  fontFamily: z.enum(['sans', 'serif', 'mono']).default('sans'),
  fontSize: z.enum(['sm', 'base', 'lg']).default('base'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
  spacing: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
  buttonStyle: z.enum(['solid', 'outline', 'ghost']).default('solid'),
});

export const CreateThemeSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  config: ThemeConfigSchema,
  isBuiltIn: z.boolean().default(false).optional(),
});

export const UpdateThemeSchema = CreateThemeSchema.partial().extend({
  themeId: z.string().uuid(),
});

export const ApplyThemeSchema = z.object({
  formId: z.string().uuid(),
  themeId: z.string().uuid().optional(),
  customTheme: ThemeConfigSchema.optional(),
});

export const GetThemesSchema = z.object({
  category: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Email schemas
export const EmailSettingsSchema = z.object({
  notifyCreator: z.boolean().default(true),
  notifyRespondent: z.boolean().default(false),
  respondentEmailSubject: z.string().max(255).default('Thank you for your response'),
  respondentEmailBody: z.string().max(5000).default('Thank you for submitting the form!'),
  creatorEmailSubject: z.string().max(255).default('New form response received'),
  creatorEmailBody: z.string().max(5000).default('You have received a new response to your form.'),
  collectRespondentEmail: z.boolean().default(false),
});

export const UpdateEmailSettingsSchema = z.object({
  formId: z.string().uuid(),
  notifyCreator: z.boolean().optional(),
  notifyRespondent: z.boolean().optional(),
  respondentEmailSubject: z.string().max(255).optional(),
  respondentEmailBody: z.string().max(5000).optional(),
  creatorEmailSubject: z.string().max(255).optional(),
  creatorEmailBody: z.string().max(5000).optional(),
  collectRespondentEmail: z.boolean().optional(),
});

export const SendTestEmailSchema = z.object({
  formId: z.string().uuid(),
  email: z.string().email(),
  type: z.enum(['respondent', 'creator']),
});

export const EmailTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  subject: z.string().max(255),
  body: z.string().max(5000),
  type: z.enum(['respondent', 'creator', 'welcome']),
  tags: z.array(z.string()).optional(),
});

export type EmailSettings = z.infer<typeof EmailSettingsSchema>;
export type UpdateEmailSettings = z.infer<typeof UpdateEmailSettingsSchema>;
export type SendTestEmail = z.infer<typeof SendTestEmailSchema>;
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

// OAuth Schemas
export const InitiateOAuthSchema = z.object({
  provider: z.enum(['google', 'github']),
  redirectUrl: z.string().url(),
});

export const OAuthCallbackSchema = z.object({
  provider: z.enum(['google', 'github']),
  code: z.string(),
  state: z.string(),
});

export const LinkSocialAccountSchema = z.object({
  provider: z.enum(['google', 'github']),
  providerAccountId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
});

// 2FA Schemas
export const GenerateTwoFactorSecretSchema = z.object({
  userId: z.string().uuid(),
});

export const VerifyTwoFactorSetupSchema = z.object({
  userId: z.string().uuid(),
  secret: z.string(),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const VerifyTwoFactorCodeSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const DisableTwoFactorSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const TwoFactorSessionSchema = z.object({
  userId: z.string().uuid(),
  expiresAt: z.date(),
});

export type InitiateOAuth = z.infer<typeof InitiateOAuthSchema>;
export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;
export type LinkSocialAccount = z.infer<typeof LinkSocialAccountSchema>;
export type GenerateTwoFactorSecret = z.infer<typeof GenerateTwoFactorSecretSchema>;
export type VerifyTwoFactorSetup = z.infer<typeof VerifyTwoFactorSetupSchema>;
export type VerifyTwoFactorCode = z.infer<typeof VerifyTwoFactorCodeSchema>;
export type DisableTwoFactor = z.infer<typeof DisableTwoFactorSchema>;
export type TwoFactorSession = z.infer<typeof TwoFactorSessionSchema>;

export type CreateForm = z.infer<typeof CreateFormSchema>;
export type UpdateForm = z.infer<typeof UpdateFormSchema>;
export type CreateField = z.infer<typeof CreateFieldSchema>;
export type SubmitResponse = z.infer<typeof SubmitResponseSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type CreateTheme = z.infer<typeof CreateThemeSchema>;
export type UpdateTheme = z.infer<typeof UpdateThemeSchema>;
export type ApplyTheme = z.infer<typeof ApplyThemeSchema>;
