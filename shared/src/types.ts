import type { z } from 'zod';
import type {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  createDashboardSchema,
  updateDashboardSchema,
  createWidgetSchema,
  uploadFileSchema,
  createJobPostingSchema,
  updateJobPostingSchema,
  createCandidateSchema,
  updateCandidateSchema,
  createAiInsightSchema,
  sendMessageSchema,
  createConversationSchema,
} from './schemas.js';

// ─── Auth Types ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Dashboard Types ────────────────────────────────────────────────────────

export type CreateDashboardInput = z.infer<typeof createDashboardSchema>;
export type UpdateDashboardInput = z.infer<typeof updateDashboardSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;

// ─── File Types ─────────────────────────────────────────────────────────────

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

// ─── HR Types ───────────────────────────────────────────────────────────────

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

// ─── AI Insight Types ───────────────────────────────────────────────────────

export type CreateAiInsightInput = z.infer<typeof createAiInsightSchema>;

// ─── Conversation Types ─────────────────────────────────────────────────────

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member';
export type FileType = 'csv' | 'xlsx' | 'json' | 'pdf';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'open' | 'closed';
export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';
export type InsightType = 'trend' | 'anomaly' | 'recommendation' | 'summary';
export type WidgetType = 'chart' | 'table' | 'metric' | 'text';
