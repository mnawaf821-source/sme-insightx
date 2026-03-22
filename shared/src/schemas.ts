import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
});

// ─── Dashboard Schemas ─────────────────────────────────────────────────────

export const createDashboardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  layout: z.record(z.unknown()).optional(),
});

export const updateDashboardSchema = createDashboardSchema.partial();

export const createWidgetSchema = z.object({
  dashboardId: z.string().uuid(),
  type: z.enum(['chart', 'table', 'metric', 'text']),
  title: z.string().min(1).max(100),
  config: z.record(z.unknown()),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    w: z.number().int().min(1),
    h: z.number().int().min(1),
  }),
});

// ─── File Schemas ───────────────────────────────────────────────────────────

export const uploadFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.enum(['csv', 'xlsx', 'json', 'pdf']),
  size: z.number().int().positive().max(50 * 1024 * 1024, 'File must be under 50MB'),
});

// ─── HR / Job Posting Schemas ──────────────────────────────────────────────

export const createJobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  department: z.string().max(100).optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
  location: z.string().max(200).optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'open', 'closed']).default('draft'),
});

export const updateJobPostingSchema = createJobPostingSchema.partial();

export const createCandidateSchema = z.object({
  jobPostingId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  resumeUrl: z.string().url().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['new', 'screening', 'interview', 'offer', 'hired', 'rejected'])
    .default('new'),
});

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── AI Insights Schema ────────────────────────────────────────────────────

export const createAiInsightSchema = z.object({
  type: z.enum(['trend', 'anomaly', 'recommendation', 'summary']),
  source: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

// ─── Conversation Schemas ──────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1, 'Message cannot be empty').max(10000),
});

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200),
});
