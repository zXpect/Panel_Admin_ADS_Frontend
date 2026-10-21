import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '@/types/api.types';
import {
  AuditEntity, AuditLogResponse, CatalogCategory, CatalogCategoryInput, CatalogTask, CatalogTaskInput,
  SystemConfigItem,
} from '@/types/catalog.types';

const unwrap = <T>(data: ApiResponse<T>): T => {
  if (data.data === undefined) throw new Error(data.error || 'Respuesta vacía');
  return data.data;
};

export const catalogService = {
  /** Oficios y tareas, incluidos los inactivos, con la referencia sin factor regional */
  getCatalog: async (): Promise<CatalogCategory[]> => {
    const { data } = await axiosInstance.get<ApiResponse<CatalogCategory[]>>(API_ENDPOINTS.ADMIN.CATALOG);
    return unwrap(data);
  },

  updateCategory: async (id: number, input: CatalogCategoryInput): Promise<CatalogCategory> => {
    const { data } = await axiosInstance.patch<ApiResponse<CatalogCategory>>(API_ENDPOINTS.ADMIN.CATEGORY(id), input);
    return unwrap(data);
  },

  createTask: async (input: CatalogTaskInput): Promise<CatalogTask> => {
    const { data } = await axiosInstance.post<ApiResponse<CatalogTask>>(API_ENDPOINTS.ADMIN.TASKS, input);
    return unwrap(data);
  },

  updateTask: async (id: number, input: CatalogTaskInput): Promise<CatalogTask> => {
    const { data } = await axiosInstance.patch<ApiResponse<CatalogTask>>(API_ENDPOINTS.ADMIN.TASK(id), input);
    return unwrap(data);
  },

  /** Parámetros de cotización y búsqueda (tarifa mínima, factor regional...) */
  getConfig: async (): Promise<SystemConfigItem[]> => {
    const { data } = await axiosInstance.get<ApiResponse<SystemConfigItem[]>>(API_ENDPOINTS.ADMIN.CONFIG);
    return unwrap(data);
  },

  updateConfig: async (key: string, value: string): Promise<SystemConfigItem> => {
    const { data } = await axiosInstance.patch<ApiResponse<SystemConfigItem>>(
      API_ENDPOINTS.ADMIN.CONFIG_KEY(key), { value }
    );
    return unwrap(data);
  },

  /** Historial de cambios del más reciente al más antiguo (20 por página) */
  getAudit: async (entity?: AuditEntity, page = 1): Promise<AuditLogResponse> => {
    const params = new URLSearchParams({ page: String(page) });
    if (entity) params.append('entity', entity);
    const { data } = await axiosInstance.get<AuditLogResponse>(`${API_ENDPOINTS.ADMIN.AUDIT}?${params.toString()}`);
    return data;
  },
};
