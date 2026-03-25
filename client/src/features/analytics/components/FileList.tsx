import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  FileSpreadsheet,
  FileText,
  FileJson,
  File,
  Trash2,
  Eye,
  ArrowUpDown,
  MoreHorizontal,
} from 'lucide-react';
import type { FileResponse } from '@sme-insightx/shared';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useDeleteFile } from '../hooks/useFiles';

interface FileListProps {
  files: FileResponse[];
  isLoading?: boolean;
  onViewFile?: (file: FileResponse) => void;
}

const columnHelper = createColumnHelper<FileResponse>();

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
  const className = 'h-4 w-4';
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

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    csv: 'bg-black text-green-400 dark:bg-zinc-800 dark:text-green-400',
    xlsx: 'bg-black text-green-400 dark:bg-zinc-800 dark:text-green-400',
    json: 'bg-black text-amber-400 dark:bg-zinc-800 dark:text-amber-400',
    pdf: 'bg-black text-red-400 dark:bg-zinc-800 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      <FileTypeIcon type={type} />
      {type.toUpperCase()}
    </span>
  );
}

export function FileList({ files, isLoading, onViewFile }: FileListProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const deleteFile = useDeleteFile();

  const columns = [
    columnHelper.accessor('originalName', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <FileTypeIcon type={info.row.original.type} />
          <span className="max-w-[200px] truncate font-medium">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => <TypeBadge type={info.getValue()} />,
    }),
    columnHelper.accessor('size', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Size
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => formatSize(info.getValue()),
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Uploaded
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: (info) => (
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center gap-1">
          {onViewFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewFile(info.row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`Delete "${info.row.original.originalName}"?`)) {
                deleteFile.mutate(info.row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: files,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <File className="mb-3 h-12 w-12 text-[hsl(var(--muted-foreground))]/50" />
            <p className="text-sm font-medium">No files uploaded yet</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Upload a CSV, Excel, JSON, or PDF file to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[hsl(var(--border))]"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
