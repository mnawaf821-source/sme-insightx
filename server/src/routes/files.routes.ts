import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { upload, getFileType } from '../middleware/upload.js';
import { fileService } from '../services/file.service.js';
import type { ApiResponse, PaginatedResponse } from '@sme-insightx/shared';

export async function fileRoutes(app: FastifyInstance) {
  // Upload file
  app.post('/upload', {
    preHandler: [authMiddleware, upload.single('file') as any],
  }, async (request: any, reply) => {
    try {
      const file = request.file;
      if (!file) {
        return reply.status(400).send({ success: false, error: 'No file provided' });
      }

      const record = await fileService.createFile(
        request.user.organizationId,
        request.user.userId,
        file,
      );

      return reply.status(201).send({
        success: true,
        data: record,
        message: 'File uploaded successfully',
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // List files
  app.get('/', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const page = parseInt(request.query.page as string) || 1;
      const limit = Math.min(parseInt(request.query.limit as string) || 20, 100);

      const result = await fileService.listFiles(
        request.user.organizationId,
        page,
        limit,
      );

      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Get single file
  app.get('/:id', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const file = await fileService.getFile(
        request.params.id,
        request.user.organizationId,
      );

      return reply.send({ success: true, data: file });
    } catch (err: any) {
      const status = err.message === 'File not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Download file
  app.get('/:id/download', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const file = await fileService.getFile(
        request.params.id,
        request.user.organizationId,
      );

      const { storageService } = await import('../services/storage.service.js');
      const stream = storageService.createReadStream(file.url);

      return reply
        .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
        .header('Content-Type', 'application/octet-stream')
        .send(stream);
    } catch (err: any) {
      const status = err.message === 'File not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Delete file
  app.delete('/:id', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      await fileService.deleteFile(
        request.params.id,
        request.user.organizationId,
      );

      return reply.send({ success: true, message: 'File deleted' });
    } catch (err: any) {
      const status = err.message === 'File not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Parse file
  app.post('/:id/parse', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const result = await fileService.parseFile(
        request.params.id,
        request.user.organizationId,
      );

      return reply.send({
        success: true,
        data: result,
        message: 'File parsed successfully',
      });
    } catch (err: any) {
      const status = err.message === 'File not found' ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Get parsed data
  app.get('/:id/data', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const data = await fileService.getParsedData(
        request.params.id,
        request.user.organizationId,
      );

      return reply.send({ success: true, data });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });
}
