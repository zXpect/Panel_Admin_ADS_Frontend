import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '@/types/api.types';

export interface AccountStatusResult {
  uid: string;
  role: 'client' | 'worker';
  is_active: boolean;
}

export const accountService = {
  /**
   * Suspender (isActive=false) o reactivar una cuenta de cliente o trabajador.
   * Suspendida no inicia sesión; el trabajador sale del mapa y sus solicitudes sin
   * iniciar se cancelan. 409 si tiene un servicio en camino o en progreso.
   */
  setStatus: async (uid: string, isActive: boolean, reason?: string): Promise<AccountStatusResult> => {
    const { data } = await axiosInstance.patch<ApiResponse<AccountStatusResult>>(
      API_ENDPOINTS.ADMIN.ACCOUNT_STATUS(uid),
      { is_active: isActive, reason: reason || '' }
    );
    if (!data.data) throw new Error(data.error || 'Respuesta vacía');
    return data.data;
  },
};
