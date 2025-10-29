import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Extrae información útil de un error de Axios
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Error de red
    if (!error.response) {
      return {
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
      };
    }

    // Errores específicos por código de estado
    switch (status) {
      case 400:
        return {
          message: data?.detail || data?.message || 'Solicitud inválida',
          code: 'BAD_REQUEST',
          status,
          details: data,
        };

      case 401:
        return {
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
          status,
        };

      case 403:
        return {
          message: 'No tienes permisos para realizar esta acción.',
          code: 'FORBIDDEN',
          status,
        };

      case 404:
        return {
          message: data?.detail || 'El recurso solicitado no fue encontrado.',
          code: 'NOT_FOUND',
          status,
        };

      case 409:
        return {
          message: data?.detail || 'Ya existe un registro con estos datos.',
          code: 'CONFLICT',
          status,
          details: data,
        };

      case 422:
        return {
          message: data?.detail || 'Los datos enviados no son válidos.',
          code: 'VALIDATION_ERROR',
          status,
          details: data,
        };

      case 429:
        return {
          message: 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.',
          code: 'RATE_LIMIT',
          status,
        };

      case 500:
        return {
          message: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
          code: 'INTERNAL_SERVER_ERROR',
          status,
        };

      case 502:
      case 503:
      case 504:
        return {
          message: 'El servidor no está disponible temporalmente. Inténtalo más tarde.',
          code: 'SERVICE_UNAVAILABLE',
          status,
        };

      default:
        return {
          message: data?.detail || data?.message || 'Ha ocurrido un error inesperado.',
          code: 'UNKNOWN_ERROR',
          status,
          details: data,
        };
    }
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    return {
      message: error.message || 'Ha ocurrido un error inesperado.',
      code: 'GENERIC_ERROR',
    };
  }

  // Error desconocido
  return {
    message: 'Ha ocurrido un error desconocido.',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Maneja un error mostrando un toast con el mensaje apropiado
 */
export function handleApiError(error: unknown, customMessage?: string): ApiError {
  const apiError = parseApiError(error);
  
  const message = customMessage || apiError.message;
  
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });

  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      original: error,
      parsed: apiError,
    });
  }

  return apiError;
}

/**
 * Maneja errores de validación específicos
 */
export function handleValidationError(error: unknown): Record<string, string> | null {
  const apiError = parseApiError(error);
  
  if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
    // FastAPI devuelve errores de validación en format detail
    if (Array.isArray(apiError.details.detail)) {
      const errors: Record<string, string> = {};
      
      apiError.details.detail.forEach((err: any) => {
        const field = err.loc?.[err.loc.length - 1] || 'general';
        errors[field] = err.msg || 'Campo inválido';
      });
      
      return errors;
    }
  }
  
  return null;
}

/**
 * Verifica si un error es de un tipo específico
 */
export function isErrorType(error: unknown, type: string): boolean {
  const apiError = parseApiError(error);
  return apiError.code === type;
}

/**
 * Crea un mensaje de error amigable para el usuario
 */
export function getFriendlyErrorMessage(error: unknown, context?: string): string {
  const apiError = parseApiError(error);
  
  if (context) {
    return `${context}: ${apiError.message}`;
  }
  
  return apiError.message;
}