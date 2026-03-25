import { parse } from 'csv-parse/sync';
import type { FileType } from '@sme-insightx/shared';

interface ParsedResult {
  headers: string[];
  rows: Record<string, unknown>[];
  metadata: {
    rowCount: number;
    columnTypes: Record<string, string>;
  };
}

/**
 * Infer column type from sample values
 */
function inferColumnType(values: unknown[]): string {
  let hasNumber = false;
  let hasDate = false;
  let hasString = false;

  for (const val of values.slice(0, 100)) {
    if (val === null || val === undefined || val === '') continue;

    const str = String(val);

    if (!isNaN(Number(str)) && str.trim() !== '') {
      hasNumber = true;
    } else if (!isNaN(Date.parse(str)) && /\d{4}[-/]\d{2}[-/]\d{2}/.test(str)) {
      hasDate = true;
    } else {
      hasString = true;
    }
  }

  if (hasString) return 'string';
  if (hasDate) return 'date';
  if (hasNumber) return 'number';
  return 'string';
}

/**
 * Parse CSV buffer
 */
function parseCSV(buffer: Buffer): ParsedResult {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (records.length === 0) {
    return { headers: [], rows: [], metadata: { rowCount: 0, columnTypes: {} } };
  }

  const headers = Object.keys(records[0]);
  const columnTypes: Record<string, string> = {};

  for (const header of headers) {
    const values = records.map((r: Record<string, unknown>) => r[header]);
    columnTypes[header] = inferColumnType(values);
  }

  return {
    headers,
    rows: records,
    metadata: {
      rowCount: records.length,
      columnTypes,
    },
  };
}

/**
 * Parse Excel buffer
 */
async function parseExcel(buffer: Buffer): Promise<ParsedResult> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
  });

  if (rows.length === 0) {
    return { headers: [], rows: [], metadata: { rowCount: 0, columnTypes: {} } };
  }

  const headers = Object.keys(rows[0]);
  const columnTypes: Record<string, string> = {};

  for (const header of headers) {
    const values = rows.map((r: Record<string, unknown>) => r[header]);
    columnTypes[header] = inferColumnType(values);
  }

  return {
    headers,
    rows,
    metadata: {
      rowCount: rows.length,
      columnTypes,
    },
  };
}

/**
 * Parse JSON buffer
 */
function parseJSON(buffer: Buffer): ParsedResult {
  const data = JSON.parse(buffer.toString('utf-8'));

  // Accept flat arrays directly
  let rows: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    rows = data;
  } else if (typeof data === 'object' && data !== null) {
    // Object wrapper like { "employees": [...] } — find first array property
    const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]));
    if (arrayKey) {
      rows = data[arrayKey];
    }
  }

  if (rows.length === 0) {
    throw new Error('JSON file must contain an array of objects, or an object with an array property');
  }

  const headers = Object.keys(rows[0]);
  const columnTypes: Record<string, string> = {};

  for (const header of headers) {
    const values = rows.map((r: Record<string, unknown>) => r[header]);
    columnTypes[header] = inferColumnType(values);
  }

  return {
    headers,
    rows,
    metadata: {
      rowCount: rows.length,
      columnTypes,
    },
  };
}

/**
 * Parse PDF buffer (extract text)
 */
async function parsePDF(buffer: Buffer): Promise<ParsedResult> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);

    return {
      headers: ['content'],
      rows: [{ content: result.text }],
      metadata: {
        rowCount: 1,
        columnTypes: { content: 'string' },
      },
    };
  } catch (err: any) {
    throw new Error(`Could not parse PDF: ${err.message || 'The file may be corrupted or password-protected'}`);
  }
}

/**
 * Parse file based on type
 */
export async function parseFile(
  buffer: Buffer,
  fileType: FileType,
): Promise<ParsedResult> {
  switch (fileType) {
    case 'csv':
      return parseCSV(buffer);
    case 'xlsx':
      return parseExcel(buffer);
    case 'json':
      return parseJSON(buffer);
    case 'pdf':
      return parsePDF(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
