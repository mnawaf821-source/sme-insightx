import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
}

function formatAxisTick(value: string): string {
  if (value.length <= 12) return value;
  return value.slice(0, 11) + '…';
}

export function LineChart({ data, xKey, yKey }: LineChartProps) {
  const chartData = data.map((row) => ({
    [xKey]: String(row[xKey] ?? ''),
    [yKey]: Number(row[yKey]) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
