import type { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request[target];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace with parsed data (strips unknown fields)
    (request as any)[target] = result.data;
  };
}
