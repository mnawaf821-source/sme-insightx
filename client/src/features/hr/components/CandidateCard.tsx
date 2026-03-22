import { MoreHorizontal, Trash2, Sparkles, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import type { Candidate } from '../api/hr.api';

interface CandidateCardProps {
  candidate: Candidate;
  onDelete?: () => void;
  onMatch?: () => void;
  matchScore?: number;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CandidateCard({ candidate, onDelete, onMatch, matchScore }: CandidateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{candidate.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-0.5">
              <Mail className="h-3 w-3" />
              {candidate.email}
            </span>
          </div>
          {candidate.phone && (
            <div className="mt-0.5 flex items-center gap-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              <Phone className="h-3 w-3" />
              {candidate.phone}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 w-36 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-md">
              {onMatch && (
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[hsl(var(--muted))]"
                  onClick={() => { onMatch(); setShowMenu(false); }}
                >
                  <Sparkles className="h-3 w-3" />
                  AI Match Score
                </button>
              )}
              {onDelete && (
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-[hsl(var(--muted))]"
                  onClick={() => { onDelete(); setShowMenu(false); }}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {candidate.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
          {candidate.notes}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {formatDate(candidate.createdAt)}
        </span>
        {matchScore !== undefined && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            matchScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : matchScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {matchScore}% match
          </span>
        )}
      </div>
    </div>
  );
}
