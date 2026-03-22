import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import { jobPostings, candidates, candidateHistory } from '../db/schema.js';
import { aiService } from './ai.service.js';

export const hrService = {
  // ─── Job Postings ──────────────────────────────────────────────────────

  async listJobs(organizationId: string) {
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.organizationId, organizationId))
      .orderBy(desc(jobPostings.createdAt));
  },

  async getJob(jobId: string, organizationId: string) {
    const job = await db.query.jobPostings.findFirst({
      where: and(
        eq(jobPostings.id, jobId),
        eq(jobPostings.organizationId, organizationId),
      ),
    });
    if (!job) throw new Error('Job posting not found');
    return job;
  },

  async createJob(
    organizationId: string,
    userId: string,
    data: {
      title: string;
      department?: string;
      description: string;
      requirements?: string;
      location?: string;
      type: 'full-time' | 'part-time' | 'contract' | 'internship';
      salaryMin?: number;
      salaryMax?: number;
      status?: 'draft' | 'open' | 'closed';
    },
  ) {
    const [job] = await db
      .insert(jobPostings)
      .values({ organizationId, createdById: userId, ...data })
      .returning();
    return job;
  },

  async updateJob(
    jobId: string,
    organizationId: string,
    data: Partial<{
      title: string;
      department: string;
      description: string;
      requirements: string;
      location: string;
      type: string;
      salaryMin: number;
      salaryMax: number;
      status: string;
    }>,
  ) {
    const [job] = await db
      .update(jobPostings)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(
        and(eq(jobPostings.id, jobId), eq(jobPostings.organizationId, organizationId)),
      )
      .returning();
    if (!job) throw new Error('Job posting not found');
    return job;
  },

  async deleteJob(jobId: string, organizationId: string) {
    await db
      .delete(jobPostings)
      .where(
        and(eq(jobPostings.id, jobId), eq(jobPostings.organizationId, organizationId)),
      );
    return { success: true };
  },

  // ─── Candidates ────────────────────────────────────────────────────────

  async listCandidates(
    organizationId: string,
    filters?: { jobId?: string; status?: string; page?: number; limit?: number },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    let where = eq(candidates.organizationId, organizationId);

    // Build query
    let query = db
      .select()
      .from(candidates)
      .where(where)
      .orderBy(desc(candidates.createdAt))
      .limit(limit)
      .offset(offset);

    const rows = await query;

    // Filter in memory for optional filters (keeps query simple)
    let filtered = rows;
    if (filters?.jobId) {
      filtered = filtered.filter((r) => r.jobPostingId === filters.jobId);
    }
    if (filters?.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    return filtered;
  },

  async getCandidate(candidateId: string, organizationId: string) {
    const candidate = await db.query.candidates.findFirst({
      where: and(
        eq(candidates.id, candidateId),
        eq(candidates.organizationId, organizationId),
      ),
    });
    if (!candidate) throw new Error('Candidate not found');

    // Get history
    const history = await db
      .select()
      .from(candidateHistory)
      .where(eq(candidateHistory.candidateId, candidateId))
      .orderBy(desc(candidateHistory.createdAt));

    return { ...candidate, history };
  },

  async createCandidate(
    organizationId: string,
    userId: string,
    data: {
      jobPostingId: string;
      name: string;
      email: string;
      phone?: string;
      resumeUrl?: string;
      notes?: string;
      status?: string;
    },
  ) {
    const [candidate] = await db
      .insert(candidates)
      .values({
        organizationId,
        jobPostingId: data.jobPostingId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        resumeUrl: data.resumeUrl,
        notes: data.notes,
        status: (data.status as any) || 'new',
      })
      .returning();

    // Record history
    await db.insert(candidateHistory).values({
      candidateId: candidate.id,
      changedById: userId,
      toStatus: 'new',
      notes: 'Candidate added',
    });

    return candidate;
  },

  async updateCandidate(
    candidateId: string,
    organizationId: string,
    userId: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      resumeUrl: string;
      notes: string;
      status: string;
    }>,
  ) {
    // Get current candidate for history
    const current = await db.query.candidates.findFirst({
      where: and(
        eq(candidates.id, candidateId),
        eq(candidates.organizationId, organizationId),
      ),
    });
    if (!current) throw new Error('Candidate not found');

    const [candidate] = await db
      .update(candidates)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(candidates.id, candidateId))
      .returning();

    // Record status change in history
    if (data.status && data.status !== current.status) {
      await db.insert(candidateHistory).values({
        candidateId,
        changedById: userId,
        fromStatus: current.status as any,
        toStatus: data.status as any,
        notes: `Stage changed from ${current.status} to ${data.status}`,
      });
    }

    return candidate;
  },

  async deleteCandidate(candidateId: string, organizationId: string) {
    await db
      .delete(candidates)
      .where(
        and(eq(candidates.id, candidateId), eq(candidates.organizationId, organizationId)),
      );
    return { success: true };
  },

  // ─── Pipeline ──────────────────────────────────────────────────────────

  async getPipeline(organizationId: string, jobId?: string) {
    const stages = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];

    let query = db
      .select()
      .from(candidates)
      .where(eq(candidates.organizationId, organizationId));

    const allCandidates = await query;

    const filtered = jobId
      ? allCandidates.filter((c) => c.jobPostingId === jobId)
      : allCandidates;

    const pipeline: Record<string, typeof filtered> = {};
    for (const stage of stages) {
      pipeline[stage] = filtered.filter((c) => c.status === stage);
    }

    return pipeline;
  },

  async moveStage(
    candidateId: string,
    organizationId: string,
    userId: string,
    newStatus: string,
    notes?: string,
  ) {
    return this.updateCandidate(candidateId, organizationId, userId, {
      status: newStatus,
    });
  },

  // ─── Analytics ─────────────────────────────────────────────────────────

  async getPipelineAnalytics(organizationId: string) {
    const allCandidates = await db
      .select()
      .from(candidates)
      .where(eq(candidates.organizationId, organizationId));

    const total = allCandidates.length;
    const byStatus: Record<string, number> = {};
    for (const c of allCandidates) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    }

    const hired = byStatus['hired'] || 0;
    const rejected = byStatus['rejected'] || 0;
    const active = total - hired - rejected;

    return {
      total,
      active,
      hired,
      rejected,
      byStatus,
      conversionRate: total > 0 ? ((hired / total) * 100).toFixed(1) + '%' : '0%',
    };
  },

  // ─── AI Matching ───────────────────────────────────────────────────────

  async matchCandidate(candidateId: string, organizationId: string) {
    const candidate = await db.query.candidates.findFirst({
      where: and(
        eq(candidates.id, candidateId),
        eq(candidates.organizationId, organizationId),
      ),
    });
    if (!candidate) throw new Error('Candidate not found');

    const job = await db.query.jobPostings.findFirst({
      where: eq(jobPostings.id, candidate.jobPostingId),
    });
    if (!job) throw new Error('Job posting not found');

    // Use AI to score the match
    const prompt = `Score this candidate's fit for the job (0-100).

Job: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements || 'Not specified'}

Candidate: ${candidate.name}
Notes: ${candidate.notes || 'No notes'}
Resume URL: ${candidate.resumeUrl || 'No resume'}

Respond with ONLY a JSON object:
{"score": <0-100>, "reasoning": "<brief explanation>"}`;

    try {
      const response = await aiService.chat([{ role: 'user', content: prompt }]);
      const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const result = JSON.parse(cleaned);
      return result;
    } catch {
      return { score: 50, reasoning: 'Could not auto-score. Manual review recommended.' };
    }
  },
};
