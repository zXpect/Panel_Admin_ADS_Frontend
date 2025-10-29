import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { Client, ClientFilters } from '@/types/client.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const clientService = {
  /**
   * Obtener lista de clientes
   */
  getClients: async (filters?: ClientFilters): Promise<Client[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    
    const { data } = await axiosInstance.get<PaginatedResponse<Client>>(
      `${API_ENDPOINTS.CLIENTS.LIST}?${params.toString()}`
    );
    
    return data.data;
  },

  /**
   * Obtener cliente por ID
   */
  getClientById: async (id: string): Promise<Client> => {
    const { data } = await axiosInstance.get<ApiResponse<Client>>(
      API_ENDPOINTS.CLIENTS.DETAIL(id)
    );
    
    if (!data.data) throw new Error('Client not found');
    return data.data;
  },

  /**
   * Obtener total de clientes
   */
  getCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<ApiResponse<{ count: number }>>(
      API_ENDPOINTS.CLIENTS.COUNT
    );
    
    return data.data?.count || 0;
  },
};