import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { parseApiError, handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import { ErrorCode } from '@/types/error.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Configuración de retry
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: [ErrorCode.TIMEOUT, ErrorCode.NETWORK_ERROR, ErrorCode.SERVICE_UNAVAILABLE],
};

/**
 * Generar ID único para requests (útil para debugging)
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Crear instancia de Axios
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================
// GESTIÓN DE REFRESH TOKEN
// ============================================

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
// UTILIDADES DE RETRY
// ============================================

/**
 * Calcula el delay para retry con backoff exponencial
 */
function getRetryDelay(retryCount: number): number {
  return RETRY_CONFIG.retryDelay * Math.pow(2, retryCount - 1);
}

/**
 * Verifica si un error puede ser reintentado
 */
function shouldRetry(error: AxiosError, retryCount: number): boolean {
  if (retryCount >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  const status = error.response?.status;

  // Reintentar errores de red
  if (!error.response) {
    return true;
  }

  // Reintentar códigos de estado específicos
  if (status && RETRY_CONFIG.retryableStatusCodes.includes(status)) {
    return true;
  }

  return false;
}

/**
 * Ejecuta un retry de la petición
 */
async function retryRequest(
  config: InternalAxiosRequestConfig & { _retryCount?: number }
): Promise<AxiosResponse> {
  const retryCount = config._retryCount || 0;
  const delay = getRetryDelay(retryCount + 1);

  logger.warn(
    `Retrying request (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`,
    {
      url: config.url,
      method: config.method,
      delay,
    }
  );

  // Esperar antes de reintentar
  await new Promise(resolve => setTimeout(resolve, delay));

  // Incrementar contador de reintentos
  config._retryCount = retryCount + 1;

  return axiosInstance(config);
}

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { _requestId?: string; _startTime?: number }) => {
    // Agregar token de autenticación
    const token = localStorage.getItem('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar request ID para tracking
    const requestId = generateRequestId();
    config._requestId = requestId;
    config._startTime = Date.now();

    if (config.headers) {
      config.headers['X-Request-ID'] = requestId;
    }

    // Logging estructurado
    logger.debug(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        requestId,
        params: config.params,
        data: config.data,
        headers: config.headers,
      }
    );

    return config;
  },
  (error: AxiosError) => {
    logger.error('Request Interceptor Error', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse & { config: InternalAxiosRequestConfig & { _requestId?: string; _startTime?: number } }) => {
    // Calcular duración de la petición
    const duration = response.config._startTime
      ? Date.now() - response.config._startTime
      : 0;

    // Logging de respuestas exitosas
    logger.debug(
      `API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        requestId: response.config._requestId,
        status: response.status,
        duration,
        data: response.data,
      }
    );

    // Log de performance si la petición tardó mucho
    if (duration > 5000) {
      logger.warn('Slow API Response', {
        url: response.config.url,
        duration,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
      _requestId?: string;
      _startTime?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestId = originalRequest._requestId;
    const retryCount = originalRequest._retryCount || 0;

    // Parsear el error con nuestro sistema mejorado
    const apiError = parseApiError(error, requestId);

    // Logging del error
    logger.logApiError(apiError, {
      route: window.location.pathname,
      action: `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
    });

    // ============================================
    // RETRY LOGIC
    // ============================================
    if (shouldRetry(error, retryCount) && !originalRequest._retry) {
      try {
        return await retryRequest(originalRequest);
      } catch (retryError) {
        // Si el retry también falla, continuar con el flujo normal de errores
        logger.error('Retry failed after max attempts', {
          requestId,
          retryCount: RETRY_CONFIG.maxRetries,
          url: originalRequest.url,
        });
      }
    }

    // ============================================
    // Manejo de errores sin respuesta (red)
    // ============================================
    if (!error.response) {
      // Solo mostrar toast si no es un retry
      if (retryCount === 0) {
        handleApiError(error, {
          showToast: true,
          customMessage: apiError.userMessage,
        });
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // ============================================
    // 401 - Token expirado o inválido (Refresh Token Logic)
    // ============================================
    if (status === 401 && !originalRequest._retry) {
      const isLoginPage = window.location.pathname.includes('/login');

      logger.warn('Unauthorized request, attempting token refresh', {
        requestId,
        url: originalRequest.url,
        isLoginPage,
      });

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
          logger.info('Attempting to refresh access token');

          // Intentar refrescar el token
          const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Guardar nuevo token
          localStorage.setItem('access_token', access);

          logger.info('Token refreshed successfully');

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
        logger.error('Token refresh failed', refreshError);

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
    // Manejo inteligente de notificaciones de errores
    // ============================================

    // Determinar si debe mostrar toast (evitar toasts duplicados en GETs)
    const shouldShowToast =
      originalRequest.method?.toLowerCase() !== 'get' ||
      status === 401 ||
      status === 403;

    // Determinar duración del toast según severidad
    const toastDuration =
      apiError.severity === 'critical' || apiError.severity === 'high'
        ? 6000
        : 4000;

    // Mostrar notificación de error usando nuestro sistema mejorado
    if (shouldShowToast) {
      // Usar handleApiError solo para logging, no para toast (evitar duplicados)
      handleApiError(error, {
        showToast: true,
        toastDuration,
        customMessage: apiError.userMessage,
        context: {
          route: window.location.pathname,
          action: `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
        },
      });
    } else {
      // Solo logging sin toast
      handleApiError(error, {
        showToast: false,
        context: {
          route: window.location.pathname,
          action: `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
        },
      });
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