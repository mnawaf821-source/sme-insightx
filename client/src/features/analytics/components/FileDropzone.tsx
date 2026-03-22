import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, FileText, FileJson, File } from 'lucide-react';
import { MAX_FILE_SIZE } from '@sme-insightx/shared';

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  isUploading?: boolean;
}

const ACCEPTED_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/json': ['.json'],
  'application/pdf': ['.pdf'],
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  if (file.type === 'text/csv') return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  if (file.type.includes('spreadsheet') || file.type.includes('excel'))
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  if (file.type === 'application/json') return <FileJson className="h-8 w-8 text-yellow-500" />;
  if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-gray-400" />;
}

export function FileDropzone({ onDrop, isUploading }: FileDropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: handleDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed p-8
        transition-colors duration-200
        ${isDragActive
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50'
        }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-[hsl(var(--muted))] p-3">
          <Upload className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
        </div>

        {isDragActive ? (
          <p className="text-sm font-medium text-[hsl(var(--primary))]">
            Drop files here...
          </p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium">
                Drag & drop files here, or click to browse
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Supports CSV, Excel (.xlsx), JSON, PDF — up to 50MB
              </p>
            </div>

            {acceptedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {acceptedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md bg-[hsl(var(--muted))] px-3 py-1.5 text-xs"
                  >
                    {getFileIcon(file)}
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {formatSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
