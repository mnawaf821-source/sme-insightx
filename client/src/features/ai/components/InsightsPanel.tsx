import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileText,
  Sparkles,
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

const INSIGHT_ICONS = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  recommendation: Lightbulb,
  summary: FileText,
};

const INSIGHT_COLORS = {
  trend: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  anomaly: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
  recommendation: 'text-green-500 bg-green-50 dark:bg-green-950/30',
  summary: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
};

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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-md bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
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
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="mb-2 h-8 w-8 text-[hsl(var(--muted-foreground))]/50" />
            <p className="text-sm font-medium">No insights yet</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Upload a file and analyze it to get AI-generated insights
            </p>
            {canAnalyze && onAnalyze && (
              <Button size="sm" className="mt-3" onClick={onAnalyze}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Analyze Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Insights ({insights.length})
        </CardTitle>
        {canAnalyze && onAnalyze && (
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Re-analyze
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = INSIGHT_ICONS[insight.type] || FileText;
            const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.summary;

            return (
              <div
                key={i}
                className="flex gap-3 rounded-md border border-[hsl(var(--border))] p-3"
              >
                <div className={`rounded-md p-1.5 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <span className="rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {insight.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {insight.content}
                  </p>
                  {insight.confidence !== undefined && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
