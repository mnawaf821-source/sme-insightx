import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FileDropzone } from '../features/analytics/components/FileDropzone';
import { FileList } from '../features/analytics/components/FileList';
import { FilePreview } from '../features/analytics/components/FilePreview';
import { useFiles } from '../features/analytics/hooks/useFiles';
import { useFileUpload } from '../features/analytics/hooks/useFileUpload';
import type { FileResponse } from '@sme-insightx/shared';

export function AnalyticsPage() {
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const { data, isLoading } = useFiles();
  const { uploadFiles, uploads, isUploading } = useFileUpload();

  const files = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Upload and explore your data with AI-powered visualizations"
      />

      <div className="space-y-6">
        {/* Upload Section */}
        <FileDropzone onDrop={uploadFiles} isUploading={isUploading} />

        {/* Upload Progress */}
        {uploads.size > 0 && (
          <div className="space-y-2">
            {Array.from(uploads.entries()).map(([id, upload]: [string, any]) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-md border border-[hsl(var(--border))] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{upload.file.name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        upload.status === 'error'
                          ? 'bg-red-500'
                          : upload.status === 'success'
                            ? 'bg-green-500'
                            : 'bg-[hsl(var(--primary))]'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {upload.status === 'error'
                    ? 'Failed'
                    : upload.status === 'success'
                      ? 'Done'
                      : `${upload.progress}%`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* File Preview or File List */}
        {selectedFile ? (
          <FilePreview
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        ) : (
          <FileList
            files={files}
            isLoading={isLoading}
            onViewFile={setSelectedFile}
          />
        )}
      </div>
    </div>
  );
}
