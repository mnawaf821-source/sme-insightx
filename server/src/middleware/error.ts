import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: error.flatten().fieldErrors,
    });
  }

  // Fastify validation errors
  if ((error as any).validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: (error as any).validation,
    });
  }

  // Fastify status code errors
  if ((error as any).statusCode) {
    const statusCode = (error as any).statusCode;
    return reply.status(statusCode).send({
      success: false,
      error: error.message,
    });
  }

  // Generic server errors
  console.error('Unhandled error:', error);
  return reply.status(500).send({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message,
  });
}
