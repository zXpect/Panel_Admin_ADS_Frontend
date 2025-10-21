// src/api/services/dashboardService.ts
import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { DashboardStats } from '@/types/api.types';
import { ApiResponse } from '@/types/api.types';

export const dashboardService = {
  /**
   * Obtener estadísticas del dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.DASHBOARD.STATS
    );
    
    if (!data.data) throw new Error('Failed to fetch dashboard stats');
    return data.data;
  },
};