import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { cn } from '../../../lib/utils';

interface FilterState {
  search: string;
  scoreMin: number;
  scoreMax: number;
  skills: string;
  experience: string;
  status: string;
  sortBy: 'score' | 'date' | 'name';
}

interface CandidateFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function CandidateFilter({ filters, onFiltersChange }: CandidateFilterProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof FilterState, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      scoreMin: 0,
      scoreMax: 100,
      skills: '',
      experience: '',
      status: '',
      sortBy: 'score',
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.skills || filters.experience || filters.scoreMin > 0 || filters.scoreMax < 100;

  return (
    <div className="space-y-3">
      {/* Search + Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder={t('hr.search_candidates')}
            className="pl-9 rtl:pl-3 rtl:pr-9"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <Button
          variant={expanded ? 'default' : 'outline'}
          size="icon"
          onClick={() => setExpanded(!expanded)}
          title={t('common.filter')}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-1 h-3.5 w-3.5" />
            {t('common.reset')}
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div className="grid gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Score Range */}
          <div>
            <Label className="text-xs">{t('hr.filter_by_score')}</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={filters.scoreMin}
                onChange={(e) => update('scoreMin', parseInt(e.target.value) || 0)}
                className="h-8 text-xs"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={filters.scoreMax}
                onChange={(e) => update('scoreMax', parseInt(e.target.value) || 100)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-xs">{t('hr.filter_by_skills')}</Label>
            <Input
              placeholder="e.g. React, Python"
              value={filters.skills}
              onChange={(e) => update('skills', e.target.value)}
              className="mt-1 h-8 text-xs"
            />
          </div>

          {/* Experience */}
          <div>
            <Label className="text-xs">{t('hr.filter_by_experience')}</Label>
            <Input
              placeholder="e.g. 3+ years"
              value={filters.experience}
              onChange={(e) => update('experience', e.target.value)}
              className="mt-1 h-8 text-xs"
            />
          </div>

          {/* Status */}
          <div>
            <Label className="text-xs">{t('hr.filter_by_status')}</Label>
            <select
              className="mt-1 h-8 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 text-xs"
              value={filters.status}
              onChange={(e) => update('status', e.target.value)}
            >
              <option value="">{t('hr.all_jobs')}</option>
              <option value="new">{t('hr.new')}</option>
              <option value="screening">{t('hr.screening')}</option>
              <option value="interview">{t('hr.interview')}</option>
              <option value="offer">{t('hr.offer')}</option>
              <option value="hired">{t('hr.hired')}</option>
              <option value="rejected">{t('hr.rejected')}</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <Label className="text-xs">{t('hr.sort_by')}</Label>
            <select
              className="mt-1 h-8 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 text-xs"
              value={filters.sortBy}
              onChange={(e) => update('sortBy', e.target.value as FilterState['sortBy'])}
            >
              <option value="score">{t('hr.sort_score')}</option>
              <option value="date">{t('hr.sort_date')}</option>
              <option value="name">{t('hr.sort_name')}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export type { FilterState };
