import { Brain, FileText, BarChart3, TrendingUp, TrendingDown, Minus, ArrowRight, Lightbulb, AlertTriangle, Sparkles, Send, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { BarChart } from '../../dashboard/components/charts/BarChart';
import { LineChart } from '../../dashboard/components/charts/LineChart';
import { PieChart } from '../../dashboard/components/charts/PieChart';
import { useChartData } from '../../dashboard/hooks/useDashboard';
import { useDashboards, useAddWidget } from '../../dashboard/hooks/useDashboard';
import type { AnalysisResult as AnalysisData, KeyMetric, Insight, Recommendation, AnalysisChart } from '../api/ai.api';
import type { WidgetConfig } from '../../dashboard/api/dashboard.api';

// ─── Add to Dashboard helper ────────────────────────────────────────────────

function AddToDashboardButton({
  widgetData,
}: {
  widgetData: { type: 'chart' | 'metric'; title: string; config: WidgetConfig };
}) {
  const { data: dashboards } = useDashboards();
  const [selectedDash, setSelectedDash] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  const [added, setAdded] = useState(false);

  const dashboardList = dashboards ?? [];
  const addWidget = useAddWidget(selectedDash);

  const handleAdd = () => {
    if (!selectedDash) return;
    addWidget.mutate(
      {
        type: widgetData.type === 'metric' ? 'metric' : 'chart',
        title: widgetData.title,
        config: widgetData.config,
        position: { x: 0, y: 0, w: widgetData.type === 'metric' ? 3 : 6, h: widgetData.type === 'metric' ? 2 : 4 },
      },
      {
        onSuccess: () => {
          setAdded(true);
          setShowPicker(false);
          setTimeout(() => setAdded(false), 2000);
        },
      },
    );
  };

  if (added) {
    return (
      <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        ✓ Added
      </span>
    );
  }

  if (showPicker) {
    return (
      <div className="flex items-center gap-1.5">
        <select
          className="h-7 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 text-[11px]"
          value={selectedDash}
          onChange={(e) => setSelectedDash(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Dashboard…</option>
          {dashboardList.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <Button
          size="sm"
          className="h-7 px-2 text-[11px]"
          disabled={!selectedDash || addWidget.isPending}
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
        >
          {addWidget.isPending ? '…' : 'Add'}
        </Button>
        <button
          className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(false);
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 text-[11px] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
      onClick={(e) => {
        e.stopPropagation();
        setShowPicker(true);
      }}
    >
      <Plus className="h-3 w-3" />
      Add to Dashboard
    </button>
  );
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

const LOADING_STEPS = [
  { icon: FileText, label: 'Reading file content…' },
  { icon: BarChart3, label: 'Extracting patterns…' },
  { icon: TrendingUp, label: 'Identifying trends…' },
  { icon: Lightbulb, label: 'Generating recommendations…' },
];

function AnalyzingLoader() {
  const [activeStep, setActiveStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  });

  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 py-4">
        {LOADING_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`rounded-full p-2 transition-colors ${isActive ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({ metric, index, fileId }: { metric: KeyMetric; index: number; fileId: string }) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{metric.title}</p>
          <AddToDashboardButton
            widgetData={{
              type: 'metric',
              title: metric.title,
              config: {
                fileId,
                metricColumn: '',
                metricAggregation: 'sum',
              },
            }}
          />
        </div>
        <p className="mt-1 text-2xl font-bold tracking-tight">{metric.value}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>{metric.trendValue}</span>
        </div>
        <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{metric.description}</p>
      </CardContent>
    </Card>
  );
}

// ─── Insight Card ───────────────────────────────────────────────────────────

const INSIGHT_CONFIG = {
  trend: { icon: TrendingUp, label: 'Trend', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', border: 'border-l-blue-500' },
  anomaly: { icon: AlertTriangle, label: 'Warning', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', border: 'border-l-amber-500' },
  recommendation: { icon: Lightbulb, label: 'Tip', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', border: 'border-l-emerald-500' },
  summary: { icon: FileText, label: 'Finding', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', border: 'border-l-purple-500' },
};

function InsightCard({ insight }: { insight: Insight }) {
  const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.summary;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border border-l-4 ${config.border} bg-[hsl(var(--card))] p-4 transition-shadow hover:shadow-md`}>
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0 rounded-lg bg-[hsl(var(--muted))] p-1.5">
          <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{insight.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {insight.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Recommendations List ───────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', label: 'High Priority' },
  medium: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', label: 'Medium Priority' },
  low: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', label: 'Low Priority' },
};

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const pcfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-5 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <div className="mt-0.5 shrink-0">
          <ArrowRight className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{rec.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pcfg.badge}`}>
              {pcfg.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{rec.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[hsl(var(--muted-foreground))]">
            {rec.impact && (
              <span><strong className="text-[hsl(var(--foreground))]">Impact:</strong> {rec.impact}</span>
            )}
            {rec.action && (
              <span><strong className="text-[hsl(var(--foreground))]">Next step:</strong> {rec.action}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chart Card (renders actual chart from data) ────────────────────────────

function ChartCard({ chart, fileId }: { chart: AnalysisChart; fileId: string }) {
  const { data } = useChartData(fileId);

  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading chart…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{chart.title}</h3>
          <AddToDashboardButton
            widgetData={{
              type: 'chart',
              title: chart.title,
              config: {
                fileId,
                chartType: chart.type,
                xColumn: chart.xColumn,
                yColumn: chart.yColumn,
              },
            }}
          />
        </div>
        <div className="h-56">
          {chart.type === 'line' ? (
            <LineChart data={data.rows} xKey={chart.xColumn} yKey={chart.yColumn} />
          ) : chart.type === 'pie' ? (
            <PieChart data={data.rows} nameKey={chart.xColumn} valueKey={chart.yColumn} />
          ) : (
            <BarChart data={data.rows} xKey={chart.xColumn} yKey={chart.yColumn} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Follow-Up Suggestions ──────────────────────────────────────────────────

const FOLLOW_UP_QUESTIONS = [
  'What is the most important action I should take?',
  'What are the biggest risks in this data?',
  'Which category is growing fastest?',
  'What should I focus on next quarter?',
];

function FollowUpSuggestions({ onAsk }: { onAsk: (q: string) => void }) {
  const [customQ, setCustomQ] = useState('');

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="font-semibold">Ask follow-up questions</h3>
        </div>
        <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">Get deeper insights about your data</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {FOLLOW_UP_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => onAsk(q)}
              className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs transition-colors hover:bg-[hsl(var(--muted))]"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customQ}
            onChange={(e) => setCustomQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customQ.trim()) {
                onAsk(customQ.trim());
                setCustomQ('');
              }
            }}
            placeholder="Ask anything about this data…"
            className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--primary))]"
          />
          <Button
            size="sm"
            onClick={() => {
              if (customQ.trim()) {
                onAsk(customQ.trim());
                setCustomQ('');
              }
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main AnalysisResults Component ─────────────────────────────────────────

interface AnalysisResultsProps {
  analysis: AnalysisData | null | undefined;
  isLoading?: boolean;
  fileId: string;
  onAnalyze?: () => void;
  canAnalyze?: boolean;
  onAskQuestion?: (question: string) => void;
}

export function AnalysisResults({
  analysis,
  isLoading,
  fileId,
  onAnalyze,
  canAnalyze,
  onAskQuestion,
}: AnalysisResultsProps) {
  if (isLoading) {
    return <AnalyzingLoader />;
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-[hsl(var(--muted))] p-4">
          <Sparkles className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="text-lg font-semibold">No analysis yet</h3>
        <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          Upload a file and click analyze. Our AI will identify trends, patterns, key metrics, and recommendations from your data.
        </p>
        {canAnalyze && onAnalyze && (
          <Button className="mt-4" onClick={onAnalyze}>
            <Sparkles className="mr-1.5 h-4 w-4" />
            Analyze with AI
          </Button>
        )}
      </div>
    );
  }

  const { summary, keyMetrics, insights, recommendations, charts } = analysis;

  return (
    <div className="space-y-8 pb-12">
      {canAnalyze && onAnalyze && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Re-analyze
          </Button>
        </div>
      )}

      {/* 1. Summary */}
      {summary && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Brain className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            <h2 className="text-lg font-semibold">Summary</h2>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{summary}</p>
        </div>
      )}

      {/* 2. Key Metrics */}
      {keyMetrics.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="font-semibold">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {keyMetrics.map((metric, i) => (
              <MetricCard key={i} metric={metric} index={i} fileId={fileId} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Charts */}
      {charts.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="font-semibold">Charts</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {charts.map((chart, i) => (
              <ChartCard key={i} chart={chart} fileId={fileId} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Insights */}
      {insights.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="font-semibold">Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="font-semibold">Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Follow-Up Chat */}
      {onAskQuestion && (
        <FollowUpSuggestions onAsk={onAskQuestion} />
      )}
    </div>
  );
}
