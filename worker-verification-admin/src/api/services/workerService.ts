import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { 
  Worker, 
  WorkerCreateInput, 
  WorkerUpdateInput, 
  WorkerFilters, 
  WorkerStatistics 
} from '@/types/worker.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const workerService = {
  /**
   * Obtener lista de trabajadores
   */
  getWorkers: async (filters?: WorkerFilters): Promise<Worker[]> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    if (filters?.online !== undefined) params.append('online', String(filters.online));
    if (filters?.search) params.append('search', filters.search);
    
    const { data } = await axiosInstance.get<PaginatedResponse<Worker>>(
      `${API_ENDPOINTS.WORKERS.LIST}?${params.toString()}`
    );
    
    return data.data;
  },

  /**
   * Obtener trabajador por ID
   */
  getWorkerById: async (id: string): Promise<Worker> => {
    const { data } = await axiosInstance.get<ApiResponse<Worker>>(
      API_ENDPOINTS.WORKERS.DETAIL(id)
    );
    
    if (!data.data) throw new Error('Worker not found');
    return data.data;
  },

  /**
   * Crear trabajador
   */
  createWorker: async (workerData: WorkerCreateInput): Promise<Worker> => {
    const { data } = await axiosInstance.post<ApiResponse<Worker>>(
      API_ENDPOINTS.WORKERS.CREATE,
      workerData
    );
    
    if (!data.data) throw new Error('Failed to create worker');
    return data.data;
  },

  /**
   * Actualizar trabajador (completo)
   */
  updateWorker: async (id: string, workerData: WorkerUpdateInput): Promise<void> => {
    await axiosInstance.put<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.UPDATE(id),
      workerData
    );
  },

  /**
   * Actualizar trabajador (parcial)
   */
  patchWorker: async (id: string, workerData: Partial<WorkerUpdateInput>): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.UPDATE(id),
      workerData
    );
  },

  /**
   * Eliminar trabajador
   */
  deleteWorker: async (id: string): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.DELETE(id)
    );
  },

  /**
   * Actualizar disponibilidad
   */
  updateAvailability: async (id: string, isAvailable: boolean): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.AVAILABILITY(id),
      { isAvailable }
    );
  },

  /**
   * Actualizar estado en línea
   */
  updateOnlineStatus: async (id: string, isOnline: boolean): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.ONLINE_STATUS(id),
      { isOnline }
    );
  },

  /**
 * Actualizar estado de verificación del trabajador
 */
updateVerificationStatus: async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  await axiosInstance.patch<ApiResponse<void>>(
    API_ENDPOINTS.WORKERS.VERIFICATION_STATUS(id),
    { status }
  );
},


  /**
   * Actualizar ubicación
   */
  updateLocation: async (id: string, latitude: number, longitude: number): Promise<void> => {
    await axiosInstance.patch<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.LOCATION(id),
      { latitude, longitude }
    );
  },

  /**
   * Agregar calificación
   */
  addRating: async (id: string, rating: number): Promise<void> => {
    await axiosInstance.post<ApiResponse<void>>(
      API_ENDPOINTS.WORKERS.ADD_RATING(id),
      { rating }
    );
  },

  /**
   * Obtener estadísticas
   */
  getStatistics: async (): Promise<WorkerStatistics> => {
    const { data } = await axiosInstance.get<ApiResponse<WorkerStatistics>>(
      API_ENDPOINTS.WORKERS.STATISTICS
    );
    
    if (!data.data) throw new Error('Failed to fetch statistics');
    return data.data;
  },
};