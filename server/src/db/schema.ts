import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enumerations ──────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member']);
export const fileTypeEnum = pgEnum('file_type', ['csv', 'xlsx', 'json', 'pdf']);
export const widgetTypeEnum = pgEnum('widget_type', ['chart', 'table', 'metric', 'text']);
export const insightTypeEnum = pgEnum('insight_type', ['trend', 'anomaly', 'recommendation', 'summary']);
export const jobTypeEnum = pgEnum('job_type', ['full-time', 'part-time', 'contract', 'internship']);
export const jobStatusEnum = pgEnum('job_status', ['draft', 'open', 'closed']);
export const candidateStatusEnum = pgEnum('candidate_status', ['new', 'screening', 'interview', 'offer', 'hired', 'rejected']);

// ─── Organizations ──────────────────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('member').notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sessions ───────────────────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Files ──────────────────────────────────────────────────────────────────

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  uploadedById: uuid('uploaded_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  type: fileTypeEnum('type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Parsed Data ────────────────────────────────────────────────────────────

export const parsedData = pgTable('parsed_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id')
    .references(() => files.id, { onDelete: 'cascade' })
    .notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  columns: jsonb('columns').$type<Array<{ name: string; type: string }>>().notNull(),
  rowCount: integer('row_count').notNull(),
  sampleData: jsonb('sample_data').$type<Record<string, unknown>[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Dashboards ─────────────────────────────────────────────────────────────

export const dashboards = pgTable('dashboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  createdById: uuid('created_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  layout: jsonb('layout').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Dashboard Widgets ──────────────────────────────────────────────────────

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  dashboardId: uuid('dashboard_id')
    .references(() => dashboards.id, { onDelete: 'cascade' })
    .notNull(),
  type: widgetTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull(),
  position: jsonb('position').$type<{ x: number; y: number; w: number; h: number }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── AI Insights ────────────────────────────────────────────────────────────

export const aiInsights = pgTable('ai_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  type: insightTypeEnum('type').notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Job Postings ───────────────────────────────────────────────────────────

export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  createdById: uuid('created_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  department: varchar('department', { length: 100 }),
  description: text('description').notNull(),
  requirements: text('requirements'),
  location: varchar('location', { length: 255 }),
  type: jobTypeEnum('type').notNull(),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  status: jobStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Candidates ─────────────────────────────────────────────────────────────

export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  jobPostingId: uuid('job_posting_id')
    .references(() => jobPostings.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  resumeUrl: text('resume_url'),
  notes: text('notes'),
  status: candidateStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Candidate History ──────────────────────────────────────────────────────

export const candidateHistory = pgTable('candidate_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id')
    .references(() => candidates.id, { onDelete: 'cascade' })
    .notNull(),
  changedById: uuid('changed_by_id')
    .references(() => users.id, { onDelete: 'set null' }),
  fromStatus: candidateStatusEnum('from_status'),
  toStatus: candidateStatusEnum('to_status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Conversations ──────────────────────────────────────────────────────────

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Messages ───────────────────────────────────────────────────────────────

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
