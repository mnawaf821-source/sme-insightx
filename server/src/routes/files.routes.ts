import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { getFileType } from '../middleware/upload.js';
import { fileService } from '../services/file.service.js';
import type { ApiResponse, PaginatedResponse } from '@sme-insightx/shared';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const ALLOWED_MIMES: Record<string, string> = {
  'text/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xlsx',
  'application/json': 'json',
  'application/pdf': 'pdf',
};

const ALLOWED_EXTS: Record<string, string> = {
  '.csv': 'csv',
  '.xlsx': 'xlsx',
  '.xls': 'xlsx',
  '.json': 'json',
  '.pdf': 'pdf',
};

function detectFileType(mimetype: string, filename: string): string | null {
  if (ALLOWED_MIMES[mimetype]) return ALLOWED_MIMES[mimetype];
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTS[ext] || null;
}

export async function fileRoutes(app: FastifyInstance) {
  // Ensure upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Upload file
  app.post('/upload', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ success: false, error: 'No file provided' });
      }

      const fileType = detectFileType(data.mimetype, data.filename);
      if (!fileType) {
        return reply.status(415).send({
          success: false,
          error: `Unsupported file type: ${data.mimetype}. Allowed: CSV, XLSX, JSON, PDF`,
        });
      }

      const ext = path.extname(data.filename);
      const filename = `${randomUUID()}${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      await pipeline(data.file, createWriteStream(filepath));

      const fileObj = {
        originalname: data.filename,
        mimetype: data.mimetype,
        filename: filename,
        path: filepath,
        size: data.file.bytesRead,
      };

      const record = await fileService.createFile(
        request.user.organizationId,
        request.user.userId,
        fileObj as any,
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
