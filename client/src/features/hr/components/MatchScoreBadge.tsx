interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : score >= 40 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}>
      {score}%
    </span>
  );
}
