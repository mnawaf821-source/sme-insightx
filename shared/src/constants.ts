// ─── API URLs ───────────────────────────────────────────────────────────────

export const API_BASE = '/api';

export const API_ROUTES = {
  // Auth
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_LOGOUT: `${API_BASE}/auth/logout`,
  AUTH_ME: `${API_BASE}/auth/me`,

  // Dashboards
  DASHBOARDS: `${API_BASE}/dashboards`,
  DASHBOARD_BY_ID: (id: string) => `${API_BASE}/dashboards/${id}`,

  // Files
  FILES: `${API_BASE}/files`,
  FILE_BY_ID: (id: string) => `${API_BASE}/files/${id}`,

  // HR
  JOB_POSTINGS: `${API_BASE}/hr/job-postings`,
  JOB_POSTING_BY_ID: (id: string) => `${API_BASE}/hr/job-postings/${id}`,
  CANDIDATES: `${API_BASE}/hr/candidates`,
  CANDIDATE_BY_ID: (id: string) => `${API_BASE}/hr/candidates/${id}`,

  // AI
  AI_ANALYZE: `${API_BASE}/ai/analyze`,
  AI_QUERY: `${API_BASE}/ai/query`,
  AI_INSIGHTS: `${API_BASE}/ai/insights`,
  AI_INSIGHTS_GENERATE: `${API_BASE}/ai/insights/generate`,
  AI_CHAT: `${API_BASE}/ai/chat`,
  AI_CONVERSATIONS: `${API_BASE}/ai/conversations`,
  AI_CONVERSATION_BY_ID: (id: string) => `${API_BASE}/ai/conversations/${id}`,
  AI_CHART_SUGGEST: `${API_BASE}/ai/chart-suggest`,

  // Conversations
  CONVERSATIONS: `${API_BASE}/conversations`,
  CONVERSATION_BY_ID: (id: string) => `${API_BASE}/conversations/${id}`,
  CONVERSATION_MESSAGES: (id: string) =>
    `${API_BASE}/conversations/${id}/messages`,
} as const;

// ─── Roles ──────────────────────────────────────────────────────────────────

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

// ─── Pagination ─────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ─── File ───────────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = ['csv', 'xlsx', 'json', 'pdf'] as const;

// ─── Token ──────────────────────────────────────────────────────────────────

export const TOKEN_KEY = 'sme_insightx_token';
export const USER_KEY = 'sme_insightx_user';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  ME: ['auth', 'me'],
  DASHBOARDS: ['dashboards'],
  DASHBOARD: (id: string) => ['dashboards', id],
  FILES: ['files'],
  JOB_POSTINGS: ['hr', 'job-postings'],
  CANDIDATES: ['hr', 'candidates'],
  AI_INSIGHTS: ['ai', 'insights'],
  AI_CONVERSATIONS: ['ai', 'conversations'],
  AI_CONVERSATION: (id: string) => ['ai', 'conversations', id],
  CONVERSATIONS: ['conversations'],
  CONVERSATION_MESSAGES: (id: string) => ['conversations', id, 'messages'],
} as const;
