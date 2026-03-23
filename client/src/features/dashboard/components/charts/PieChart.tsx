import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(199, 89%, 48%)',
  'hsl(25, 95%, 53%)',
  'hsl(173, 80%, 40%)',
];

interface PieChartProps {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
}

function truncateLabel(value: string, maxLen = 15): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 1) + '…';
}

export function PieChart({ data, nameKey, valueKey }: PieChartProps) {
  const chartData = data.map((row) => ({
    name: truncateLabel(String(row[nameKey] ?? '')),
    value: Number(row[valueKey]) || 0,
  }));

  // Limit to top 8 slices + "Other" to keep pie chart readable
  let displayData = chartData;
  if (chartData.length > 8) {
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 7);
    const otherValue = sorted.slice(7).reduce((sum, d) => sum + d.value, 0);
    displayData = [...top, { name: 'Other', value: otherValue }];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={displayData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
          labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
        >
          {displayData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [value.toLocaleString(), valueKey]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px' }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
