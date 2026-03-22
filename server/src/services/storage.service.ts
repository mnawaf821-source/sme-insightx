import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
async function ensureDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

ensureDir();

export const storageService = {
  /**
   * Save a file buffer to disk
   */
  async save(filename: string, buffer: Buffer): Promise<string> {
    await ensureDir();
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  },

  /**
   * Get file path on disk
   */
  getPath(filename: string): string {
    return path.join(UPLOAD_DIR, filename);
  },

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Delete file from disk
   */
  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  },

  /**
   * Create a read stream for downloading
   */
  createReadStream(filePath: string) {
    return createReadStream(filePath);
  },

  /**
   * Get file stats
   */
  async getStats(filePath: string) {
    return fs.stat(filePath);
  },
};
