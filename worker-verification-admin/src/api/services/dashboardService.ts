import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { 
  DashboardStats, 
  TrendsResponse, 
  WeeklyTrend, 
  MonthlyTrend,
  ActivityStats 
} from '@/types/api.types';
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

  /**
   * Obtener tendencias semanales con resumen
   */
  getWeeklyTrends: async (): Promise<TrendsResponse<WeeklyTrend>> => {
    const { data } = await axiosInstance.get<ApiResponse<TrendsResponse<WeeklyTrend>>>(
      API_ENDPOINTS.DASHBOARD.WEEKLY_TRENDS
    );
    
    return data.data || { trends: [], summary: { 
      totalWorkersActive: 0, 
      totalDocsProcessed: 0,
      totalDocsUploaded: 0,
      period: '7 días' 
    }};
  },

  /**
   * Obtener tendencias mensuales con resumen
   */
  getMonthlyTrends: async (): Promise<TrendsResponse<MonthlyTrend>> => {
    const { data } = await axiosInstance.get<ApiResponse<TrendsResponse<MonthlyTrend>>>(
      API_ENDPOINTS.DASHBOARD.MONTHLY_TRENDS
    );
    
    return data.data || { trends: [], summary: { 
      totalWorkersActive: 0, 
      totalDocsProcessed: 0,
      totalDocsUploaded: 0,
      period: '30 días' 
    }};
  },

  /**
   * Obtener estadísticas de actividad detalladas
   */
  getActivityStats: async (): Promise<ActivityStats> => {
    const { data } = await axiosInstance.get<ApiResponse<ActivityStats>>(
      API_ENDPOINTS.DASHBOARD.ACTIVITY_STATS
    );
    
    if (!data.data) throw new Error('Failed to fetch activity stats');
    return data.data;
  },
};  