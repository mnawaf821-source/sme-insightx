import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useAnalyzeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => aiApi.analyzeFile(fileId),
    onSuccess: (_data, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights', fileId] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
    },
  });
}

export function useFileInsights(fileId: string | undefined) {
  return useQuery({
    queryKey: ['ai', 'insights', fileId],
    queryFn: () => aiApi.analyzeFile(fileId!),
    enabled: !!fileId,
    retry: false,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiApi.getInsights(),
  });
}

export function useQueryData() {
  return useMutation({
    mutationFn: ({ question, fileId }: { question: string; fileId: string }) =>
      aiApi.queryData(question, fileId),
  });
}

export function useSuggestChart() {
  return useMutation({
    mutationFn: (fileId: string) => aiApi.suggestChart(fileId),
  });
}

export function useSummarize() {
  return useMutation({
    mutationFn: (fileId: string) => aiApi.summarize(fileId),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: () => aiApi.getConversations(),
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['ai', 'conversations', conversationId, 'messages'],
    queryFn: () => aiApi.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      message,
      conversationId,
      fileId,
    }: {
      message: string;
      conversationId?: string;
      fileId?: string;
    }) => aiApi.chat(message, conversationId, fileId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['ai', 'conversations', data.conversationId, 'messages'],
      });
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
  });
}
