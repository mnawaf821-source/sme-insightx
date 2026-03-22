import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, type WidgetConfig } from '../api/dashboard.api';
import { QUERY_KEYS } from '@sme-insightx/shared';

export function useDashboards() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARDS,
    queryFn: () => dashboardApi.list(),
  });
}

export function useDashboard(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.DASHBOARD(id) : ['dashboards', 'none'],
    queryFn: () => dashboardApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      dashboardApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS });
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dashboardApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARDS });
    },
  });
}

export function useAddWidget(dashboardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: 'chart' | 'table' | 'metric' | 'text';
      title: string;
      config: WidgetConfig;
      position: { x: number; y: number; w: number; h: number };
    }) => dashboardApi.addWidget(dashboardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD(dashboardId),
      });
    },
  });
}

export function useUpdateWidget(dashboardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      widgetId,
      data,
    }: {
      widgetId: string;
      data: { title?: string; config?: WidgetConfig; position?: any };
    }) => dashboardApi.updateWidget(dashboardId, widgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD(dashboardId),
      });
    },
  });
}

export function useDeleteWidget(dashboardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widgetId: string) =>
      dashboardApi.deleteWidget(dashboardId, widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD(dashboardId),
      });
    },
  });
}

export function useChartData(fileId: string | undefined) {
  return useQuery({
    queryKey: ['chart-data', fileId],
    queryFn: () => dashboardApi.getChartData(fileId!),
    enabled: !!fileId,
  });
}
