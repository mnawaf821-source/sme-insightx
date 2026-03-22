import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { QUERY_KEYS } from '@sme-insightx/shared';

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useFileUpload() {
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const id = `${file.name}-${Date.now()}`;

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(id, { file, progress: 0, status: 'uploading' });
        return next;
      });

      try {
        const result = await analyticsApi.uploadFile(file, (percent) => {
          setUploads((prev) => {
            const next = new Map(prev);
            const current = next.get(id);
            if (current) {
              next.set(id, { ...current, progress: percent });
            }
            return next;
          });
        });

        setUploads((prev) => {
          const next = new Map(prev);
          const current = next.get(id);
          if (current) {
            next.set(id, { ...current, progress: 100, status: 'success' });
          }
          return next;
        });

        return result;
      } catch (err: any) {
        setUploads((prev) => {
          const next = new Map(prev);
          const current = next.get(id);
          if (current) {
            next.set(id, { ...current, status: 'error', error: err.message });
          }
          return next;
        });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES });
    },
  });

  const uploadFile = useCallback(
    (file: File) => mutation.mutate(file),
    [mutation],
  );

  const uploadFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        mutation.mutate(file);
      }
    },
    [mutation],
  );

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploadFile,
    uploadFiles,
    uploads,
    clearUploads,
    isUploading: mutation.isPending,
  };
}
