import { useTranslation } from 'react-i18next';
import { ChevronRight, Eye, ArrowRight, RotateCcw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { MatchScoreBadge } from './MatchScoreBadge';
import { cn } from '../../../lib/utils';

interface TopCandidate {
  id: string;
  name: string;
  email: string;
  score: number;
  breakdown?: { skills: number; experience: number; education: number };
  status: string;
  reasoning?: string;
}

interface TopCandidatesProps {
  jobTitle?: string;
  candidates: TopCandidate[];
  isLoading?: boolean;
  onAdvance?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewResume?: (id: string) => void;
}

export function TopCandidates({
  jobTitle,
  candidates,
  isLoading,
  onAdvance,
  onReject,
  onViewResume,
}: TopCandidatesProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('hr.top_candidates')}</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[hsl(var(--muted))]" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('hr.top_candidates')}</CardTitle>
        <CardDescription>
          {jobTitle ? `${jobTitle} — ` : ''}{t('hr.top_candidates_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
            {t('hr.no_candidates')}
          </p>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--muted))]/30"
              >
                {/* Rank */}
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
                )}>
                  {index + 1}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{candidate.email}</p>
                </div>

                {/* Score */}
                <MatchScoreBadge
                  score={candidate.score}
                  breakdown={candidate.breakdown}
                  reasoning={candidate.reasoning}
                />

                {/* Actions */}
                <div className="flex gap-1">
                  {onViewResume && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onViewResume(candidate.id)}
                      title={t('hr.view_resume')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onAdvance && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-green-600"
                      onClick={() => onAdvance(candidate.id)}
                      title={t('hr.advance_stage')}
                    >
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500"
                      onClick={() => onReject(candidate.id)}
                      title={t('hr.rejected')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
