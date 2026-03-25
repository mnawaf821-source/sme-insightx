import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'parsing' | 'done' | 'error';
  score?: number;
}

interface ResumeUploadProps {
  onUpload?: (files: File[]) => void;
}

export function ResumeUpload({ onUpload }: ResumeUploadProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((file: File) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const uploadFile: UploadFile = { id, file, progress: 0, status: 'uploading' };

    setUploads((prev) => [...prev, uploadFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 100, status: 'parsing' } : u))
        );
        // Simulate parsing
        setTimeout(() => {
          const score = Math.floor(Math.random() * 40) + 60;
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: 'done', score } : u))
          );
        }, 1500);
      } else {
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: Math.min(progress, 99) } : u))
        );
      }
    }, 300);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        /\.(pdf|doc|docx)$/i.test(f.name)
      );
      files.forEach(simulateUpload);
      onUpload?.(files);
    },
    [simulateUpload, onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(simulateUpload);
    onUpload?.(files);
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('hr.resume_upload')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Drop Zone */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            dragOver
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]/50',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
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
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
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
                  <p className="truncate text-sm font-medium">{u.file.name}</p>
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
                  {u.status === 'done' && u.score !== undefined && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className={cn(
                        'font-medium',
                        u.score >= 80 ? 'text-green-600' : u.score >= 50 ? 'text-yellow-600' : 'text-red-600',
                      )}>
                        {t('hr.match_score', { score: u.score })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {u.status === 'uploading' ? `${Math.round(u.progress)}%` : u.status === 'parsing' ? t('hr.parsing') : ''}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeUpload(u.id)}>
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
