import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { QUERY_KEYS } from '@sme-insightx/shared';

export function useFiles(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.FILES, page, limit],
    queryFn: () => analyticsApi.getFiles(page, limit),
  });
}

export function useFile(id: string | undefined) {
  return useQuery({
    queryKey: ['files', id],
    queryFn: () => analyticsApi.getFile(id!),
    enabled: !!id,
  });
}

export function useFileData(fileId: string | undefined) {
  return useQuery({
    queryKey: ['files', fileId, 'data'],
    queryFn: () => analyticsApi.getFileData(fileId!),
    enabled: !!fileId,
    retry: false,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsApi.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    },
  });
}

export function useParseFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsApi.triggerParse(id),
    onSuccess: (_data, fileId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
      queryClient.invalidateQueries({ queryKey: ['files', fileId, 'data'] });
    },
  });
}
