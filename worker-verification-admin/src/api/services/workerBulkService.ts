// src/services/api/workerBulkService.ts
import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '@/types/api.types';

export interface BulkUploadResult {
  total_processed: number;
  successful: number;
  failed: number;
  success_details: Array<{
    row: number;
    email: string;
    name: string;
    user_id: string;
    password?: string;
    auth_existed: boolean;
  }>;
  error_details: Array<{
    row: number;
    email: string;
    name: string;
    error: string;
  }>;
  execution_time: number;
}

export const workerBulkService = {
  /**
   * Carga masiva de trabajadores desde archivo Excel
   */
  uploadWorkers: async (file: File): Promise<ApiResponse<BulkUploadResult>> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post<ApiResponse<BulkUploadResult>>(
      API_ENDPOINTS.WORKERS.BULK_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Timeout extendido para archivos grandes
        timeout: 120000, // 120 segundos
      }
    );

    return data;
  },

  /**
   * Descarga template de Excel con ejemplos
   */
  downloadTemplate: async (): Promise<Blob> => {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.WORKERS.BULK_TEMPLATE,
      {
        responseType: 'blob',
      }
    );

    return data;
  },

  /**
   * Valida un archivo antes de subirlo
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    // Validar extensión
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'El archivo debe ser un Excel (.xlsx o .xls)',
      };
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande (máximo 10MB)',
      };
    }

    return { valid: true };
  },

  /**
   * Formatea las credenciales para descarga en CSV
   */
  formatCredentialsForDownload: (successDetails: BulkUploadResult['success_details']): string => {
    const headers = ['Fila', 'Nombre', 'Email', 'Contraseña', 'Usuario ID', 'Estado'];
    const rows = successDetails.map(detail => [
      detail.row.toString(),
      detail.name,
      detail.email,
      detail.password || 'N/A',
      detail.user_id,
      detail.auth_existed ? 'Usuario existente' : 'Nuevo usuario',
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  },
};