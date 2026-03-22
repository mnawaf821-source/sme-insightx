import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { aiService } from '../services/ai.service.js';
import { dashboardService } from '../services/dashboard.service.js';
import { fileService } from '../services/file.service.js';
import { db } from '../db/index.js';
import { aiInsights, conversations, messages } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export async function aiRoutes(app: FastifyInstance) {
  // Analyze a file and generate insights
  app.post('/analyze/:fileId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const { fileId } = request.params;
      const orgId = request.user.organizationId;

      // Get parsed data
      const data = await fileService.getParsedData(fileId, orgId);
      const file = await fileService.getFile(fileId, orgId);

      // Run AI analysis
      const insights = await aiService.analyzeFile(
        data.columns as Array<{ name: string; type: string }>,
        data.sampleData as Record<string, unknown>[],
        file.originalName,
      );

      // Store insights in DB
      for (const insight of insights) {
        await db.insert(aiInsights).values({
          organizationId: orgId,
          type: insight.type,
          source: fileId,
          title: insight.title,
          content: insight.content,
          metadata: { confidence: insight.confidence },
        });
      }

      return reply.send({ success: true, data: insights });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Natural language query about data
  app.post('/query', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const { question, fileId } = request.body as { question: string; fileId: string };
      const orgId = request.user.organizationId;

      if (!question || !fileId) {
        return reply.status(400).send({ success: false, error: 'question and fileId are required' });
      }

      const data = await fileService.getParsedData(fileId, orgId);

      const result = await aiService.queryData(
        question,
        data.columns as Array<{ name: string; type: string }>,
        data.sampleData as Record<string, unknown>[],
      );

      return reply.send({ success: true, data: result });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Suggest chart type for a file
  app.post('/suggest-chart/:fileId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const orgId = request.user.organizationId;
      const data = await fileService.getParsedData(request.params.fileId, orgId);

      const suggestion = await aiService.suggestChart(
        data.columns as Array<{ name: string; type: string }>,
        data.sampleData as Record<string, unknown>[],
      );

      return reply.send({ success: true, data: suggestion });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Summarize a file
  app.post('/summarize/:fileId', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const orgId = request.user.organizationId;
      const data = await fileService.getParsedData(request.params.fileId, orgId);
      const file = await fileService.getFile(request.params.fileId, orgId);

      const summary = await aiService.summarize(
        data.columns as Array<{ name: string; type: string }>,
        data.sampleData as Record<string, unknown>[],
        file.originalName,
      );

      return reply.send({ success: true, data: { summary } });
    } catch (err: any) {
      const status = err.message?.includes('not found') ? 404 : 500;
      return reply.status(status).send({ success: false, error: err.message });
    }
  });

  // Get stored insights
  app.get('/insights', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const insights = await db
        .select()
        .from(aiInsights)
        .where(eq(aiInsights.organizationId, request.user.organizationId))
        .orderBy(desc(aiInsights.createdAt))
        .limit(50);

      return reply.send({ success: true, data: insights });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Chat completion
  app.post('/chat', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const { conversationId, message: userMessage, fileId } = request.body as {
        conversationId?: string;
        message: string;
        fileId?: string;
      };
      const orgId = request.user.organizationId;
      const userId = request.user.userId;

      if (!userMessage) {
        return reply.status(400).send({ success: false, error: 'message is required' });
      }

      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        const [conv] = await db
          .insert(conversations)
          .values({
            organizationId: orgId,
            userId,
            title: userMessage.slice(0, 100),
          })
          .returning();
        convId = conv.id;
      }

      // Save user message
      await db.insert(messages).values({
        conversationId: convId!,
        role: 'user',
        content: userMessage,
      });

      // Get conversation history
      const history = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, convId!))
        .orderBy(messages.createdAt)
        .limit(20);

      const chatMessages = history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Get data context if fileId provided
      let dataContext;
      if (fileId) {
        try {
          const data = await fileService.getParsedData(fileId, orgId);
          dataContext = {
            columns: data.columns as Array<{ name: string; type: string }>,
            rows: data.sampleData as Record<string, unknown>[],
          };
        } catch {
          // File not found or not parsed — continue without context
        }
      }

      // Get AI response
      const response = await aiService.chat(chatMessages, dataContext);

      // Save assistant message
      await db.insert(messages).values({
        conversationId: convId!,
        role: 'assistant',
        content: response,
      });

      return reply.send({
        success: true,
        data: {
          conversationId: convId,
          response,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // List conversations
  app.get('/conversations', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const convs = await db
        .select()
        .from(conversations)
        .where(eq(conversations.organizationId, request.user.organizationId))
        .orderBy(desc(conversations.updatedAt))
        .limit(20);

      return reply.send({ success: true, data: convs });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Get conversation messages
  app.get('/conversations/:id/messages', {
    preHandler: [authMiddleware],
  }, async (request: any, reply) => {
    try {
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, request.params.id))
        .orderBy(messages.createdAt);

      return reply.send({ success: true, data: msgs });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
