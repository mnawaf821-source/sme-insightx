import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
}

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
  breakdown?: ScoreBreakdown;
  reasoning?: string;
}

export function MatchScoreBadge({ score, size = 'md', breakdown, reasoning }: MatchScoreBadgeProps) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const color =
    score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  const barColor =
    score >= 80 ? 'bg-green-500'
    : score >= 50 ? 'bg-yellow-500'
    : 'bg-red-500';

  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="relative inline-block">
      <button
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
          color,
          sizeClass,
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {/* Mini progress bar */}
        <span className="relative inline-flex h-1.5 w-8 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <span
            className={cn('absolute inset-y-0 left-0 rounded-full transition-all', barColor)}
            style={{ width: `${score}%` }}
          />
        </span>
        {score}%
      </button>

      {/* Tooltip with breakdown */}
      {showTooltip && (breakdown || reasoning) && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2">
          <div className="w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold">{t('hr.score_breakdown')}</p>

            {breakdown && (
              <div className="space-y-2">
                <ScoreRow label={t('hr.skills_match')} value={breakdown.skills} />
                <ScoreRow label={t('hr.experience_match')} value={breakdown.experience} />
                <ScoreRow label={t('hr.education_match')} value={breakdown.education} />
              </div>
            )}

            {reasoning && (
              <p className="mt-2 border-t border-[hsl(var(--border))] pt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                {reasoning}
              </p>
            )}

            {/* Arrow */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[hsl(var(--border))]" />
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
