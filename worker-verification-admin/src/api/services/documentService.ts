// src/api/services/documentService.ts
import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { 
  WorkerDocument, 
  DocumentCreateInput, 
  DocumentApprovalInput, 
  DocumentRejectionInput,
  DocumentRequirements
} from '@/types/document.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const documentService = {
  /**
   * Obtener documentos pendientes
   */
  getPendingDocuments: async (): Promise<WorkerDocument[]> => {
    const { data } = await axiosInstance.get<PaginatedResponse<WorkerDocument>>(
      API_ENDPOINTS.DOCUMENTS.PENDING
    );
    return data.data;
  },

  /**
   * Obtener todos los documentos de un trabajador
   */
  getWorkerDocuments: async (workerId: string): Promise<any> => {
    const { data } = await axiosInstance.get<ApiResponse<any>>(
      API_ENDPOINTS.DOCUMENTS.WORKER_DOCUMENTS(workerId)
    );
    return data.data;
  },

  /**
   * Obtener hoja de vida
   */
  getHojaVida: async (workerId: string): Promise<WorkerDocument> => {
    const { data } = await axiosInstance.get<ApiResponse<WorkerDocument>>(
      API_ENDPOINTS.DOCUMENTS.HOJA_VIDA(workerId)
    );
    if (!data.data) throw new Error('Hoja de vida not found');
    return data.data;
  },

  /**
   * Obtener antecedentes
   */
  getAntecedentes: async (workerId: string): Promise<WorkerDocument> => {
    const { data } = await axiosInstance.get<ApiResponse<WorkerDocument>>(
      API_ENDPOINTS.DOCUMENTS.ANTECEDENTES(workerId)
    );
    if (!data.data) throw new Error('Antecedentes not found');
    return data.data;
  },

  /**
   * Obtener títulos
   */
  getTitulos: async (workerId: string): Promise<Record<string, WorkerDocument>> => {
    const { data } = await axiosInstance.get<ApiResponse<Record<string, WorkerDocument>>>(
      API_ENDPOINTS.DOCUMENTS.TITULOS(workerId)
    );
    return data.data || {};
  },

  /**
   * Obtener cartas de recomendación
   */
  getCartas: async (workerId: string): Promise<Record<string, WorkerDocument>> => {
    const { data } = await axiosInstance.get<ApiResponse<Record<string, WorkerDocument>>>(
      API_ENDPOINTS.DOCUMENTS.CARTAS(workerId)
    );
    return data.data || {};
  },

  /**
   * Crear documento
   */
  createDocument: async (documentData: DocumentCreateInput): Promise<WorkerDocument> => {
    const { data } = await axiosInstance.post<ApiResponse<WorkerDocument>>(
      API_ENDPOINTS.DOCUMENTS.CREATE,
      documentData
    );
    if (!data.data) throw new Error('Failed to create document');
    return data.data;
  },

  /**
   * Aprobar documento
   */
  approveDocument: async (approvalData: DocumentApprovalInput): Promise<void> => {
    await axiosInstance.post<ApiResponse<void>>(
      API_ENDPOINTS.DOCUMENTS.APPROVE,
      approvalData
    );
  },

  /**
   * Rechazar documento
   */
  rejectDocument: async (rejectionData: DocumentRejectionInput): Promise<void> => {
    await axiosInstance.post<ApiResponse<void>>(
      API_ENDPOINTS.DOCUMENTS.REJECT,
      rejectionData
    );
  },

  /**
   * Verificar documentos requeridos
   */
  checkRequirements: async (workerId: string): Promise<DocumentRequirements> => {
    const { data } = await axiosInstance.get<ApiResponse<DocumentRequirements>>(
      API_ENDPOINTS.DOCUMENTS.CHECK_REQUIREMENTS(workerId)
    );
    if (!data.data) throw new Error('Failed to check requirements');
    return data.data;
  },

  /**
   * Eliminar documento
   */
  deleteDocument: async (
    workerId: string,
    category: string,
    subcategory: string | null,
    documentId: string
  ): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(
      API_ENDPOINTS.DOCUMENTS.DELETE,
      {
        data: {
          workerId,
          category,
          subcategory,
          documentId,
        },
      }
    );
  },

  /**
   * Obtener URL de archivo
   */
  getFileUrl: async (
    workerId: string,
    category: string,
    filename: string,
    subcategory?: string
  ): Promise<string> => {
    const params = new URLSearchParams({
      workerId,
      category,
      filename,
    });
    
    if (subcategory) params.append('subcategory', subcategory);
    
    const { data } = await axiosInstance.get<ApiResponse<{ url: string }>>(
      `${API_ENDPOINTS.DOCUMENTS.FILE_URL}?${params.toString()}`
    );
    
    if (!data.data?.url) throw new Error('Failed to get file URL');
    return data.data.url;
  },
};