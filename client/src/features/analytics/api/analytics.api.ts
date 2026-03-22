import { api } from '../../../lib/api';
import type {
  FileResponse,
  ParsedDataResponse,
  ApiResponse,
  PaginatedResponse,
} from '@sme-insightx/shared';

export const analyticsApi = {
  /**
   * Upload a file with progress tracking
   */
  uploadFile(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<FileResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/files/upload');

      // Attach auth token
      const token = localStorage.getItem('sme_insightx_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data);
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.send(formData);
    });
  },

  /**
   * Get paginated file list
   */
  async getFiles(page = 1, limit = 20): Promise<{
    data: FileResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await api.get('/files', { params: { page, limit } });
    return res.data;
  },

  /**
   * Get single file details
   */
  async getFile(id: string): Promise<FileResponse> {
    const res = await api.get<ApiResponse<FileResponse>>(`/files/${id}`);
    return res.data.data!;
  },

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<void> {
    await api.delete(`/files/${id}`);
  },

  /**
   * Trigger file parsing
   */
  async triggerParse(id: string): Promise<ParsedDataResponse> {
    const res = await api.post<ApiResponse<ParsedDataResponse>>(`/files/${id}/parse`);
    return res.data.data!;
  },

  /**
   * Get parsed data for a file
   */
  async getFileData(id: string): Promise<ParsedDataResponse> {
    const res = await api.get<ApiResponse<ParsedDataResponse>>(`/files/${id}/data`);
    return res.data.data!;
  },

  /**
   * Get download URL
   */
  getDownloadUrl(id: string): string {
    return `/api/files/${id}/download`;
  },
};
