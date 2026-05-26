import { pgTable, text, timestamp, boolean, varchar, uuid, integer, jsonb, pgEnum, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const formVisibilityEnum = pgEnum('form_visibility', ['public', 'unlisted']);
export const formStatusEnum = pgEnum('form_status', ['draft', 'published', 'archived']);

export const fieldTypeEnum = pgEnum('field_type', [
  'short_text',
  'long_text',
  'email',
  'url',
  'phone',
  'number',
  'rating',
  'scale',
  'single_select',
  'multi_select',
  'dropdown',
  'checkbox',
  'yes_no',
  'date',
  'time',
  'date_range',
  'file_upload',
  'signature',
  'matrix',
  'ranking',
  'statement',
  'section_break',
]);

export const analyticsEventEnum = pgEnum('analytics_event_type', [
  'form_view',
  'form_start',
  'field_focus',
  'field_blur',
  'page_change',
  'form_submit',
  'form_abandon',
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  emailVerifiedAt: timestamp('email_verified_at'),
  plan: varchar('plan', { length: 50 }).default('free').notNull(),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  status: formStatusEnum('status').default('draft').notNull(),
  visibility: formVisibilityEnum('visibility').default('unlisted').notNull(),
  publishedAt: timestamp('published_at'),
  themeId: uuid('theme_id').references(() => themes.id),
  customTheme: jsonb('custom_theme'),
  settings: jsonb('settings').default({
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your response!',
    redirectUrl: null,
    allowMultipleResponses: true,
    requireLogin: false,
    showProgressBar: true,
    shuffleFields: false,
    isMultiPage: false,
    notifyCreator: true,
    notifyRespondent: false,
    collectEmailOfRespondent: false,
  }),
  password: text('password'),
  maxResponses: integer('max_responses'),
  expiresAt: timestamp('expires_at'),
  isTemplate: boolean('is_template').default(false),
  templateCategory: varchar('template_category', { length: 100 }),
  responseCount: integer('response_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const fields = pgTable('fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  type: fieldTypeEnum('type').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  placeholder: text('placeholder'),
  order: integer('order').notNull(),
  page: integer('page').default(1).notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  validation: jsonb('validation').default({}),
  options: jsonb('options').default([]),
  conditionalLogic: jsonb('conditional_logic'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  respondentEmail: varchar('respondent_email', { length: 255 }),
  answers: jsonb('answers').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  isComplete: boolean('is_complete').default(true).notNull(),
  completionTimeSeconds: integer('completion_time_seconds'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  isBuiltIn: boolean('is_built_in').default(false),
  previewUrl: text('preview_url'),
  config: jsonb('config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  eventType: analyticsEventEnum('event_type').notNull(),
  fieldId: uuid('field_id'),
  metadata: jsonb('metadata').default({}),
  sessionId: varchar('session_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  forms: many(forms),
  socialAccounts: many(socialAccounts),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, { fields: [socialAccounts.userId], references: [users.id] }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, { fields: [forms.userId], references: [users.id] }),
  theme: one(themes, { fields: [forms.themeId], references: [themes.id] }),
  fields: many(fields),
  responses: many(responses),
  analyticsEvents: many(analyticsEvents),
}));

export const fieldsRelations = relations(fields, ({ one }) => ({
  form: one(forms, { fields: [fields.formId], references: [forms.id] }),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  form: one(forms, { fields: [responses.formId], references: [forms.id] }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  form: one(forms, { fields: [analyticsEvents.formId], references: [forms.id] }),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  forms: many(forms),
}));
