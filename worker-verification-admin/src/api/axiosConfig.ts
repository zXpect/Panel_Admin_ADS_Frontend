import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Crear instancia de Axios
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Variable para evitar múltiples toasts del mismo error
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response) => {
    // Log de responses exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log de errores en desarrollo
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // ============================================
    // Manejo de errores sin respuesta (red)
    // ============================================
    if (!error.response) {
      toast.error(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        { duration: 5000 }
      );
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // ============================================
    // 401 - Token expirado o inválido
    // ============================================
    if (status === 401 && !originalRequest._retry) {
      // Evitar mostrar toast si estamos en la página de login
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (isRefreshing) {
        // Si ya se está refrescando el token, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Intentar refrescar el token
          const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          
          // Guardar nuevo token
          localStorage.setItem('access_token', access);
          
          // Procesar cola de peticiones fallidas
          processQueue(null, access);
          
          // Reintentar la petición original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          isRefreshing = false;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (!isLoginPage) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
            duration: 4000,
          });
          
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // Manejo de otros códigos de estado
    // ============================================
    
    // Solo mostrar toast si no es un GET (para evitar toasts en cargas de página)
    const shouldShowToast = error.config?.method !== 'get' || status === 401;

    switch (status) {
      case 400:
        if (shouldShowToast) {
          toast.error(
            (data as any)?.detail || 
            (data as any)?.message || 
            'Solicitud inválida. Verifica los datos enviados.',
            { duration: 4000 }
          );
        }
        break;

      case 403:
        if (shouldShowToast) {
          toast.error('No tienes permisos para realizar esta acción.', {
            duration: 4000,
          });
        }
        break;

      case 404:
        // Solo mostrar toast para 404 en operaciones que no sean GET
        if (error.config?.method !== 'get') {
          toast.error(
            (data as any)?.detail || 'El recurso solicitado no fue encontrado.',
            { duration: 4000 }
          );
        }
        break;

      case 409:
        toast.error(
          (data as any)?.detail || 'Ya existe un registro con estos datos.',
          { duration: 4000 }
        );
        break;

      case 422:
        // Error de validación
        const validationMessage = (data as any)?.detail;
        if (typeof validationMessage === 'string') {
          toast.error(validationMessage, { duration: 5000 });
        } else if (Array.isArray(validationMessage)) {
          // FastAPI validation errors
          const errorMessages = validationMessage
            .map((err: any) => {
              const field = err.loc?.[err.loc.length - 1] || '';
              return field ? `${field}: ${err.msg}` : err.msg;
            })
            .join(', ');
          toast.error(`Errores de validación: ${errorMessages}`, {
            duration: 6000,
          });
        } else {
          toast.error('Los datos enviados no son válidos.', { duration: 4000 });
        }
        break;

      case 429:
        toast.error(
          'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.',
          { duration: 5000 }
        );
        break;

      case 500:
        toast.error(
          'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.',
          { duration: 5000 }
        );
        break;

      case 502:
      case 503:
      case 504:
        toast.error(
          'El servidor no está disponible temporalmente. Por favor, inténtalo más tarde.',
          { duration: 5000 }
        );
        break;

      default:
        // Error genérico
        if (shouldShowToast && status >= 400) {
          const errorMessage = 
            (data as any)?.detail || 
            (data as any)?.message || 
            'Ha ocurrido un error inesperado.';
          
          toast.error(errorMessage, { duration: 4000 });
        }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Funciones auxiliares exportadas
// ============================================

/**
 * Limpia los tokens y datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Guarda los tokens de autenticación
 */
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Obtiene el token de acceso actual
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Obtiene el token de refresco actual
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};  

export default axiosInstance;