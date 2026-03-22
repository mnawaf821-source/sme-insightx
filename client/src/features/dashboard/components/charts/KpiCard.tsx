import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  change?: number; // percentage change
  description?: string;
}

function formatValue(val: number | string): string {
  if (typeof val === 'string') return val;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

export function KpiCard({ title, value, suffix, prefix, change, description }: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div>
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight">
          {prefix}
          {formatValue(value)}
          {suffix && <span className="ml-0.5 text-sm font-normal text-[hsl(var(--muted-foreground))]">{suffix}</span>}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {change !== undefined && (
          <>
            {isPositive && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                <TrendingUp className="h-3 w-3" />
                +{change.toFixed(1)}%
              </span>
            )}
            {isNegative && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
                <TrendingDown className="h-3 w-3" />
                {change.toFixed(1)}%
              </span>
            )}
            {isNeutral && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                <Minus className="h-3 w-3" />
                0%
              </span>
            )}
          </>
        )}
        {description && (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
