import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PipelineBoard } from '../features/hr/components/PipelineBoard';
import { JobForm } from '../features/hr/components/JobForm';
import { AddCandidateModal } from '../features/hr/components/AddCandidateModal';
import {
  useJobs,
  useCreateJob,
  useDeleteJob,
  usePipeline,
  useAnalytics,
  useCreateCandidate,
} from '../features/hr/hooks/useHR';
import { Plus, Users, Briefcase, TrendingUp, UserPlus } from 'lucide-react';

export function HRPage() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>();

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

  return (
    <div>
      <PageHeader
        title="HR & Recruitment"
        description="Manage job postings, candidates, and your hiring pipeline"
      />

      {/* Analytics Cards */}
      {analytics && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Candidates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Briefcase className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.active}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.hired}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Hired</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.conversionRate}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Conversion Rate</p>
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
          <option value="">All Jobs</option>
          {(jobs || []).map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>

        <Button size="sm" onClick={() => setShowJobForm(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Job
        </Button>

        <Button variant="outline" size="sm" onClick={() => setShowAddCandidate(true)}>
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Add Candidate
        </Button>
      </div>

      {/* Jobs List (compact) */}
      {jobs && jobs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Job Postings ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] p-3">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {job.department || 'General'} · {job.type} · {job.location || 'Not specified'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      job.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : job.status === 'closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {job.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-500"
                      onClick={() => {
                        if (confirm(`Delete "${job.title}"?`)) deleteJob.mutate(job.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Board */}
      {pipeline && (
        <div>
          <h3 className="mb-4 text-sm font-medium">Recruitment Pipeline</h3>
          <PipelineBoard pipeline={pipeline} isLoading={loadingPipeline} />
        </div>
      )}

      {!pipeline && !loadingPipeline && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-[hsl(var(--muted-foreground))]/40" />
          <p className="text-sm font-medium">No candidates yet</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Create a job posting and add candidates to start your pipeline
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
