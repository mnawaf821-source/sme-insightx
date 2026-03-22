import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BarChart3, LineChart, PieChart, Table, Type, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useFiles } from '../../analytics/hooks/useFiles';
import type { WidgetConfig } from '../api/dashboard.api';

const widgetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['chart', 'table', 'metric', 'text']),
  chartType: z.enum(['line', 'bar', 'pie', 'area']).optional(),
  fileId: z.string().optional(),
  xColumn: z.string().optional(),
  yColumn: z.string().optional(),
  metricColumn: z.string().optional(),
  metricAggregation: z.enum(['sum', 'avg', 'count', 'min', 'max']).optional(),
  text: z.string().optional(),
});

type WidgetFormData = z.infer<typeof widgetSchema>;

interface AddWidgetModalProps {
  onAdd: (data: {
    type: 'chart' | 'table' | 'metric' | 'text';
    title: string;
    config: WidgetConfig;
    position: { x: number; y: number; w: number; h: number };
  }) => void;
  onClose: () => void;
}

const WIDGET_TYPES = [
  { type: 'chart', icon: BarChart3, label: 'Chart', description: 'Line, bar, or pie chart' },
  { type: 'table', icon: Table, label: 'Table', description: 'Data table view' },
  { type: 'metric', icon: Hash, label: 'Metric', description: 'Single number KPI' },
  { type: 'text', icon: Type, label: 'Text', description: 'Text note or label' },
] as const;

const CHART_TYPES = [
  { type: 'bar', icon: BarChart3, label: 'Bar' },
  { type: 'line', icon: LineChart, label: 'Line' },
  { type: 'pie', icon: PieChart, label: 'Pie' },
] as const;

export function AddWidgetModal({ onAdd, onClose }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<string>('chart');
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const { data: filesData } = useFiles();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      title: '',
      type: 'chart',
      chartType: 'bar',
    },
  });

  const onSubmit = (formData: WidgetFormData) => {
    const config: WidgetConfig = {};

    if (selectedType === 'chart') {
      config.chartType = selectedChartType as any;
      config.fileId = selectedFileId || undefined;
      config.xColumn = formData.xColumn || undefined;
      config.yColumn = formData.yColumn || undefined;
    } else if (selectedType === 'table') {
      config.fileId = selectedFileId || undefined;
    } else if (selectedType === 'metric') {
      config.fileId = selectedFileId || undefined;
      config.metricColumn = formData.metricColumn || undefined;
      config.metricAggregation = formData.metricAggregation || 'sum';
    } else if (selectedType === 'text') {
      config.text = formData.text || '';
    }

    onAdd({
      type: selectedType as any,
      title: formData.title || `${selectedType} widget`,
      config,
      position: { x: 0, y: 0, w: 6, h: 4 },
    });
  };

  const files = filesData?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Add Widget</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Widget title"
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Widget Type */}
            <div>
              <Label>Type</Label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {WIDGET_TYPES.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors ${
                      selectedType === type
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Type (only for charts) */}
            {selectedType === 'chart' && (
              <div>
                <Label>Chart Type</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {CHART_TYPES.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs transition-colors ${
                        selectedChartType === type
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                      }`}
                      onClick={() => setSelectedChartType(type)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source (for chart, table, metric) */}
            {selectedType !== 'text' && (
              <div>
                <Label>Data Source</Label>
                <select
                  className="mt-1.5 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                >
                  <option value="">Select a file...</option>
                  {files.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.originalName} ({file.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Column config for charts */}
            {selectedType === 'chart' && selectedFileId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="xColumn">X Axis Column</Label>
                  <Input
                    id="xColumn"
                    placeholder="e.g. date"
                    {...register('xColumn')}
                  />
                </div>
                <div>
                  <Label htmlFor="yColumn">Y Axis Column</Label>
                  <Input
                    id="yColumn"
                    placeholder="e.g. revenue"
                    {...register('yColumn')}
                  />
                </div>
              </div>
            )}

            {/* Metric config */}
            {selectedType === 'metric' && selectedFileId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="metricColumn">Column</Label>
                  <Input
                    id="metricColumn"
                    placeholder="e.g. revenue"
                    {...register('metricColumn')}
                  />
                </div>
                <div>
                  <Label>Aggregation</Label>
                  <select
                    className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                    {...register('metricAggregation')}
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                  </select>
                </div>
              </div>
            )}

            {/* Text content */}
            {selectedType === 'text' && (
              <div>
                <Label htmlFor="text">Content</Label>
                <textarea
                  id="text"
                  className="mt-1.5 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Enter text..."
                  {...register('text')}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Widget</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
