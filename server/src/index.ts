import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config.js';
import { errorHandler } from './middleware/error.js';
import { authRoutes } from './routes/auth.routes.js';
import { fileRoutes } from './routes/files.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { hrRoutes } from './routes/hr.routes.js';

const app = Fastify({
  logger:
    env.NODE_ENV === 'development'
      ? { level: 'info', transport: { target: 'pino-pretty' } }
      : { level: 'info' },
});

// ─── Plugins ───────────────────────────────────────────────────────────────

await app.register(cors, {
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

// ─── Error Handler ──────────────────────────────────────────────────────────

app.setErrorHandler(errorHandler);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV,
}));

// ─── Routes ─────────────────────────────────────────────────────────────────

app.register(authRoutes, { prefix: '/api/auth' });
app.register(fileRoutes, { prefix: '/api/files' });
app.register(dashboardRoutes, { prefix: '/api/dashboards' });
app.register(aiRoutes, { prefix: '/api/ai' });
app.register(hrRoutes, { prefix: '/api/hr' });

// ─── Start Server ──────────────────────────────────────────────────────────

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Server running on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
