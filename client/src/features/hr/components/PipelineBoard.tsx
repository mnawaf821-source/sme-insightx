import { useState } from 'react';
import { CandidateCard } from './CandidateCard';
import { useMoveStage, useDeleteCandidate, useMatchCandidate } from '../hooks/useHR';
import type { Pipeline, Candidate } from '../api/hr.api';

interface PipelineBoardProps {
  pipeline: Pipeline;
  isLoading?: boolean;
}

const STAGES: Array<{ key: keyof Pipeline; label: string; color: string }> = [
  { key: 'new', label: 'New', color: 'bg-gray-500' },
  { key: 'screening', label: 'Screening', color: 'bg-blue-500' },
  { key: 'interview', label: 'Interview', color: 'bg-purple-500' },
  { key: 'offer', label: 'Offer', color: 'bg-yellow-500' },
  { key: 'hired', label: 'Hired', color: 'bg-green-500' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

export function PipelineBoard({ pipeline, isLoading }: PipelineBoardProps) {
  const moveStage = useMoveStage();
  const deleteCandidate = useDeleteCandidate();
  const matchCandidate = useMatchCandidate();
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});

  const handleMove = (candidateId: string, newStatus: string) => {
    moveStage.mutate({ id: candidateId, status: newStatus });
  };

  const handleDelete = (candidateId: string) => {
    if (confirm('Delete this candidate?')) {
      deleteCandidate.mutate(candidateId);
    }
  };

  const handleMatch = async (candidateId: string) => {
    try {
      const result = await matchCandidate.mutateAsync(candidateId);
      setMatchScores((prev) => ({ ...prev, [candidateId]: result.score }));
    } catch {
      // error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((s) => (
          <div key={s.key} className="space-y-2">
            <div className="h-6 w-24 animate-pulse rounded bg-[hsl(var(--muted))]" />
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {STAGES.map(({ key, label, color }) => {
        const candidates = pipeline[key] || [];
        return (
          <div key={key} className="min-h-[200px]">
            {/* Column Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-sm font-medium">{label}</span>
              <span className="rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                {candidates.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {candidates.map((candidate: Candidate) => (
                <div key={candidate.id}>
                  <CandidateCard
                    candidate={candidate}
                    matchScore={matchScores[candidate.id]}
                    onDelete={() => handleDelete(candidate.id)}
                    onMatch={() => handleMatch(candidate.id)}
                  />
                  {/* Quick stage buttons */}
                  <div className="mt-1 flex gap-1">
                    {STAGES.filter((s) => s.key !== key && s.key !== 'rejected').slice(0, 3).map((s) => (
                      <button
                        key={s.key}
                        className="rounded px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                        onClick={() => handleMove(candidate.id, s.key)}
                        title={`Move to ${s.label}`}
                      >
                        → {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {candidates.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
