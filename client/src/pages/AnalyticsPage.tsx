import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { FileDropzone } from '../features/analytics/components/FileDropzone';
import { FileList } from '../features/analytics/components/FileList';
import { FilePreview } from '../features/analytics/components/FilePreview';
import { QueryInput } from '../features/ai/components/QueryInput';
import { InsightsPanel } from '../features/ai/components/InsightsPanel';
import { AIChat } from '../features/ai/components/AIChat';
import { useFiles } from '../features/analytics/hooks/useFiles';
import { useFileUpload } from '../features/analytics/hooks/useFileUpload';
import { useAnalyzeFile, useInsights, useQueryData } from '../features/ai/hooks/useAI';
import { Sparkles, Upload as UploadIcon, MessageSquare } from 'lucide-react';
import type { FileResponse } from '@sme-insightx/shared';

type Tab = 'upload' | 'insights' | 'chat';

export function AnalyticsPage() {
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const { data, isLoading } = useFiles();
  const { uploadFiles, uploads, isUploading } = useFileUpload();
  const { data: allInsights } = useInsights();
  const runAnalysis = useAnalyzeFile();
  const queryData = useQueryData();

  const files = data?.data ?? [];

  const handleAnalyze = () => {
    if (selectedFile) {
      runAnalysis.mutate(selectedFile.id);
    }
  };

  const handleQuery = (question: string) => {
    if (selectedFile) {
      queryData.mutate({ question, fileId: selectedFile.id });
    }
  };

  const TABS = [
    { id: 'upload' as Tab, label: 'Files & Upload', icon: UploadIcon },
    { id: 'insights' as Tab, label: 'AI Insights', icon: Sparkles },
    { id: 'chat' as Tab, label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Upload, explore, and analyze your data with AI"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[hsl(var(--border))] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <FileDropzone onDrop={uploadFiles} isUploading={isUploading} />

          {uploads.size > 0 && (
            <div className="space-y-2">
              {Array.from(uploads.entries()).map(([id, upload]: [string, any]) => (
                <div key={id} className="flex items-center gap-3 rounded-md border border-[hsl(var(--border))] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{upload.file.name}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          upload.status === 'error' ? 'bg-red-500'
                            : upload.status === 'success' ? 'bg-green-500'
                            : 'bg-[hsl(var(--primary))]'
                        }`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {upload.status === 'error' ? 'Failed' : upload.status === 'success' ? 'Done' : `${upload.progress}%`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedFile ? (
            <FilePreview file={selectedFile} onClose={() => setSelectedFile(null)} />
          ) : (
            <FileList files={files} isLoading={isLoading} onViewFile={setSelectedFile} />
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {files.length > 0 && (
            <div className="flex items-center gap-3">
              <select
                className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                value={selectedFile?.id || ''}
                onChange={(e) => {
                  const f = files.find((file) => file.id === e.target.value);
                  setSelectedFile(f || null);
                }}
              >
                <option value="">Select a file to analyze...</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>{f.originalName}</option>
                ))}
              </select>
              {selectedFile && (
                <Button size="sm" onClick={handleAnalyze} disabled={runAnalysis.isPending}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {runAnalysis.isPending ? 'Analyzing...' : 'Analyze'}
                </Button>
              )}
            </div>
          )}

          {selectedFile && (
            <QueryInput
              onQuery={handleQuery}
              isLoading={queryData.isPending}
              placeholder="Ask a question about this data..."
            />
          )}

          {queryData.data && (
            <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
              <p className="text-sm font-medium">{(queryData.data as any).title}</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Suggested: <strong>{(queryData.data as any).chartType}</strong> chart with{' '}
                {(queryData.data as any).xColumn} (x) and {(queryData.data as any).yColumn} (y)
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {(queryData.data as any).reasoning}
              </p>
            </div>
          )}

          <InsightsPanel
            insights={(runAnalysis.data as any) || (allInsights as any) || []}
            isLoading={runAnalysis.isPending}
            onAnalyze={handleAnalyze}
            canAnalyze={!!selectedFile}
          />
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {files.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Context:</span>
              <select
                className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                value={selectedFile?.id || ''}
                onChange={(e) => {
                  const f = files.find((file) => file.id === e.target.value);
                  setSelectedFile(f || null);
                }}
              >
                <option value="">No file context</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>{f.originalName}</option>
                ))}
              </select>
            </div>
          )}
          <AIChat fileId={selectedFile?.id} />
        </div>
      )}
    </div>
  );
}
