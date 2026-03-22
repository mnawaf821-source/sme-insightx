import { api } from '../../../lib/api';

// Use local types to avoid conflicts with shared
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  title: string;
  content: string;
  confidence: number;
}

export interface QueryResult {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'table';
  xColumn: string;
  yColumn: string;
  title: string;
  reasoning: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const aiApi = {
  async analyzeFile(fileId: string): Promise<Insight[]> {
    const res = await api.post<ApiResponse<Insight[]>>(`/ai/analyze/${fileId}`);
    return res.data.data!;
  },

  async queryData(question: string, fileId: string): Promise<QueryResult> {
    const res = await api.post<ApiResponse<QueryResult>>('/ai/query', {
      question,
      fileId,
    });
    return res.data.data!;
  },

  async suggestChart(fileId: string): Promise<QueryResult> {
    const res = await api.post<ApiResponse<QueryResult>>(
      `/ai/suggest-chart/${fileId}`,
    );
    return res.data.data!;
  },

  async summarize(fileId: string): Promise<string> {
    const res = await api.post<ApiResponse<{ summary: string }>>(
      `/ai/summarize/${fileId}`,
    );
    return res.data.data!.summary;
  },

  async getInsights(): Promise<Insight[]> {
    const res = await api.get<ApiResponse<Insight[]>>('/ai/insights');
    return res.data.data!;
  },

  async chat(
    message: string,
    conversationId?: string,
    fileId?: string,
  ): Promise<{ conversationId: string; response: string }> {
    const res = await api.post<
      ApiResponse<{ conversationId: string; response: string }>
    >('/ai/chat', { message, conversationId, fileId });
    return res.data.data!;
  },

  async getConversations(): Promise<Conversation[]> {
    const res = await api.get<ApiResponse<Conversation[]>>('/ai/conversations');
    return res.data.data!;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await api.get<ApiResponse<ChatMessage[]>>(
      `/ai/conversations/${conversationId}/messages`,
    );
    return res.data.data!;
  },
};
