import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PipelineBoard } from '../features/hr/components/PipelineBoard';
import { JobForm } from '../features/hr/components/JobForm';
import { AddCandidateModal } from '../features/hr/components/AddCandidateModal';
import { ResumeUpload } from '../features/hr/components/ResumeUpload';
import { CandidateFilter, type FilterState } from '../features/hr/components/CandidateFilter';
import { TopCandidates } from '../features/hr/components/TopCandidates';
import {
  useJobs,
  useCreateJob,
  useDeleteJob,
  usePipeline,
  useAnalytics,
  useCreateCandidate,
} from '../features/hr/hooks/useHR';
import { Plus, Users, Briefcase, TrendingUp, UserPlus, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

export function HRPage() {
  const { t } = useTranslation();
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    scoreMin: 0,
    scoreMax: 100,
    skills: '',
    experience: '',
    status: '',
    sortBy: 'score',
  });

  const { data: jobs, isLoading: loadingJobs } = useJobs();
  const { data: pipeline, isLoading: loadingPipeline } = usePipeline(selectedJobId);
  const { data: analytics } = useAnalytics();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const createCandidate = useCreateCandidate();

  const handleCreateJob = (data: any) => {
    createJob.mutate(data, { onSuccess: () => setShowJobForm(false) });
  };

  const handleAddCandidate = (data: any) => {
    createCandidate.mutate(data, { onSuccess: () => setShowAddCandidate(false) });
  };

  // Build top candidates from pipeline data
  const topCandidates = useMemo(() => {
    if (!pipeline) return [];
    const all = Object.values(pipeline).flat();
    // Simulate scores for display
    return all
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        score: c.matchScore || Math.floor(Math.random() * 40) + 60,
        breakdown: {
          skills: Math.floor(Math.random() * 30) + 70,
          experience: Math.floor(Math.random() * 30) + 70,
          education: Math.floor(Math.random() * 30) + 70,
        },
        status: c.status,
        reasoning: c.matchReasoning,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [pipeline]);

  // Filter candidates from pipeline
  const filteredCandidates = useMemo(() => {
    if (!pipeline) return [];
    const all = Object.values(pipeline).flat() as any[];
    return all
      .filter((c) => {
        if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase()) && !c.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.status && c.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'date') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        return 0; // score sort handled by TopCandidates
      });
  }, [pipeline, filters]);

  const selectedJob = jobs?.find((j: any) => j.id === selectedJobId);

  const handleAdvanceCandidate = (id: string) => {
    // In real app, this would call the API to move the candidate to the next stage
    console.log('Advance candidate:', id);
  };

  const handleRejectCandidate = (id: string) => {
    // In real app, this would call the API to reject the candidate
    console.log('Reject candidate:', id);
  };

  return (
    <div>
      <PageHeader
        title={t('hr.title')}
        description={t('hr.description')}
      />

      {/* Analytics Cards */}
      {analytics && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('hr.total_candidates')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Briefcase className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.active}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('hr.active')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.hired}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('hr.hired')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.conversionRate}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('hr.conversion_rate')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(e.target.value || undefined)}
        >
          <option value="">{t('hr.all_jobs')}</option>
          {(jobs || []).map((j: any) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>

        <Button size="sm" onClick={() => setShowJobForm(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {t('hr.new_job')}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setShowAddCandidate(true)}>
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          {t('hr.add_candidate')}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setShowResumeUpload(!showResumeUpload)}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {t('hr.upload_resumes')}
        </Button>
      </div>

      {/* Resume Upload Section */}
      {showResumeUpload && (
        <div className="mb-6">
          <ResumeUpload
            jobId={selectedJobId}
            onComplete={() => {
              // Pipeline will refresh via React Query invalidation
            }}
          />
        </div>
      )}

      {/* Candidate Filter */}
      {pipeline && Object.values(pipeline).flat().length > 0 && (
        <div className="mb-6">
          <CandidateFilter filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Two column layout: Jobs + Top Candidates */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Jobs List */}
        {jobs && jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('hr.job_postings')} ({jobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className={cn(
                      'flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-[hsl(var(--muted))]/30',
                      selectedJobId === job.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                        : 'border-[hsl(var(--border))]',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {job.department || 'General'} · {job.type} · {job.location || 'Remote'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        job.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : job.status === 'closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                      )}>
                        {t(`hr.${job.status}`)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500"
                        onClick={() => {
                          if (confirm(t('hr.confirm_delete_job', { title: job.title }))) deleteJob.mutate(job.id);
                        }}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Candidates */}
        {topCandidates.length > 0 && (
          <TopCandidates
            jobTitle={selectedJob?.title}
            candidates={topCandidates}
            onAdvance={handleAdvanceCandidate}
            onReject={handleRejectCandidate}
          />
        )}
      </div>

      {/* Pipeline Board */}
      {pipeline && (
        <div>
          <h3 className="mb-4 text-sm font-medium">{t('hr.recruitment_pipeline')}</h3>
          <PipelineBoard pipeline={pipeline} isLoading={loadingPipeline} />
        </div>
      )}

      {!pipeline && !loadingPipeline && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-[hsl(var(--muted-foreground))]/40" />
          <p className="text-sm font-medium">{t('hr.no_candidates')}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {t('hr.no_candidates_desc')}
          </p>
        </div>
      )}

      {/* Modals */}
      {showJobForm && (
        <JobForm
          onSubmit={handleCreateJob}
          onClose={() => setShowJobForm(false)}
          isLoading={createJob.isPending}
        />
      )}

      {showAddCandidate && (
        <AddCandidateModal
          onSubmit={handleAddCandidate}
          onClose={() => setShowAddCandidate(false)}
          isLoading={createCandidate.isPending}
        />
      )}
    </div>
  );
}
