import { api } from '../../../lib/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JobPosting {
  id: string;
  organizationId: string;
  createdById: string | null;
  title: string;
  department: string | null;
  description: string;
  requirements: string | null;
  location: string | null;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryMin: number | null;
  salaryMax: number | null;
  status: 'draft' | 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  organizationId: string;
  jobPostingId: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  notes: string | null;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  createdAt: string;
  updatedAt: string;
  history?: CandidateHistory[];
}

export interface CandidateHistory {
  id: string;
  candidateId: string;
  changedById: string | null;
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface Pipeline {
  new: Candidate[];
  screening: Candidate[];
  interview: Candidate[];
  offer: Candidate[];
  hired: Candidate[];
  rejected: Candidate[];
}

export interface PipelineAnalytics {
  total: number;
  active: number;
  hired: number;
  rejected: number;
  byStatus: Record<string, number>;
  conversionRate: string;
}

export interface TopCandidate {
  id: string;
  name: string;
  email: string;
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
  };
  status: string;
  reasoning: string;
}

export const hrApi = {
  // Jobs
  async getJobs(): Promise<JobPosting[]> {
    const res = await api.get<ApiResponse<JobPosting[]>>('/hr/jobs');
    return res.data.data!;
  },

  async getJob(id: string): Promise<JobPosting> {
    const res = await api.get<ApiResponse<JobPosting>>(`/hr/jobs/${id}`);
    return res.data.data!;
  },

  async createJob(data: Partial<JobPosting>): Promise<JobPosting> {
    const res = await api.post<ApiResponse<JobPosting>>('/hr/jobs', data);
    return res.data.data!;
  },

  async updateJob(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
    const res = await api.put<ApiResponse<JobPosting>>(`/hr/jobs/${id}`, data);
    return res.data.data!;
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/hr/jobs/${id}`);
  },

  // Candidates
  async getCandidates(params?: { jobId?: string; status?: string }): Promise<Candidate[]> {
    const res = await api.get<ApiResponse<Candidate[]>>('/hr/candidates', { params });
    return res.data.data!;
  },

  async getCandidate(id: string): Promise<Candidate> {
    const res = await api.get<ApiResponse<Candidate>>(`/hr/candidates/${id}`);
    return res.data.data!;
  },

  async createCandidate(data: Partial<Candidate>): Promise<Candidate> {
    const res = await api.post<ApiResponse<Candidate>>('/hr/candidates', data);
    return res.data.data!;
  },

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const res = await api.put<ApiResponse<Candidate>>(`/hr/candidates/${id}`, data);
    return res.data.data!;
  },

  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/hr/candidates/${id}`);
  },

  async moveStage(id: string, status: string, notes?: string): Promise<Candidate> {
    const res = await api.patch<ApiResponse<Candidate>>(`/hr/candidates/${id}/stage`, {
      status,
      notes,
    });
    return res.data.data!;
  },

  // Pipeline
  async getPipeline(jobId?: string): Promise<Pipeline> {
    const res = await api.get<ApiResponse<Pipeline>>('/hr/pipeline', {
      params: jobId ? { jobId } : undefined,
    });
    return res.data.data!;
  },

  // Analytics
  async getAnalytics(): Promise<PipelineAnalytics> {
    const res = await api.get<ApiResponse<PipelineAnalytics>>('/hr/analytics');
    return res.data.data!;
  },

  // AI Match
  async matchCandidate(id: string): Promise<{ score: number; reasoning: string; breakdown: { skills: number; experience: number; education: number } }> {
    const res = await api.post<ApiResponse<{ score: number; reasoning: string; breakdown: { skills: number; experience: number; education: number } }>>(
      `/hr/candidates/${id}/match`,
    );
    return res.data.data!;
  },

  // Top Candidates
  async getTopCandidates(jobId?: string): Promise<TopCandidate[]> {
    const res = await api.get<ApiResponse<TopCandidate[]>>(
      '/hr/top-candidates',
      { params: jobId ? { jobId } : undefined },
    );
    return res.data.data!;
  },

  // Re-score candidate
  async rescoreCandidate(id: string): Promise<{ score: number; reasoning: string; breakdown: { skills: number; experience: number; education: number } }> {
    const res = await api.post<ApiResponse<{ score: number; reasoning: string; breakdown: { skills: number; experience: number; education: number } }>>(
      `/hr/candidates/${id}/match`,
    );
    return res.data.data!;
  },
};
