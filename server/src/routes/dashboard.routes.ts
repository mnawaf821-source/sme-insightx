import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { dashboardService } from '../services/dashboard.service.js';

export async function dashboardRoutes(app: FastifyInstance) {
  // List dashboards
  app.get('/', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const dashboards = await dashboardService.listDashboards(
        request.user.organizationId,
      );
      return reply.send({ success: true, data: dashboards });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Get dashboard with widgets
  app.get('/:id', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const dashboard = await dashboardService.getDashboard(
        request.params.id,
        request.user.organizationId,
      );
      return reply.send({ success: true, data: dashboard });
    } catch (err: any) {
      const status = err.message === 'Dashboard not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Create dashboard
  app.post('/', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const { name, description } = request.body as any;
      const dashboard = await dashboardService.createDashboard(
        request.user.organizationId,
        request.user.userId,
        { name, description },
      );
      return reply.status(201).send({ success: true, data: dashboard });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // Update dashboard
  app.put('/:id', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const dashboard = await dashboardService.updateDashboard(
        request.params.id,
        request.user.organizationId,
        request.body as any,
      );
      return reply.send({ success: true, data: dashboard });
    } catch (err: any) {
      const status = err.message === 'Dashboard not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Delete dashboard
  app.delete('/:id', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      await dashboardService.deleteDashboard(
        request.params.id,
        request.user.organizationId,
      );
      return reply.send({ success: true, message: 'Dashboard deleted' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Add widget
  app.post('/:id/widgets', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const widget = await dashboardService.addWidget(
        request.params.id,
        request.user.organizationId,
        request.body as any,
      );
      return reply.status(201).send({ success: true, data: widget });
    } catch (err: any) {
      const status = err.message === 'Dashboard not found' ? 404 : 400;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Update widget
  app.put('/:dashboardId/widgets/:widgetId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const widget = await dashboardService.updateWidget(
        request.params.widgetId,
        request.params.dashboardId,
        request.body as any,
      );
      return reply.send({ success: true, data: widget });
    } catch (err: any) {
      const status = err.message === 'Widget not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Delete widget
  app.delete('/:dashboardId/widgets/:widgetId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      await dashboardService.deleteWidget(
        request.params.widgetId,
        request.params.dashboardId,
      );
      return reply.send({ success: true, message: 'Widget deleted' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Get chart data from a parsed file
  app.get('/data/:fileId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const data = await dashboardService.getChartData(
        request.params.fileId,
        request.user.organizationId,
      );
      return reply.send({ success: true, data });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });
}
