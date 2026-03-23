import { useState } from 'react';
import { MoreHorizontal, Trash2, GripVertical, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { KpiCard } from './charts/KpiCard';
import { useChartData } from '../hooks/useDashboard';
import type { Widget, ChartData } from '../api/dashboard.api';

interface WidgetCardProps {
  widget: Widget;
  onDelete?: () => void;
  onEdit?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function aggregateData(
  rows: Record<string, unknown>[],
  aggregation: string,
  valueColumn: string,
): number {
  const values = rows.map((r) => Number(r[valueColumn]) || 0);

  switch (aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

function WidgetContent({ widget, data }: { widget: Widget; data: ChartData }) {
  const { config, type } = widget;

  if (type === 'text') {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-[hsl(var(--muted-foreground))]">
        {config.text || 'Text widget — click to edit'}
      </div>
    );
  }

  if (type === 'metric') {
    const col = config.metricColumn || data.columns[0]?.name || '';
    const agg = config.metricAggregation || 'sum';
    const value = aggregateData(data.rows, agg, col);

    return (
      <div className="p-2">
        <KpiCard
          title={widget.title}
          value={value}
          description={`${agg} of ${col}`}
        />
      </div>
    );
  }

  if (type === 'table') {
    const cols = config.columns || data.columns.slice(0, 5).map((c) => c.name);
    return (
      <div className="overflow-auto p-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {cols.map((col) => (
                <th key={col} className="px-2 py-1.5 text-left font-medium text-[hsl(var(--muted-foreground))]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0">
                {cols.map((col) => (
                  <td key={col} className="px-2 py-1.5">
                    {String(row[col] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.rows.length > 10 && (
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Showing 10 of {data.rows.length} rows
          </p>
        )}
      </div>
    );
  }

  // Chart types
  const xKey = config.xColumn || data.columns[0]?.name || 'x';
  const yKey = config.yColumn || data.columns.find((c) => c.type === 'number')?.name || 'y';
  const chartType = config.chartType || 'bar';

  if (chartType === 'line' || chartType === 'area') {
    return (
      <div className="h-full p-2">
        <LineChart data={data.rows} xKey={xKey} yKey={yKey} />
      </div>
    );
  }

  if (chartType === 'pie') {
    return (
      <div className="h-full p-2">
        <PieChart data={data.rows} nameKey={xKey} valueKey={yKey} />
      </div>
    );
  }

  // Default: bar
  return (
    <div className="h-full p-2">
      <BarChart data={data.rows} xKey={xKey} yKey={yKey} />
    </div>
  );
}

export function WidgetCard({ widget, onDelete, onEdit, dragHandleProps }: WidgetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { data, isLoading, error } = useChartData(widget.config.fileId);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <div className="flex items-center gap-2" {...dragHandleProps}>
          <GripVertical className="h-4 w-4 cursor-grab text-[hsl(var(--muted-foreground))]" />
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 w-36 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-md">
              {onEdit && (
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[hsl(var(--muted))]"
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                  Edit Widget
                </button>
              )}
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-[hsl(var(--muted))]"
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 pb-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {widget.type === 'text'
                ? 'Text widget'
                : 'No data — configure a data source'}
            </p>
          </div>
        ) : data ? (
          <WidgetContent widget={widget} data={data} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              No data source configured
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
