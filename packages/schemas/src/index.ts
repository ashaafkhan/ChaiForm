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

export type CreateForm = z.infer<typeof CreateFormSchema>;
export type UpdateForm = z.infer<typeof UpdateFormSchema>;
export type CreateField = z.infer<typeof CreateFieldSchema>;
export type SubmitResponse = z.infer<typeof SubmitResponseSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type Login = z.infer<typeof LoginSchema>;
