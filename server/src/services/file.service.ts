import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { files, parsedData } from '../db/schema.js';
import { storageService } from './storage.service.js';
import { parseFile } from './parser.service.js';
import type { FileType } from '@sme-insightx/shared';

interface FileRecord {
  id: string;
  organizationId: string;
  uploadedById: string | null;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  createdAt: Date;
}

export const fileService = {
  /**
   * Create a file record (file already saved to disk by multer)
   */
  async createFile(
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<FileRecord> {
    const fileType = file.mimetype === 'text/csv' ? 'csv'
      : file.mimetype === 'application/json' ? 'json'
      : file.mimetype === 'application/pdf' ? 'pdf'
      : 'xlsx';

    const [record] = await db
      .insert(files)
      .values({
        organizationId,
        uploadedById: userId,
        name: file.filename,
        originalName: file.originalname,
        type: fileType as any,
        size: file.size,
        url: file.path,
      })
      .returning();

    return record;
  },

  /**
   * List files for an organization (paginated)
   */
  async listFiles(
    organizationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(files)
      .where(eq(files.organizationId, organizationId))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count (simple approach)
    const allRows = await db
      .select({ id: files.id })
      .from(files)
      .where(eq(files.organizationId, organizationId));

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: allRows.length,
        totalPages: Math.ceil(allRows.length / limit),
      },
    };
  },

  /**
   * Get a single file by ID
   */
  async getFile(fileId: string, organizationId: string) {
    const file = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        eq(files.organizationId, organizationId),
      ),
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  },

  /**
   * Delete a file and its parsed data
   */
  async deleteFile(fileId: string, organizationId: string) {
    const file = await this.getFile(fileId, organizationId);

    // Delete from disk
    await storageService.delete(file.url);

    // Delete parsed data (cascade handles this, but explicit is clearer)
    await db
      .delete(parsedData)
      .where(eq(parsedData.fileId, fileId));

    // Delete file record
    await db
      .delete(files)
      .where(eq(files.id, fileId));

    return { success: true };
  },

  /**
   * Parse a file and store results
   */
  async parseFile(fileId: string, organizationId: string) {
    const file = await this.getFile(fileId, organizationId);

    // Read file from disk
    const fs = await import('fs/promises');
    const buffer = await fs.readFile(file.url);

    // Parse based on file type
    const result = await parseFile(buffer, file.type as FileType);

    // Delete existing parsed data if re-parsing
    await db
      .delete(parsedData)
      .where(eq(parsedData.fileId, fileId));

    // Store parsed data
    const [parsed] = await db
      .insert(parsedData)
      .values({
        fileId: file.id,
        organizationId,
        columns: result.headers.map((name) => ({
          name,
          type: result.metadata.columnTypes[name] || 'string',
        })),
        rowCount: result.metadata.rowCount,
        sampleData: result.rows.slice(0, 1000), // Store up to 1000 rows
      })
      .returning();

    return parsed;
  },

  /**
   * Get parsed data for a file
   */
  async getParsedData(fileId: string, organizationId: string) {
    const data = await db.query.parsedData.findFirst({
      where: and(
        eq(parsedData.fileId, fileId),
        eq(parsedData.organizationId, organizationId),
      ),
    });

    if (!data) {
      throw new Error('Parsed data not found. Try parsing the file first.');
    }

    return data;
  },
};
