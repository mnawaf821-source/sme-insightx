import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { hrService } from '../services/hr.service.js';

export async function hrRoutes(app: FastifyInstance) {
  // ─── Jobs ──────────────────────────────────────────────────────────────

  app.get('/jobs', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const jobs = await hrService.listJobs(request.user.organizationId);
      return reply.send({ success: true, data: jobs });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  app.get('/jobs/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const job = await hrService.getJob(request.params.id, request.user.organizationId);
      return reply.send({ success: true, data: job });
    } catch (err: any) {
      return reply.status(404).send({ success: false, error: err.message });
    }
  });

  app.post('/jobs', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const job = await hrService.createJob(
        request.user.organizationId,
        request.user.userId,
        request.body as any,
      );
      return reply.status(201).send({ success: true, data: job });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  app.put('/jobs/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const job = await hrService.updateJob(
        request.params.id,
        request.user.organizationId,
        request.body as any,
      );
      return reply.send({ success: true, data: job });
    } catch (err: any) {
      const status = err.message === 'Job posting not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  app.delete('/jobs/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      await hrService.deleteJob(request.params.id, request.user.organizationId);
      return reply.send({ success: true, message: 'Job deleted' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ─── Candidates ────────────────────────────────────────────────────────

  app.get('/candidates', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const { jobId, status, page, limit } = request.query as any;
      const candidates = await hrService.listCandidates(request.user.organizationId, {
        jobId,
        status,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      return reply.send({ success: true, data: candidates });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  app.get('/candidates/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const candidate = await hrService.getCandidate(
        request.params.id,
        request.user.organizationId,
      );
      return reply.send({ success: true, data: candidate });
    } catch (err: any) {
      return reply.status(404).send({ success: false, error: err.message });
    }
  });

  app.post('/candidates', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const candidate = await hrService.createCandidate(
        request.user.organizationId,
        request.user.userId,
        request.body as any,
      );
      return reply.status(201).send({ success: true, data: candidate });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  app.put('/candidates/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const candidate = await hrService.updateCandidate(
        request.params.id,
        request.user.organizationId,
        request.user.userId,
        request.body as any,
      );
      return reply.send({ success: true, data: candidate });
    } catch (err: any) {
      const status = err.message === 'Candidate not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  app.delete('/candidates/:id', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      await hrService.deleteCandidate(request.params.id, request.user.organizationId);
      return reply.send({ success: true, message: 'Candidate deleted' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ─── Pipeline ──────────────────────────────────────────────────────────

  app.get('/pipeline', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const { jobId } = request.query as any;
      const pipeline = await hrService.getPipeline(request.user.organizationId, jobId);
      return reply.send({ success: true, data: pipeline });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  app.patch('/candidates/:id/stage', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const { status, notes } = request.body as any;
      const candidate = await hrService.moveStage(
        request.params.id,
        request.user.organizationId,
        request.user.userId,
        status,
        notes,
      );
      return reply.send({ success: true, data: candidate });
    } catch (err: any) {
      const status = err.message === 'Candidate not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // ─── Analytics ─────────────────────────────────────────────────────────

  app.get('/analytics', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const analytics = await hrService.getPipelineAnalytics(request.user.organizationId);
      return reply.send({ success: true, data: analytics });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ─── AI Matching ───────────────────────────────────────────────────────

  app.post('/candidates/:id/match', { preHandler: [authMiddleware] }, async (request: any, reply) => {
    try {
      const result = await hrService.matchCandidate(
        request.params.id,
        request.user.organizationId,
      );
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });
}
