import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
}

function truncateLabel(value: string, maxLen = 12): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 1) + '…';
}

function formatAxisTick(value: string): string {
  // Truncate long labels to prevent overlap
  return truncateLabel(value, 12);
}

export function BarChart({ data, xKey, yKey }: BarChartProps) {
  const chartData = data.map((row) => ({
    [xKey]: String(row[xKey] ?? ''),
    [yKey]: Number(row[yKey]) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={formatAxisTick}
          interval={chartData.length > 15 ? 'preserveStartEnd' : 0}
          angle={chartData.length > 8 ? -35 : 0}
          textAnchor={chartData.length > 8 ? 'end' : 'middle'}
          height={chartData.length > 8 ? 50 : 30}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [value.toLocaleString(), yKey]}
          labelFormatter={(label: string) => `${xKey}: ${label}`}
        />
        <Bar
          dataKey={yKey}
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
