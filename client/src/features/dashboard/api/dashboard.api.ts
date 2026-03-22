import { api } from '../../../lib/api';
import type { ApiResponse } from '@sme-insightx/shared';

export interface Dashboard {
  id: string;
  organizationId: string;
  createdById: string | null;
  name: string;
  description: string | null;
  layout: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  widgets: Widget[];
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
  createdAt: string;
  updatedAt: string;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  fileId?: string;
  xColumn?: string;
  yColumn?: string;
  columns?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  text?: string;
  metricColumn?: string;
  metricAggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ChartData {
  columns: Array<{ name: string; type: string }>;
  rows: Record<string, unknown>[];
  rowCount: number;
}

export const dashboardApi = {
  async list(): Promise<Dashboard[]> {
    const res = await api.get<ApiResponse<Dashboard[]>>('/dashboards');
    return res.data.data!;
  },

  async get(id: string): Promise<Dashboard> {
    const res = await api.get<ApiResponse<Dashboard>>(`/dashboards/${id}`);
    return res.data.data!;
  },

  async create(data: { name: string; description?: string }): Promise<Dashboard> {
    const res = await api.post<ApiResponse<Dashboard>>('/dashboards', data);
    return res.data.data!;
  },

  async update(id: string, data: { name?: string; description?: string }): Promise<Dashboard> {
    const res = await api.put<ApiResponse<Dashboard>>(`/dashboards/${id}`, data);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/dashboards/${id}`);
  },

  async addWidget(
    dashboardId: string,
    data: {
      type: Widget['type'];
      title: string;
      config: WidgetConfig;
      position: { x: number; y: number; w: number; h: number };
    },
  ): Promise<Widget> {
    const res = await api.post<ApiResponse<Widget>>(
      `/dashboards/${dashboardId}/widgets`,
      data,
    );
    return res.data.data!;
  },

  async updateWidget(
    dashboardId: string,
    widgetId: string,
    data: { title?: string; config?: WidgetConfig; position?: Widget['position'] },
  ): Promise<Widget> {
    const res = await api.put<ApiResponse<Widget>>(
      `/dashboards/${dashboardId}/widgets/${widgetId}`,
      data,
    );
    return res.data.data!;
  },

  async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    await api.delete(`/dashboards/${dashboardId}/widgets/${widgetId}`);
  },

  async getChartData(fileId: string): Promise<ChartData> {
    const res = await api.get<ApiResponse<ChartData>>(`/dashboards/data/${fileId}`);
    return res.data.data!;
  },
};
