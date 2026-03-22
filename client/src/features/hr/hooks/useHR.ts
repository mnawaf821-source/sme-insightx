import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '../api/hr.api';

export function useJobs() {
  return useQuery({ queryKey: ['hr', 'jobs'], queryFn: () => hrApi.getJobs() });
}

export function useJob(id: string | undefined) {
  return useQuery({ queryKey: ['hr', 'jobs', id], queryFn: () => hrApi.getJob(id!), enabled: !!id });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createJob(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'jobs'] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrApi.updateJob(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'jobs'] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'jobs'] }),
  });
}

export function useCandidates(params?: { jobId?: string; status?: string }) {
  return useQuery({
    queryKey: ['hr', 'candidates', params],
    queryFn: () => hrApi.getCandidates(params),
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => hrApi.createCandidate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'candidates'] });
      qc.invalidateQueries({ queryKey: ['hr', 'pipeline'] });
    },
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.deleteCandidate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'candidates'] });
      qc.invalidateQueries({ queryKey: ['hr', 'pipeline'] });
    },
  });
}

export function useMoveStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      hrApi.moveStage(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'candidates'] });
      qc.invalidateQueries({ queryKey: ['hr', 'pipeline'] });
      qc.invalidateQueries({ queryKey: ['hr', 'analytics'] });
    },
  });
}

export function usePipeline(jobId?: string) {
  return useQuery({
    queryKey: ['hr', 'pipeline', jobId],
    queryFn: () => hrApi.getPipeline(jobId),
  });
}

export function useAnalytics() {
  return useQuery({ queryKey: ['hr', 'analytics'], queryFn: () => hrApi.getAnalytics() });
}

export function useMatchCandidate() {
  return useMutation({ mutationFn: (id: string) => hrApi.matchCandidate(id) });
}
