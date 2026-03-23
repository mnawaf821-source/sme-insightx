import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  title: string;
  content: string;
  confidence: number;
}

interface InsightsPanelProps {
  insights: Insight[];
  isLoading?: boolean;
  onAnalyze?: () => void;
  canAnalyze?: boolean;
}

const INSIGHT_CONFIG = {
  trend: {
    icon: TrendingUp,
    label: 'Trend Detected',
    description: 'A pattern found in your data',
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  anomaly: {
    icon: AlertTriangle,
    label: 'Warning',
    description: 'Something unusual was detected',
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  recommendation: {
    icon: Lightbulb,
    label: 'Recommendation',
    description: 'Suggested action based on your data',
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  summary: {
    icon: Info,
    label: 'Key Finding',
    description: 'Important data summary',
    border: 'border-l-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
};

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80
      ? 'bg-emerald-500'
      : pct >= 60
        ? 'bg-amber-500'
        : 'bg-red-400';
  const label =
    pct >= 80 ? 'High confidence' : pct >= 60 ? 'Medium confidence' : 'Low confidence';

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs font-medium text-[hsl(var(--muted-foreground))]">
        {label} ({pct}%)
      </span>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.summary;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border border-l-4 ${config.border} ${config.bg} p-4 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 rounded-lg p-2 ${config.iconBg}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <h4 className="mt-1.5 text-sm font-semibold text-[hsl(var(--foreground))]">
            {insight.title}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {insight.content}
          </p>
          {insight.confidence !== undefined && (
            <div className="mt-3">
              <ConfidenceMeter confidence={insight.confidence} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightsPanel({
  insights,
  isLoading,
  onAnalyze,
  canAnalyze,
}: InsightsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Analyzing your data... This may take a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-[hsl(var(--muted))] p-3">
              <Sparkles className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm font-medium">No insights yet</p>
            <p className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
              Upload a file and click analyze. Our AI will identify trends, patterns, and recommendations from your data.
            </p>
            {canAnalyze && onAnalyze && (
              <Button size="sm" className="mt-4" onClick={onAnalyze}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Analyze Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group counts for summary
  const counts = insights.reduce(
    (acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </CardTitle>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {insights.length} finding{insights.length !== 1 ? 's' : ''} from your data
            {counts.trend ? ` · ${counts.trend} trend${counts.trend > 1 ? 's' : ''}` : ''}
            {counts.anomaly ? ` · ${counts.anomaly} warning${counts.anomaly > 1 ? 's' : ''}` : ''}
            {counts.recommendation ? ` · ${counts.recommendation} recommendation${counts.recommendation > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {canAnalyze && onAnalyze && (
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Re-analyze
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} index={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
