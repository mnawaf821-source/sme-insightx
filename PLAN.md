# SME InsightX — Product Build Plan

> A real product for Small & Medium Enterprises: Business Intelligence + AI-Powered HR Assistant

---

## 1. Product Vision

**What it is:** A SaaS platform that gives SMEs enterprise-grade data analytics and recruitment tools — powered by AI, priced for small teams.

**Core value proposition:** One platform replaces 3-4 separate tools (analytics, HR screening, file analysis, reporting) at a fraction of the cost.

**Target users:** Small business owners, operations managers, HR teams at companies with 10-200 employees.

---

## 2. Feature Modules

### Module 1: Authentication & User Management
- Email/password registration & login
- OAuth (Google, GitHub) social login
- Email verification
- Password reset flow
- User profile management
- Organization/workspace concept (multi-tenant)
- Role-based access: Owner, Admin, Member

### Module 2: Business Analytics Dashboard
- **Data Upload**: Accept CSV, Excel (.xlsx/.xls), JSON, PDF files
- **AI File Parser**: Auto-detect file type, extract structured data, identify columns
- **Auto-Visualization**: AI suggests best chart types based on data
- **Custom Dashboards**: Drag-and-drop widget builder
- **KPI Tracking**: Revenue, expenses, profit, customer metrics
- **AI Insights**: Trend detection, anomaly alerts, predictive forecasts
- **Scheduled Reports**: Email reports on a schedule
- **Data Export**: PDF, CSV, Excel export

### Module 3: HR Assistant & Recruitment
- **CV/Resume Upload**: PDF, DOCX parsing with AI
- **AI Candidate Screening**: NLP-based skill extraction and matching
- **Job Posting Management**: Create job descriptions, define requirements
- **Candidate Ranking**: Weighted scoring based on skills, experience, education
- **Recruitment Pipeline**: Kanban board (Applied → Screening → Interview → Offer → Hired)
- **Interview Scheduling**: Calendar integration
- **Candidate Communication**: Email templates, status notifications
- **Analytics**: Time-to-hire, source effectiveness, pipeline conversion

### Module 4: AI Engine (Shared Intelligence Layer)
- **File Intelligence**: Read, parse, and understand uploaded files
  - CSV/Excel: Structure detection, column type inference, data quality checks
  - PDF: Text extraction, table detection, key information extraction
  - DOCX: Resume parsing, document analysis
- **Natural Language Queries**: "Show me revenue trends for Q3" → generates chart
- **Smart Matching**: For HR — match candidates to job requirements
- **Insight Generation**: Auto-detect patterns, outliers, trends in business data
- **Report Summarization**: AI-generated executive summaries

### Module 5: Settings & Configuration
- Notification preferences
- Data retention policies
- API key management (for integrations)
- Billing & subscription management

---

## 3. Tech Stack

### Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | **React + Vite** | Fast dev, huge ecosystem, good DX |
| Styling | **Tailwind CSS** | Utility-first, fast, already in use |
| Component Library | **shadcn/ui** | Beautiful, accessible, copy-in customizable components |
| Charts | **Recharts** | React-native charting, simple API, SSR-friendly |
| State Management | **Zustand** | Lightweight, minimal boilerplate, perfect for this scale |
| Routing | **React Router v6** | Standard SPA routing, well-documented |
| Forms | **React Hook Form + Zod** | Type-safe validation, shared schemas with backend |
| File Upload | **react-dropzone** | Drag-and-drop file handling |
| Data Fetching | **TanStack Query (React Query)** | Caching, dedup, background refetch, SWR-like |
| Animations | **Framer Motion** | React-native, powerful, accessible |
| Tables | **TanStack Table** | Headless, type-safe, performant for large datasets |
| Icons | **Lucide React** | Tree-shakeable, clean design, MIT |

### Backend
| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js + TypeScript** | Matches frontend ecosystem, strong typing |
| Framework | **Fastify** | Faster than Express, built-in schema validation, better DX |
| Auth | **Better Auth** | Modern, type-safe, handles sessions/OAuth cleanly |
| File Processing | **Multer** (upload) + **pdf-parse** + **xlsx** | Industry standard for each |
| Validation | **Zod** | Shared schemas with frontend |
| ORM | **Drizzle ORM** | Type-safe, lightweight, modern |
| API Style | **REST** (with optional GraphQL later) | Simpler to start, REST is fine for MVP |
| Job Queue | **BullMQ + Redis** | Background jobs (file parsing, AI processing) |

### Database
| Layer | Choice | Why |
|---|---|---|
| Primary DB | **PostgreSQL** | Robust, handles structured + JSON data well |
| Hosting | **Neon** or **Supabase** | Serverless Postgres, free tier, scales well |
| Cache | **Redis** (Upstash or Railway) | Session cache, rate limiting, job queue |
| Vector Search | **pgvector** | For AI embeddings, no extra infra |

### AI / ML Engine
| Layer | Choice | Why |
|---|---|---|
| LLM Provider | **OpenAI API** (GPT-4o-mini for cost) | Best balance of capability and cost |
| Embeddings | **OpenAI Embeddings** | For candidate-job semantic matching |
| Vector Search | **pgvector** (PostgreSQL extension) | No extra infra, works with Neon |
| File Parsing | **pdf-parse**, **mammoth** (DOCX), **xlsx** | Battle-tested Node.js libraries |
| Alternative | **Claude API** (Anthropic) | Better at structured extraction, longer context |

### Infrastructure
| Layer | Choice | Why |
|---|---|---|
| Hosting | **Railway** | Already in use, simple deployment, good for MVP |
| File Storage | **Cloudflare R2** or **AWS S3** | Cheap object storage for uploads |
| Email | **Resend** or **Nodemailer + SMTP** | Transactional emails (verification, notifications) |
| Domain | Custom domain | `app.smeinsightx.com` |
| SSL | Automatic (Railway/Vercel) | Free SSL |
| CI/CD | **GitHub Actions** | Already have workflow, extend it |

---

## 4. Database Schema (PostgreSQL)

```sql
-- Organizations (multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free', -- free, starter, pro, enterprise
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Auth Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Uploaded Files
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- csv, xlsx, json, pdf, docx
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL, -- R2/S3 path
    status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, parsed, error
    metadata JSONB, -- column names, row count, detected types
    created_at TIMESTAMP DEFAULT NOW()
);

-- Parsed Data (for CSV/Excel — stores the actual rows)
CREATE TABLE parsed_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id),
    headers JSONB NOT NULL, -- ["name", "email", "revenue"]
    rows JSONB NOT NULL,    -- [{"name": "Acme", "revenue": 50000}, ...]
    row_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboards (user-created dashboard layouts)
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    layout JSONB NOT NULL, -- widget positions, types, data sources
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- line, bar, pie, kpi, table, ai-insight
    config JSONB NOT NULL, -- chart config, data source query
    position JSONB NOT NULL, -- {x, y, w, h}
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Insights (cached AI-generated insights)
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    file_id UUID REFERENCES files(id),
    type VARCHAR(50) NOT NULL, -- trend, anomaly, forecast, summary
    content JSONB NOT NULL, -- the insight text and supporting data
    created_at TIMESTAMP DEFAULT NOW()
);

-- Job Postings (HR module)
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    required_skills JSONB, -- ["JavaScript", "React", "Node.js"]
    experience_level VARCHAR(50),
    education_level VARCHAR(50),
    location_type VARCHAR(50), -- remote, hybrid, onsite
    status VARCHAR(50) DEFAULT 'open', -- open, closed, draft
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    job_id UUID REFERENCES job_postings(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    cv_file_id UUID REFERENCES files(id),
    extracted_data JSONB, -- parsed skills, experience, education from CV
    match_score INTEGER DEFAULT 0, -- 0-100 AI-calculated
    stage VARCHAR(50) DEFAULT 'applied', -- applied, screening, interview, offer, hired, rejected
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidate Stage History (audit trail for pipeline)
CREATE TABLE candidate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat / AI Conversations (for natural language queries)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    metadata JSONB, -- chart data, file references, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_files_org ON files(org_id);
CREATE INDEX idx_parsed_data_file ON parsed_data(file_id);
CREATE INDEX idx_candidates_org ON candidates(org_id);
CREATE INDEX idx_candidates_job ON candidates(job_id);
CREATE INDEX idx_candidates_stage ON candidates(stage);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

---

## 5. API Design (REST)

### Auth Endpoints
```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/verify-email      # Verify email
POST   /api/auth/forgot-password   # Request reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/me                # Get current user
PATCH  /api/auth/me                # Update profile
```

### File Endpoints
```
POST   /api/files/upload           # Upload file (multipart)
GET    /api/files                  # List uploaded files
GET    /api/files/:id              # Get file details + metadata
GET    /api/files/:id/download     # Download original file
DELETE /api/files/:id              # Delete file
POST   /api/files/:id/parse        # Trigger AI parsing
GET    /api/files/:id/data         # Get parsed data
```

### Dashboard Endpoints
```
GET    /api/dashboards             # List dashboards
POST   /api/dashboards             # Create dashboard
GET    /api/dashboards/:id         # Get dashboard + widgets
PUT    /api/dashboards/:id         # Update dashboard
DELETE /api/dashboards/:id         # Delete dashboard
POST   /api/dashboards/:id/widgets # Add widget
PUT    /api/widgets/:id            # Update widget
DELETE /api/widgets/:id            # Delete widget
```

### Analytics Endpoints
```
POST   /api/analytics/query        # Run a data query
POST   /api/analytics/chart        # Generate chart config from data
POST   /api/analytics/insights     # Get AI insights for a file/dataset
GET    /api/analytics/kpis         # Get KPI summary
```

### HR Endpoints
```
GET    /api/hr/jobs                # List job postings
POST   /api/hr/jobs                # Create job posting
GET    /api/hr/jobs/:id            # Get job + candidates
PUT    /api/hr/jobs/:id            # Update job
DELETE /api/hr/jobs/:id            # Delete job

GET    /api/hr/candidates          # List all candidates (filterable)
POST   /api/hr/candidates          # Add candidate + CV
GET    /api/hr/candidates/:id      # Get candidate details
PATCH  /api/hr/candidates/:id      # Update candidate (stage, notes)
DELETE /api/hr/candidates/:id      # Remove candidate
POST   /api/hr/candidates/:id/screen  # Run AI screening
PATCH  /api/hr/candidates/:id/stage  # Move to different pipeline stage
```

### AI Endpoints
```
POST   /api/ai/analyze-file        # Analyze any uploaded file
POST   /api/ai/query               # Natural language question about data
POST   /api/ai/match-candidate     # Match candidate to job
POST   /api/ai/summarize           # Generate summary/report
POST   /api/ai/chart-suggest       # Suggest best chart for data
```

### Organization Endpoints
```
GET    /api/org                    # Get org details
PATCH  /api/org                    # Update org
GET    /api/org/members            # List members
POST   /api/org/invite             # Invite member
PATCH  /api/org/members/:id        # Update member role
DELETE /api/org/members/:id        # Remove member
```

---

## 6. Frontend Architecture

### 6.1 Component Architecture

The frontend follows a **feature-based** directory structure with shared primitives:

```
src/
├── main.tsx                      # Entry point
├── App.tsx                       # Root layout + router
├── index.css                     # Tailwind imports + global styles
│
├── lib/                          # Shared utilities (no React)
│   ├── api.ts                    # Axios instance with interceptors
│   ├── auth.ts                   # Token management (localStorage + httpOnly cookie)
│   ├── utils.ts                  # cn(), formatCurrency(), formatDate()
│   └── constants.ts              # API URLs, feature flags
│
├── config/                       # App configuration
│   ├── routes.ts                 # Route constants (DRY links)
│   └── query-client.ts           # TanStack Query client config
│
├── hooks/                        # Global custom hooks
│   ├── useAuth.ts                # Auth state + actions
│   ├── useDebounce.ts            # Generic debounce hook
│   ├── useMediaQuery.ts          # Responsive breakpoints
│   └── useDisclosure.ts          # Modal/drawer open/close
│
├── stores/                       # Zustand stores (global state only)
│   ├── authStore.ts              # User, token, org context
│   ├── sidebarStore.ts           # Sidebar collapsed/expanded
│   └── notificationStore.ts      # Toast/notification queue
│
├── components/                   # Shared UI primitives
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── layout/                   # App shell
│   │   ├── AppShell.tsx          # Sidebar + content wrapper
│   │   ├── Navbar.tsx            # Top bar (search, user menu)
│   │   ├── Sidebar.tsx           # Navigation + module switcher
│   │   └── PageHeader.tsx        # Reusable page title + actions
│   ├── data-display/             # Chart & data components
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   └── KpiCard.tsx
│   │   ├── DataTable.tsx         # TanStack Table wrapper
│   │   ├── EmptyState.tsx        # No-data placeholder
│   │   └── MetricCard.tsx        # Single stat display
│   └── feedback/                 # Loading, errors, toasts
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── SkeletonCard.tsx
│       └── Toast.tsx
│
├── features/                     # Feature modules (self-contained)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   └── useLogin.ts
│   │   └── api/
│   │       └── auth.api.ts
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── WidgetCard.tsx
│   │   │   ├── AddWidgetModal.tsx
│   │   │   └── WidgetRenderer.tsx
│   │   ├── hooks/
│   │   │   └── useDashboard.ts
│   │   ├── api/
│   │   │   └── dashboard.api.ts
│   │   └── types.ts
│   ├── analytics/
│   │   ├── components/
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── QueryInput.tsx
│   │   ├── hooks/
│   │   │   ├── useFileUpload.ts
│   │   │   └── useInsights.ts
│   │   ├── api/
│   │   │   └── analytics.api.ts
│   │   └── types.ts
│   ├── hr/
│   │   ├── components/
│   │   │   ├── CandidateCard.tsx
│   │   │   ├── PipelineBoard.tsx
│   │   │   ├── JobForm.tsx
│   │   │   ├── CvUploader.tsx
│   │   │   └── MatchScoreBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useCandidates.ts
│   │   │   └── usePipeline.ts
│   │   ├── api/
│   │   │   └── hr.api.ts
│   │   └── types.ts
│   └── settings/
│       ├── components/
│       │   ├── ProfileForm.tsx
│       │   ├── OrgSettings.tsx
│       │   └── NotificationPrefs.tsx
│       └── api/
│           └── settings.api.ts
│
└── pages/                        # Route-level page components
    ├── Landing.tsx               # Public marketing page
    ├── Login.tsx
    ├── Register.tsx
    ├── DashboardPage.tsx
    ├── AnalyticsPage.tsx
    ├── HRPage.tsx
    ├── SettingsPage.tsx
    └── NotFound.tsx
```

### 6.2 Routing Architecture

```tsx
// src/App.tsx — Route structure
const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Protected routes (wrapped in AuthGuard + AppShell)
  {
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/hr', element: <HRPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFound /> },
]);
```

**Key patterns:**
- `AuthGuard` checks auth state → redirects to `/login` if unauthenticated
- `AppShell` provides sidebar + navbar layout
- Lazy-load feature pages with `React.lazy()` for code splitting
- Route constants in `config/routes.ts` — never hardcode paths

### 6.3 Data Fetching Patterns

**TanStack Query** for all server state (never store API data in Zustand):

```tsx
// ✅ Good — TanStack Query handles caching, dedup, refetch
const { data: files, isLoading } = useQuery({
  queryKey: ['files', { orgId }],
  queryFn: () => api.get('/files', { params: { orgId } }),
  staleTime: 30_000, // 30s fresh
});

// ✅ Good — Parallel independent queries (no waterfalls)
const { data: files } = useQuery({ queryKey: ['files'], queryFn: fetchFiles });
const { data: dashboards } = useQuery({ queryKey: ['dashboards'], queryFn: fetchDashboards });
const { data: jobs } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });
// All fire simultaneously — React Query deduplicates automatically

// ✅ Good — Mutations with optimistic updates
const deleteFile = useMutation({
  mutationFn: (id: string) => api.delete(`/files/${id}`),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['files'] });
    const previous = queryClient.getQueryData(['files']);
    queryClient.setQueryData(['files'], (old: File[]) =>
      old.filter(f => f.id !== id)
    );
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(['files'], context?.previous); // rollback
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
});
```

**Zustand** only for UI/client state:
- Auth token + user info (persisted to localStorage)
- Sidebar collapsed/expanded
- Notification queue

### 6.4 Performance Rules (from React Best Practices)

Applied from the `react-best-practices` skill — 57 rules across 8 categories:

**CRITICAL — Eliminate Waterfalls:**
- Use `Promise.all()` for independent API calls — never `await` sequentially
- Start fetches early, `await` late in API routes
- Use Suspense boundaries to stream content progressively
- Defer `await` until the value is actually needed in the branch

**CRITICAL — Bundle Size:**
- Import directly from subpaths, never barrel files (`import { X } from 'lib'` → `import { X } from 'lib/x'`)
- Dynamic import heavy components: `const Chart = lazy(() => import('./components/charts/LineChart'))`
- Defer analytics/logging libraries until after hydration
- Preload on hover/focus for perceived speed

**HIGH — Re-render Optimization:**
- Use functional `setState` updates (`setItems(curr => [...curr, item])`) — stable callbacks
- Extract expensive computations into `useMemo` with primitive dependencies
- Don't subscribe to state only used in callbacks — read on demand via refs
- Use `useTransition` for non-urgent updates (filtering, searching)
- Hoist default non-primitive props outside components
- Derive state during render, not in `useEffect`

**MEDIUM — Rendering:**
- Use `content-visibility: auto` for long lists (virtualize with TanStack Virtual)
- Use ternary over `&&` for conditional rendering with numbers
- Hoist static JSX outside components
- Use explicit loading states with `useTransition`

### 6.5 State Management Rules

| What | Where | Why |
|---|---|---|
| Server data (files, dashboards, jobs) | **TanStack Query** | Auto cache, refetch, dedup, offline support |
| Auth (user, token, org) | **Zustand + localStorage** | Needed globally, persisted, simple |
| Form state | **React Hook Form** | Local to form, validation, dirty tracking |
| URL state (filters, pagination) | **URL search params** | Shareable, bookmarkable, back-button works |
| UI state (modals, sidebar) | **Zustand** or local `useState` | Global for sidebar, local for modals |
| Transient values (scroll, mouse) | **useRef** | No re-renders needed |
| Derived data | **Computed during render** | Not stored — just calculate from source |

### 6.6 API Client Pattern

```tsx
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30_000,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 6.7 Component Design Rules

1. **One component, one responsibility.** A `FileList` renders files — it doesn't fetch them.
2. **Presentational vs Container:** Components in `ui/` are pure presentational. Components in `features/` contain logic.
3. **Composition over configuration:** Use children/slots, not endless props.
4. **Always show loading/error/empty states.** Never render nothing.
5. **Type everything.** Props, API responses, store shapes — all typed.
6. **Colocate.** Feature-specific types, hooks, and API calls live in `features/<name>/`.

---

## 7. Project Structure

```
sme-insightx-app/
├── PLAN.md                          # This file
├── README.md
├── package.json                     # Root package.json (monorepo or workspace)
│
├── client/                          # React Frontend (see §6 for detailed structure)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── lib/                     # Shared utilities
│       ├── config/                  # Route constants, query client
│       ├── hooks/                   # Global custom hooks
│       ├── stores/                  # Zustand stores (auth, sidebar)
│       ├── components/              # Shared UI primitives
│       │   ├── ui/                  # shadcn/ui base
│       │   ├── layout/              # AppShell, Navbar, Sidebar
│       │   ├── data-display/        # Charts, tables, metrics
│       │   └── feedback/            # Loading, errors, toasts
│       ├── features/                # Self-contained feature modules
│       │   ├── auth/                # Login, Register, AuthGuard
│       │   ├── dashboard/           # Dashboard builder + widgets
│       │   ├── analytics/           # File upload, insights, queries
│       │   ├── hr/                  # Recruitment pipeline
│       │   └── settings/            # Profile, org, notifications
│       └── pages/                   # Route-level page components
│
├── server/                          # Node.js Backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 # Entry point, Fastify setup
│       ├── config.ts                # Environment config
│       ├── middleware/
│       │   ├── auth.ts              # Auth middleware (JWT verification)
│       │   ├── upload.ts            # Multer file upload config
│       │   ├── validate.ts          # Zod request validation
│       │   ├── rateLimit.ts         # Rate limiting
│       │   └── error.ts             # Error handler
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── files.routes.ts
│       │   ├── dashboard.routes.ts
│       │   ├── analytics.routes.ts
│       │   ├── hr.routes.ts
│       │   ├── ai.routes.ts
│       │   └── org.routes.ts
│       ├── services/
│       │   ├── auth.service.ts      # Auth logic
│       │   ├── file.service.ts      # File upload/storage
│       │   ├── parser.service.ts    # File parsing (CSV, Excel, PDF, DOCX)
│       │   ├── analytics.service.ts # Data queries & aggregations
│       │   ├── ai.service.ts        # OpenAI/Claude API calls
│       │   ├── hr.service.ts        # Recruitment logic
│       │   ├── email.service.ts     # Email sending
│       │   └── storage.service.ts   # R2/S3 file storage
│       ├── db/
│       │   ├── index.ts             # Drizzle DB connection
│       │   ├── schema.ts            # Table definitions
│       │   └── migrations/          # SQL migrations
│       └── types/
│           └── index.ts             # Shared TypeScript types
│
├── shared/                          # Shared code between client + server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── schemas.ts               # Zod schemas (used by both)
│       ├── types.ts                 # Shared TypeScript types
│       └── constants.ts             # Shared enums, constants
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint + test on PR
│       └── deploy.yml               # Deploy to Railway on merge
├── .env.example                     # Environment variables template
├── docker-compose.yml               # Local dev (Postgres + Redis)
└── drizzle.config.ts                # Drizzle ORM config
```

**Key structural decisions:**
- **`shared/` package** — Zod schemas + types used by both client and server (single source of truth)
- **Feature-based frontend** — each feature (`auth/`, `dashboard/`, `analytics/`, `hr/`) is self-contained with its own components, hooks, and API calls
- **No barrel files** — import directly from feature subpaths for optimal tree-shaking
- **`pages/` are thin** — they compose feature components, contain no logic

---

## 8. Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sme_insightx

# Auth
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d

# File Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=sme-insightx-files

# AI
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 9. Build Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Auth + backend + frontend shell

**Backend:**
- [ ] Initialize monorepo (`client/`, `server/`, `shared/` packages)
- [ ] Set up Fastify server with TypeScript
- [ ] Set up PostgreSQL (Neon) with Drizzle ORM
- [ ] Build auth system (register, login, JWT, sessions) with Better Auth
- [ ] Create Zod schemas in `shared/` for auth forms
- [ ] Deploy database
- [ ] Basic CI/CD pipeline (GitHub Actions)

**Frontend:**
- [ ] Initialize Vite + React + TypeScript + Tailwind
- [ ] Set up shadcn/ui base components
- [ ] Set up React Router v6 with route constants
- [ ] Build `AppShell` layout (sidebar + navbar)
- [ ] Create `AuthGuard` component for protected routes
- [ ] Build Login + Register pages with React Hook Form + Zod
- [ ] Set up TanStack Query client with interceptors
- [ ] Set up Zustand `authStore` (token, user, org)
- [ ] Implement API client (`lib/api.ts`) with auth interceptor
- [ ] Lazy-load feature pages for code splitting

### Phase 2: File System (Week 3-4)
**Goal:** Upload, store, and parse files

**Backend:**
- [ ] File upload API (Multer + R2 storage)
- [ ] CSV/Excel parser service
- [ ] PDF text extraction
- [ ] Parsed data storage in PostgreSQL
- [ ] Background job queue (BullMQ) for file processing

**Frontend:**
- [ ] `FileDropzone` component (react-dropzone)
- [ ] `FileList` component with TanStack Table
- [ ] `FilePreview` component (data table + metadata)
- [ ] Upload progress indicator + toast notifications
- [ ] `useFileUpload` hook with optimistic updates
- [ ] Loading skeletons for file list
- [ ] Empty state when no files uploaded
- [ ] Responsive design for mobile file management

### Phase 3: Analytics Dashboard (Week 5-6)
**Goal:** Interactive charts from real data

**Backend:**
- [ ] Chart generation API (aggregate parsed data)
- [ ] Dashboard CRUD (create, save, load)
- [ ] Widget system API (line, bar, pie, KPI)
- [ ] Data filtering and date range query endpoints
- [ ] Export to PDF/CSV endpoints

**Frontend:**
- [ ] `DashboardGrid` component (drag-and-drop layout)
- [ ] `WidgetCard` with configurable chart rendering
- [ ] Chart components: `LineChart`, `BarChart`, `PieChart`, `KpiCard`
- [ ] `AddWidgetModal` with chart type selector
- [ ] Data filtering UI (date range, columns)
- [ ] Export button (PDF/CSV download)
- [ ] `useDashboard` hook with TanStack Query
- [ ] Dynamic import heavy chart libs (code splitting)
- [ ] `content-visibility: auto` for large data tables

### Phase 4: AI Engine (Week 7-8)
**Goal:** AI-powered features

**Backend:**
- [ ] AI file analysis service (OpenAI/Claude)
- [ ] Natural language query → chart generation
- [ ] Auto-insight generation (trends, anomalies)
- [ ] Smart chart type suggestion
- [ ] AI conversation/chat API
- [ ] Report summarization

**Frontend:**
- [ ] `QueryInput` component (natural language search)
- [ ] `InsightsPanel` component (AI-generated insights display)
- [ ] `AIChat` component (conversation UI)
- [ ] `useInsights` hook with streaming responses
- [ ] Skeleton loading for AI responses
- [ ] Dynamic import AI chat (heavy component, lazy loaded)
- [ ] `useTransition` for non-blocking query filtering

### Phase 5: HR Module (Week 9-10)
**Goal:** Full recruitment pipeline

**Backend:**
- [ ] Job posting CRUD
- [ ] CV upload + AI parsing (skills, experience extraction)
- [ ] Candidate-job matching with AI scoring
- [ ] Pipeline stage management
- [ ] Pipeline analytics (time-to-hire, conversion rates)

**Frontend:**
- [ ] `PipelineBoard` (Kanban with drag-and-drop)
- [ ] `CandidateCard` with match score badge
- [ ] `JobForm` with React Hook Form + Zod validation
- [ ] `CvUploader` with AI parsing progress
- [ ] `MatchScoreBadge` visualization
- [ ] `useCandidates` hook with stage filtering
- [ ] `usePipeline` hook with optimistic stage moves
- [ ] Responsive Kanban for mobile (swipe instead of drag)

### Phase 6: Polish & Launch (Week 11-12)
**Goal:** Production-ready

**Backend:**
- [ ] Email notifications (verification, pipeline updates)
- [ ] Organization management (invite members)
- [ ] Rate limiting + security hardening
- [ ] Error handling + structured logging
- [ ] API documentation

**Frontend:**
- [ ] Landing page refresh (marketing copy, feature showcase)
- [ ] Error boundary for all routes
- [ ] Loading skeletons for all data views
- [ ] Responsive audit (mobile, tablet, desktop)
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance audit (Lighthouse > 90)
- [ ] Bundle size optimization pass
- [ ] Documentation (component storybook or docs site)
- [ ] Beta launch

---

## 10. Key Technical Decisions

### Why PostgreSQL over MongoDB?
- Structured data (users, files, candidates) fits relational well
- pgvector extension gives us vector search for AI embeddings
- Drizzle ORM provides type safety without the weight of Prisma
- Neon gives us serverless Postgres with generous free tier

### Why Vite + React over Next.js?
- SPA model — authenticated app, no SEO needed
- Vite gives faster HMR and builds than CRA or Next.js
- Simpler deployment: static files + API server separately
- React Router handles routing client-side, no server routing needed
- Can add SSR later if SEO pages (landing, blog) are needed
- TanStack Query covers data fetching — no need for Next.js server components

### Why TanStack Query + Zustand (not just one)?
- TanStack Query: **server state** (API data, caching, dedup, background refetch)
- Zustand: **client state** (auth token, sidebar, UI preferences)
- Mixing them causes bugs — server data shouldn't live in Zustand
- This separation is a React best practice (server state vs client state)

### Why REST over GraphQL?
- Simpler to build and debug
- Our data relationships aren't deeply nested
- REST is sufficient for our current feature set
- Can add GraphQL layer later if needed

### Why OpenAI over local models?
- Better quality for structured extraction (CVs, data analysis)
- No GPU infrastructure needed
- Pay-per-use, scales with users
- Can switch providers easily (Claude, local models) via service layer

### Why Railway over Vercel/Netlify?
- Supports both frontend and backend
- PostgreSQL add-on available
- Already in use for the current app
- Simple deployment with GitHub integration

---

## 11. Cost Estimates (Monthly, at Scale)

| Service | Free Tier | ~100 Users | ~1000 Users |
|---|---|---|---|
| Railway (server) | $5 trial | $20 | $50-100 |
| Neon (PostgreSQL) | Free (0.5GB) | $0-19 | $19-69 |
| Cloudflare R2 (files) | 10GB free | $0-5 | $5-20 |
| OpenAI API | — | $20-50 | $100-500 |
| Resend (email) | 100 emails/day free | $0-20 | $20-80 |
| **Total** | **~$5** | **~$60-110** | **~$200-700** |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI API costs spike | High | Cache insights, use GPT-4o-mini, set usage limits |
| Large file uploads crash server | Medium | Stream processing, file size limits, queue jobs |
| Data privacy concerns | High | Encrypt at rest, GDPR compliance, data deletion |
| OpenAI rate limits | Medium | Queue system, retry logic, fallback to Claude |
| Competition (HubSpot, etc.) | Medium | Focus on SME niche, pricing advantage, simplicity |

---

## 13. Success Metrics

- **MVP Launch:** Working auth + file upload + basic charts + HR pipeline
- **Beta:** 50 test users, feedback collection
- **V1.0:** AI features working, payment integration, public launch
- **Target:** 500 users in first 3 months, $5K MRR in 6 months

---

*Last updated: 2026-03-21 (v2 — added frontend architecture, react-best-practices)*
*Author: Nawax (AI Assistant) for Nawaf*
