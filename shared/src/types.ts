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
  analyzeFileSchema,
  naturalLanguageQuerySchema,
  generateInsightsSchema,
  chatMessageSchema,
  chartSuggestSchema,
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

export interface FileResponse {
  id: string;
  organizationId: string;
  uploadedById: string | null;
  name: string;
  originalName: string;
  type: FileType;
  size: number;
  url: string;
  createdAt: string;
}

export interface ParsedDataResponse {
  id: string;
  fileId: string;
  organizationId: string;
  columns: Array<{ name: string; type: string }>;
  rowCount: number;
  sampleData: Record<string, unknown>[];
  createdAt: string;
}

// ─── HR Types ───────────────────────────────────────────────────────────────

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

// ─── AI Insight Types ───────────────────────────────────────────────────────

export type CreateAiInsightInput = z.infer<typeof createAiInsightSchema>;

// ─── AI Analysis Types ──────────────────────────────────────────────────────

export type AnalyzeFileInput = z.infer<typeof analyzeFileSchema>;
export type NaturalLanguageQueryInput = z.infer<typeof naturalLanguageQuerySchema>;
export type GenerateInsightsInput = z.infer<typeof generateInsightsSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChartSuggestInput = z.infer<typeof chartSuggestSchema>;

export interface AiInsight {
  id: string;
  organizationId: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  source: string;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AiAnalysisResult {
  summary: string;
  patterns: string[];
  suggestedCharts: Array<{
    type: 'line' | 'bar' | 'pie' | 'kpi';
    title: string;
    xColumn?: string;
    yColumn?: string;
    reason: string;
  }>;
  keyMetrics: Array<{
    name: string;
    value: number | string;
    description: string;
  }>;
}

export interface AiQueryResult {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'table';
  xColumn: string;
  yColumn: string;
  title: string;
  reasoning: string;
  filteredRows?: Record<string, unknown>[];
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

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
