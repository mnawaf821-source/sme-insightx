import type { FastifyInstance } from 'fastify';
import { loginSchema, registerSchema } from '@sme-insightx/shared';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post(
    '/register',
    { preHandler: validate(registerSchema) },
    async (request, reply) => {
      try {
        const result = await authService.register(request.body as any);
        return reply.status(201).send({ success: true, data: result });
      } catch (err: any) {
        const status = err.message === 'Email already registered' ? 409 : 400;
        return reply.status(status).send({ success: false, error: err.message });
      }
    },
  );

  // Login
  app.post(
    '/login',
    { preHandler: validate(loginSchema) },
    async (request, reply) => {
      try {
        const result = await authService.login(request.body as any);
        return reply.send({ success: true, data: result });
      } catch (err: any) {
        return reply.status(401).send({ success: false, error: err.message });
      }
    },
  );

  // Logout
  app.post(
    '/logout',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const token = request.headers.authorization!.slice(7);
        await authService.logout(token);
        return reply.send({ success: true, message: 'Logged out' });
      } catch (err: any) {
        return reply.status(500).send({ success: false, error: err.message });
      }
    },
  );

  // Get current user
  app.get(
    '/me',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const user = await authService.getMe(request.user!.userId);
        return reply.send({ success: true, data: user });
      } catch (err: any) {
        return reply.status(404).send({ success: false, error: err.message });
      }
    },
  );
}
