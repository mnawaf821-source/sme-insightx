import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { analyticsApi } from '../../analytics/api/analytics.api';
import { hrApi } from '../api/hr.api';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'parsing' | 'creating' | 'done' | 'error';
  error?: string;
  candidateName?: string;
  candidateId?: string;
}

interface ResumeUploadProps {
  jobId?: string;
  onComplete?: () => void;
}

export function ResumeUpload({ jobId, onComplete }: ResumeUploadProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const uploadFile: UploadFile = { id, file, progress: 0, status: 'uploading' };

      setUploads((prev) => [...prev, uploadFile]);

      try {
        // Step 1: Upload the file
        const fileResponse = await analyticsApi.uploadFile(file, (percent) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress: percent } : u)),
          );
        });

        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 100, status: 'parsing' } : u)),
        );

        // Step 2: Parse the file to extract candidate info
        let candidateName = file.name.replace(/\.(pdf|doc|docx)$/i, '');
        let candidateEmail = '';

        try {
          const parsed = await analyticsApi.triggerParse(fileResponse.id);
          if (parsed?.sampleData?.length) {
            const row = parsed.sampleData[0];
            // Try to extract name and email from parsed data
            const nameKey = Object.keys(row).find((k) =>
              /name|candidate|applicant/i.test(k),
            );
            const emailKey = Object.keys(row).find((k) =>
              /email|e-mail/i.test(k),
            );
            if (nameKey && row[nameKey]) candidateName = String(row[nameKey]);
            if (emailKey && row[emailKey]) candidateEmail = String(row[emailKey]);
          }
        } catch {
          // Parsing failed, use filename as name
        }

        // Fallback email
        if (!candidateEmail) {
          candidateEmail = `${candidateName.toLowerCase().replace(/\s+/g, '.')}@candidate.placeholder`;
        }

        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'creating', candidateName } : u)),
        );

        // Step 3: Create candidate record
        const candidateData: any = {
          name: candidateName,
          email: candidateEmail,
          resumeUrl: fileResponse.url || `/api/files/${fileResponse.id}/download`,
          notes: `Resume uploaded: ${file.name}`,
          status: 'new',
        };

        if (jobId) {
          candidateData.jobPostingId = jobId;
        } else {
          // If no job selected, we can't create a candidate (jobPostingId is required)
          setUploads((prev) =>
            prev.map((u) =>
              u.id === id
                ? { ...u, status: 'error', error: t('hr.select_job_first') }
                : u,
            ),
          );
          return;
        }

        const candidate = await hrApi.createCandidate(candidateData);

        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, status: 'done', candidateId: candidate.id, candidateName: candidate.name }
              : u,
          ),
        );

        onComplete?.();
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, status: 'error', error: err.message || 'Upload failed' }
              : u,
          ),
        );
      }
    },
    [jobId, t, onComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        /\.(pdf|doc|docx|csv|xlsx?)$/i.test(f.name),
      );
      files.forEach(processFile);
    },
    [processFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('hr.resume_upload')}</CardTitle>
        <CardDescription>
          {jobId
            ? t('hr.resume_upload_desc')
            : t('hr.select_job_first')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Drop Zone */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            !jobId
              ? 'cursor-not-allowed opacity-50'
              : dragOver
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]/50',
          )}
          onDragOver={(e) => {
            if (jobId) {
              e.preventDefault();
              setDragOver(true);
            }
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={jobId ? handleDrop : undefined}
        >
          <Upload className="mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm font-medium">{t('hr.drag_drop_resumes')}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {t('hr.supported_resume_formats')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.csv,.xlsx"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={!jobId}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('analytics.upload_files')}
          </Button>
        </div>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploads.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3"
              >
                <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {u.candidateName || u.file.name}
                  </p>
                  {u.status === 'uploading' && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  )}
                  {u.status === 'parsing' && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t('hr.parsing')}
                    </div>
                  )}
                  {u.status === 'creating' && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t('hr.creating_candidate')}
                    </div>
                  )}
                  {u.status === 'done' && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {t('hr.candidate_created')}
                    </div>
                  )}
                  {u.status === 'error' && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {u.error}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {u.status === 'uploading'
                      ? `${Math.round(u.progress)}%`
                      : u.status === 'parsing' || u.status === 'creating'
                      ? '...'
                      : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeUpload(u.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
