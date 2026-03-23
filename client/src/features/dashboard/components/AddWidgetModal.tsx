import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BarChart3, LineChart, PieChart, Table, Type, Hash, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useFiles } from '../../analytics/hooks/useFiles';
import { useChartData } from '../hooks/useDashboard';
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

/** Columns that are likely IDs, timestamps, or not useful for charts */
const ID_COLUMN_PATTERNS = [
  /^id$/i,
  /^_?id$/i,
  /_id$/i,
  /^uuid$/i,
  /^guid$/i,
  /^pk$/i,
  /^primary_key/i,
  /^row_?num/i,
  /^index$/i,
  /^created_at$/i,
  /^updated_at$/i,
  /^timestamp$/i,
];

function isIdColumn(name: string): boolean {
  return ID_COLUMN_PATTERNS.some((p) => p.test(name));
}

function ColumnSelect({
  label,
  columns,
  value,
  onChange,
  filterType,
  idColumns,
  placeholder,
}: {
  label: string;
  columns: Array<{ name: string; type: string }>;
  value: string;
  onChange: (val: string) => void;
  filterType?: 'string' | 'number' | 'date';
  idColumns: string[];
  placeholder?: string;
}) {
  const filtered = columns.filter((c) => {
    if (idColumns.includes(c.name)) return false;
    if (filterType && c.type !== filterType && filterType !== 'string') {
      // For number: also allow if type is unknown
      if (filterType === 'number' && c.type === 'string') return false;
    }
    return true;
  });

  return (
    <div>
      <Label>{label}</Label>
      <select
        className="mt-1.5 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}...`}</option>
        {filtered.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
            <span className="text-[hsl(var(--muted-foreground))]">
              {' '}({col.type})
            </span>
          </option>
        ))}
      </select>
    </div>
  );
}

export function AddWidgetModal({ onAdd, onClose }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<string>('chart');
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');
  const [metricColumn, setMetricColumn] = useState<string>('');
  const { data: filesData } = useFiles();
  const { data: chartData, isLoading: columnsLoading } = useChartData(
    selectedFileId || undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WidgetFormData>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      title: '',
      type: 'chart',
      chartType: 'bar',
    },
  });

  const columns = chartData?.columns ?? [];
  const idColumns = useMemo(
    () => columns.filter((c) => isIdColumn(c.name)).map((c) => c.name),
    [columns],
  );

  // Auto-select best columns when data loads
  useEffect(() => {
    if (columns.length === 0) return;

    const usable = columns.filter((c) => !isIdColumn(c.name));
    if (usable.length === 0) return;

    // Auto-pick X: first string or date column
    if (!xColumn) {
      const xCandidate =
        usable.find((c) => c.type === 'string' || c.type === 'date') || usable[0];
      setXColumn(xCandidate.name);
    }

    // Auto-pick Y: first number column
    if (!yColumn) {
      const yCandidate = usable.find((c) => c.type === 'number');
      if (yCandidate) setYColumn(yCandidate.name);
    }

    // Auto-pick metric column
    if (!metricColumn) {
      const mCandidate = usable.find((c) => c.type === 'number');
      if (mCandidate) setMetricColumn(mCandidate.name);
    }
  }, [columns, xColumn, yColumn, metricColumn]);

  const onSubmit = (formData: WidgetFormData) => {
    const config: WidgetConfig = {};

    if (selectedType === 'chart') {
      config.chartType = selectedChartType as any;
      config.fileId = selectedFileId || undefined;
      config.xColumn = xColumn || formData.xColumn || undefined;
      config.yColumn = yColumn || formData.yColumn || undefined;
    } else if (selectedType === 'table') {
      config.fileId = selectedFileId || undefined;
    } else if (selectedType === 'metric') {
      config.fileId = selectedFileId || undefined;
      config.metricColumn = metricColumn || formData.metricColumn || undefined;
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
                  onChange={(e) => {
                    setSelectedFileId(e.target.value);
                    setXColumn('');
                    setYColumn('');
                    setMetricColumn('');
                  }}
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
                {columnsLoading ? (
                  <div className="col-span-2 flex items-center gap-2 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading columns...
                  </div>
                ) : columns.length > 0 ? (
                  <>
                    <ColumnSelect
                      label="X Axis (categories)"
                      columns={columns}
                      value={xColumn}
                      onChange={setXColumn}
                      idColumns={idColumns}
                      placeholder="Select category column..."
                    />
                    <ColumnSelect
                      label="Y Axis (values)"
                      columns={columns}
                      value={yColumn}
                      onChange={setYColumn}
                      filterType="number"
                      idColumns={idColumns}
                      placeholder="Select value column..."
                    />
                  </>
                ) : (
                  <p className="col-span-2 text-xs text-[hsl(var(--muted-foreground))]">
                    No parsed data found. Parse the file first.
                  </p>
                )}
              </div>
            )}

            {/* Metric config */}
            {selectedType === 'metric' && selectedFileId && (
              <div className="grid grid-cols-2 gap-3">
                {columnsLoading ? (
                  <div className="col-span-2 flex items-center gap-2 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading columns...
                  </div>
                ) : columns.length > 0 ? (
                  <>
                    <ColumnSelect
                      label="Column"
                      columns={columns}
                      value={metricColumn}
                      onChange={setMetricColumn}
                      filterType="number"
                      idColumns={idColumns}
                      placeholder="Select column..."
                    />
                    <div>
                      <Label>Aggregation</Label>
                      <select
                        className="mt-1.5 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                        {...register('metricAggregation')}
                      >
                        <option value="sum">Sum</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="min">Min</option>
                        <option value="max">Max</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <p className="col-span-2 text-xs text-[hsl(var(--muted-foreground))]">
                    No parsed data found. Parse the file first.
                  </p>
                )}
              </div>
            )}

            {/* Table columns info */}
            {selectedType === 'table' && selectedFileId && columns.length > 0 && (
              <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-3">
                <p className="text-xs font-medium">Available columns:</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {columns
                    .filter((c) => !isIdColumn(c.name))
                    .map((c) => c.name)
                    .join(', ')}
                </p>
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
