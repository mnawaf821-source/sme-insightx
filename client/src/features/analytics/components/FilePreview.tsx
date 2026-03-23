import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  X,
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  FileJson,
  File,
} from 'lucide-react';
import type { FileResponse, ParsedDataResponse } from '@sme-insightx/shared';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useFileData, useParseFile } from '../hooks/useFiles';
import { analyticsApi } from '../api/analytics.api';

interface FilePreviewProps {
  file: FileResponse;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FileTypeIcon({ type }: { type: string }) {
  const className = 'h-5 w-5';
  switch (type) {
    case 'csv':
      return <FileSpreadsheet className={`${className} text-green-500`} />;
    case 'xlsx':
      return <FileSpreadsheet className={`${className} text-green-600`} />;
    case 'json':
      return <FileJson className={`${className} text-yellow-500`} />;
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    default:
      return <File className={`${className} text-gray-400`} />;
  }
}

function DataTable({ data }: { data: ParsedDataResponse }) {
  const columns = data.columns.map((col: { name: string; type: string }) => ({
    accessorFn: (row: Record<string, unknown>) => row[col.name],
    id: col.name,
    header: col.name,
    cell: (info: any) => {
      const val = info.getValue();
      if (val === null || val === undefined) return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
      return String(val);
    },
  }));

  const table = useReactTable({
    data: data.sampleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[hsl(var(--muted))]/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          –{Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.sampleData.length,
          )}{' '}
          of {data.sampleData.length} rows
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const { data: parsedData, isLoading, error } = useFileData(file.id);
  const parseFile = useParseFile();
  const [isParsing, setIsParsing] = useState(false);
  const [hasAutoParsed, setHasAutoParsed] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Auto-trigger parse when no parsed data exists (avoids confusing 404 error)
  const shouldAutoParse =
    !isLoading && !parsedData && error && !hasAutoParsed && !parseFile.isPending;

  if (shouldAutoParse) {
    setHasAutoParsed(true);
    parseFile.mutate(file.id, {
      onError: (err: any) => {
        setParseError(err?.response?.data?.error || err?.message || 'Failed to parse file');
      },
    });
  }

  const handleParse = async () => {
    setIsParsing(true);
    setHasAutoParsed(true);
    setParseError(null);
    try {
      await parseFile.mutateAsync(file.id);
    } catch (err: any) {
      setParseError(err?.response?.data?.error || err?.message || 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileTypeIcon type={file.type} />
          <div>
            <h3 className="font-medium">{file.originalName}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {file.type.toUpperCase()} · {formatSize(file.size)} · Uploaded {formatDate(file.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(analyticsApi.getDownloadUrl(file.id))}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Parsed Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Data Preview</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleParse}
            disabled={isParsing}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isParsing ? 'animate-spin' : ''}`} />
            {parsedData ? 'Re-parse' : 'Parse File'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded bg-[hsl(var(--muted))]"
                />
              ))}
            </div>
          ) : (error || parseError) && !parseFile.isPending ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-red-500">
                {parseError || 'Could not load parsed data'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleParse}
                disabled={isParsing}
              >
                <RefreshCw className={`mr-1.5 h-4 w-4 ${isParsing ? 'animate-spin' : ''}`} />
                Parse File
              </Button>
            </div>
          ) : parsedData ? (
            <div>
              <div className="mb-3 flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                <span>{parsedData.rowCount} rows</span>
                <span>{parsedData.columns.length} columns</span>
                <span>
                  Column types:{' '}
                  {parsedData.columns.map((c: { name: string; type: string }) => `${c.name} (${c.type})`).join(', ')}
                </span>
              </div>
              <DataTable data={parsedData} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
