import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '@/types/api.types';
import { Pqr, PqrAnswerInput, PqrFilters, PqrListResponse } from '@/types/pqr.types';

export const pqrService = {
  /**
   * Listar todas las PQR (el panel ve las de todos los usuarios; 20 por página)
   */
  getPqrs: async (filters?: PqrFilters): Promise<PqrListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));

    const { data } = await axiosInstance.get<PqrListResponse>(
      `${API_ENDPOINTS.PQR.LIST}?${params.toString()}`
    );

    return data;
  },

  /**
   * Pasar a trámite o cerrar con respuesta (avisa al autor con un push)
   */
  answerPqr: async (id: number, input: PqrAnswerInput): Promise<Pqr> => {
    const { data } = await axiosInstance.patch<ApiResponse<Pqr>>(
      API_ENDPOINTS.PQR.DETAIL(id),
      input
    );

    if (!data.data) throw new Error('PQR not found');
    return data.data;
  },
};
