import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { LoginCredentials, AuthTokens } from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

export const authService = {
  /**
   * Login de usuario
   */
login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const { data } = await axiosInstance.post<AuthTokens>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Guardar tokens en localStorage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    return data; 
  } catch (error: any) {

    throw error;
  }
},


  /**
   * Refrescar token
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const { data } = await axiosInstance.post<{ access: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh: refreshToken }
    );
    
    localStorage.setItem('access_token', data.access);
    
    return data;
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Obtener token actual
   */
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
};