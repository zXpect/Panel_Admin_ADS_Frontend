import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  ApiError,
  ErrorCode,
  ErrorSeverity,
  ErrorCategory,
  FieldError,
  DjangoValidationError,
  ErrorHandlingOptions,
  ServerErrorResponse,
} from '@/types/error.types';

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_ERROR_MESSAGE = 'Ha ocurrido un error inesperado';
const DEFAULT_NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';

/**
 * Convierte detail a string de forma segura
 */
const detailToString = (detail: string | any[] | DjangoValidationError | undefined, fallback: string): string => {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.join(', ');
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return fallback;
};

/**
 * Mapeo de códigos de estado HTTP a categorías de error
 */
const STATUS_TO_CATEGORY: Record<number, ErrorCategory> = {
  401: ErrorCategory.AUTHENTICATION,
  403: ErrorCategory.AUTHORIZATION,
  400: ErrorCategory.VALIDATION,
  422: ErrorCategory.VALIDATION,
  404: ErrorCategory.CLIENT,
  409: ErrorCategory.CLIENT,
  429: ErrorCategory.CLIENT,
  500: ErrorCategory.SERVER,
  502: ErrorCategory.SERVER,
  503: ErrorCategory.SERVER,
  504: ErrorCategory.SERVER,
};

/**
 * Mapeo de códigos de estado HTTP a severidad
 */
const STATUS_TO_SEVERITY: Record<number, ErrorSeverity> = {
  400: ErrorSeverity.MEDIUM,
  401: ErrorSeverity.HIGH,
  403: ErrorSeverity.HIGH,
  404: ErrorSeverity.LOW,
  409: ErrorSeverity.MEDIUM,
  422: ErrorSeverity.MEDIUM,
  429: ErrorSeverity.MEDIUM,
  500: ErrorSeverity.CRITICAL,
  502: ErrorSeverity.CRITICAL,
  503: ErrorSeverity.CRITICAL,
  504: ErrorSeverity.CRITICAL,
};

// ============================================
// FUNCIONES DE PARSING DE ERRORES DJANGO
// ============================================

/**
 * Extrae errores de validación de Django REST Framework
 */
function extractDjangoValidationErrors(data: any): {
  validationErrors?: DjangoValidationError;
  fieldErrors?: FieldError[];
  mainMessage?: string;
} {
  const result: {
    validationErrors?: DjangoValidationError;
    fieldErrors?: FieldError[];
    mainMessage?: string;
  } = {};

  // Caso 1: Errores en formato { field: [error1, error2] }
  if (data?.errors && typeof data.errors === 'object') {
    result.validationErrors = data.errors;
    result.fieldErrors = convertDjangoErrorsToFieldErrors(data.errors);
  }

  // Caso 2: Errores directamente en data como { field: [error1, error2] }
  else if (data && typeof data === 'object' && !data.detail && !data.message) {
    // Verificar si parece un objeto de errores de validación
    const hasArrayValues = Object.values(data).some(value => Array.isArray(value));
    if (hasArrayValues) {
      result.validationErrors = data;
      result.fieldErrors = convertDjangoErrorsToFieldErrors(data);
    }
  }

  // Caso 3: non_field_errors
  if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
    result.mainMessage = data.non_field_errors.join(', ');
  }

  // Caso 4: detail como string
  if (typeof data?.detail === 'string') {
    result.mainMessage = data.detail;
  }

  // Caso 5: detail como objeto de errores
  else if (data?.detail && typeof data.detail === 'object' && !Array.isArray(data.detail)) {
    result.validationErrors = data.detail;
    result.fieldErrors = convertDjangoErrorsToFieldErrors(data.detail);
  }

  // Caso 6: detail como array (errores de FastAPI/Pydantic)
  else if (Array.isArray(data?.detail)) {
    result.fieldErrors = data.detail.map((err: any) => ({
      field: err.loc?.[err.loc.length - 1] || 'general',
      message: err.msg || 'Campo inválido',
      code: err.type,
    }));
  }

  return result;
}

/**
 * Convierte errores de Django al formato FieldError[]
 */
function convertDjangoErrorsToFieldErrors(errors: DjangoValidationError): FieldError[] {
  const fieldErrors: FieldError[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      messages.forEach(message => {
        fieldErrors.push({
          field,
          message: typeof message === 'string' ? message : String(message),
        });
      });
    } else {
      fieldErrors.push({
        field,
        message: typeof messages === 'string' ? messages : String(messages),
      });
    }
  }

  return fieldErrors;
}

/**
 * Genera un mensaje amigable a partir de errores de campo
 */
function generateUserFriendlyMessage(fieldErrors?: FieldError[], mainMessage?: string): string {
  if (mainMessage) {
    return mainMessage;
  }

  if (!fieldErrors || fieldErrors.length === 0) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (fieldErrors.length === 1) {
    return `${fieldErrors[0].field}: ${fieldErrors[0].message}`;
  }

  // Para múltiples errores, mostrar solo los primeros dos
  const first = fieldErrors[0];
  const second = fieldErrors[1];
  const remaining = fieldErrors.length - 2;

  let message = `${first.field}: ${first.message}, ${second.field}: ${second.message}`;
  if (remaining > 0) {
    message += ` y ${remaining} error${remaining > 1 ? 'es' : ''} más`;
  }

  return message;
}

// ============================================
// FUNCIÓN PRINCIPAL DE PARSING
// ============================================

/**
 * Extrae y estructura información completa de un error
 */
export function parseApiError(error: unknown, requestId?: string): ApiError {
  const timestamp = Date.now();

  // Error de Axios (error de HTTP/red)
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ServerErrorResponse | undefined;
    const config = error.config;

    // Error de red (sin respuesta del servidor)
    if (!error.response) {
      return {
        message: error.code === 'ECONNABORTED'
          ? 'La solicitud tardó demasiado tiempo. Intenta de nuevo.'
          : DEFAULT_NETWORK_ERROR_MESSAGE,
        code: error.code === 'ECONNABORTED' ? ErrorCode.TIMEOUT : ErrorCode.NETWORK_ERROR,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        timestamp,
        endpoint: config?.url,
        method: config?.method?.toUpperCase(),
        requestId,
        retryable: true,
        userMessage: 'Problema de conexión. Por favor, verifica tu internet.',
        technicalMessage: error.message,
      };
    }

    // Determinar categoría y severidad basado en el status
    const category = STATUS_TO_CATEGORY[status!] || ErrorCategory.UNKNOWN;
    const severity = STATUS_TO_SEVERITY[status!] || ErrorSeverity.MEDIUM;

    // Extraer errores de validación de Django
    const { validationErrors, fieldErrors, mainMessage } = extractDjangoValidationErrors(data);

    // Construir el error basado en el código de estado
    switch (status) {
      case 400: {
        const userMessage = mainMessage ||
          generateUserFriendlyMessage(fieldErrors) ||
          'Los datos enviados no son válidos';

        return {
          message: userMessage,
          code: ErrorCode.BAD_REQUEST,
          status,
          severity,
          category,
          validationErrors,
          fieldErrors,
          details: data,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage,
          technicalMessage: `Bad Request: ${config?.url}`,
        };
      }

      case 401: {
        return {
          message: detailToString(data?.detail, 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'),
          code: ErrorCode.UNAUTHORIZED,
          status,
          severity,
          category,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage: 'Sesión expirada. Por favor, inicia sesión.',
          technicalMessage: 'Unauthorized - Token expired or invalid',
        };
      }

      case 403: {
        return {
          message: detailToString(data?.detail, 'No tienes permisos para realizar esta acción.'),
          code: ErrorCode.FORBIDDEN,
          status,
          severity,
          category,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage: 'No tienes permisos para esta acción.',
          technicalMessage: 'Forbidden - Insufficient permissions',
        };
      }

      case 404: {
        return {
          message: detailToString(data?.detail, 'El recurso solicitado no fue encontrado.'),
          code: ErrorCode.NOT_FOUND,
          status,
          severity,
          category,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage: 'No se encontró el recurso solicitado.',
          technicalMessage: `Not Found: ${config?.url}`,
        };
      }

      case 409: {
        return {
          message: detailToString(data?.detail, 'Ya existe un registro con estos datos.'),
          code: ErrorCode.CONFLICT,
          status,
          severity,
          category,
          validationErrors,
          fieldErrors,
          details: data,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage: 'Ya existe un registro con estos datos.',
          technicalMessage: 'Conflict - Duplicate resource',
        };
      }

      case 422: {
        const userMessage = mainMessage ||
          generateUserFriendlyMessage(fieldErrors) ||
          'Los datos enviados no son válidos';

        return {
          message: userMessage,
          code: ErrorCode.VALIDATION_ERROR,
          status,
          severity,
          category,
          validationErrors,
          fieldErrors,
          details: data,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage,
          technicalMessage: 'Validation Error',
        };
      }

      case 429: {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);

        return {
          message: 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.',
          code: ErrorCode.RATE_LIMIT,
          status,
          severity,
          category,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: true,
          retryAfter,
          userMessage: `Demasiadas solicitudes. Espera ${retryAfter} segundos.`,
          technicalMessage: 'Rate limit exceeded',
        };
      }

      case 500: {
        return {
          message: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          status,
          severity,
          category,
          details: data,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: true,
          userMessage: 'Error del servidor. Intenta más tarde.',
          technicalMessage: detailToString(data?.detail, 'Internal Server Error'),
        };
      }

      case 502:
      case 503:
      case 504: {
        return {
          message: 'El servidor no está disponible temporalmente. Por favor, inténtalo más tarde.',
          code: ErrorCode.SERVICE_UNAVAILABLE,
          status,
          severity,
          category,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: true,
          userMessage: 'Servicio no disponible. Intenta más tarde.',
          technicalMessage: `Service Unavailable (${status})`,
        };
      }

      default: {
        const userMessage = detailToString(data?.detail, '') || detailToString(data?.message, DEFAULT_ERROR_MESSAGE);

        return {
          message: userMessage,
          code: ErrorCode.UNKNOWN_ERROR,
          status,
          severity,
          category,
          validationErrors,
          fieldErrors,
          details: data,
          timestamp,
          endpoint: config?.url,
          method: config?.method?.toUpperCase(),
          requestId,
          retryable: false,
          userMessage,
          technicalMessage: `Unknown HTTP Error (${status})`,
        };
      }
    }
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      code: ErrorCode.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      timestamp,
      requestId,
      retryable: false,
      userMessage: DEFAULT_ERROR_MESSAGE,
      technicalMessage: error.message,
      stack: import.meta.env.DEV ? error.stack : undefined,
    };
  }

  // Error completamente desconocido
  return {
    message: DEFAULT_ERROR_MESSAGE,
    code: ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.UNKNOWN,
    timestamp,
    requestId,
    retryable: false,
    userMessage: DEFAULT_ERROR_MESSAGE,
    technicalMessage: 'Unknown error type',
    details: error,
  };
}

// ============================================
// FUNCIONES DE MANEJO DE ERRORES
// ============================================

/**
 * Maneja un error mostrando notificación y logging
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): ApiError {
  const {
    showToast = true,
    toastDuration = 5000,
    logError = true,
    customMessage,
    context,
  } = options;

  const apiError = parseApiError(error);

  // Mensaje a mostrar
  const displayMessage = customMessage || apiError.userMessage || apiError.message;

  // Mostrar toast según severidad
  if (showToast) {
    const toastOptions = {
      duration: toastDuration,
      position: 'top-right' as const,
    };

    switch (apiError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(displayMessage, { ...toastOptions, duration: 6000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(displayMessage, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast(displayMessage, toastOptions);
        break;
    }
  }

  // Logging estructurado
  if (logError && import.meta.env.DEV) {
    const logStyle = `color: ${
      apiError.severity === ErrorSeverity.CRITICAL ? '#ef4444' :
      apiError.severity === ErrorSeverity.HIGH ? '#f97316' :
      apiError.severity === ErrorSeverity.MEDIUM ? '#eab308' :
      '#6b7280'
    }; font-weight: bold;`;

    console.group(`%c[API Error] ${apiError.code} - ${apiError.severity.toUpperCase()}`, logStyle);
    console.log('Message:', apiError.message);
    console.log('Status:', apiError.status);
    console.log('Category:', apiError.category);
    console.log('Endpoint:', apiError.endpoint);
    console.log('Method:', apiError.method);

    if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
      console.log('Field Errors:', apiError.fieldErrors);
    }

    if (apiError.validationErrors) {
      console.log('Validation Errors:', apiError.validationErrors);
    }

    if (context) {
      console.log('Context:', context);
    }

    if (apiError.details) {
      console.log('Details:', apiError.details);
    }

    if (apiError.stack) {
      console.log('Stack:', apiError.stack);
    }

    console.log('Original Error:', error);
    console.groupEnd();
  }

  return apiError;
}

/**
 * Maneja errores de validación específicos (retorna errores por campo)
 */
export function handleValidationError(error: unknown): Record<string, string> | null {
  const apiError = parseApiError(error);

  if (apiError.validationErrors) {
    // Convertir de string[] a string (tomar el primer error de cada campo)
    const fieldMap: Record<string, string> = {};

    for (const [field, messages] of Object.entries(apiError.validationErrors)) {
      fieldMap[field] = Array.isArray(messages) ? messages[0] : messages;
    }

    return fieldMap;
  }

  if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
    const fieldMap: Record<string, string> = {};

    apiError.fieldErrors.forEach(fieldError => {
      if (!fieldMap[fieldError.field]) {
        fieldMap[fieldError.field] = fieldError.message;
      }
    });

    return fieldMap;
  }

  return null;
}

/**
 * Verifica si un error es de un tipo específico
 */
export function isErrorType(error: unknown, code: ErrorCode): boolean {
  const apiError = parseApiError(error);
  return apiError.code === code;
}

/**
 * Verifica si un error puede ser reintentado
 */
export function isRetryableError(error: unknown): boolean {
  const apiError = parseApiError(error);
  return apiError.retryable || false;
}

/**
 * Obtiene todos los mensajes de error de validación formateados
 */
export function getValidationErrorMessages(error: unknown): string[] {
  const apiError = parseApiError(error);

  if (!apiError.fieldErrors || apiError.fieldErrors.length === 0) {
    return [];
  }

  return apiError.fieldErrors.map(
    fieldError => `${fieldError.field}: ${fieldError.message}`
  );
}

/**
 * Crea un mensaje de error amigable para el usuario
 */
export function getFriendlyErrorMessage(error: unknown, context?: string): string {
  const apiError = parseApiError(error);
  const message = apiError.userMessage || apiError.message;

  if (context) {
    return `${context}: ${message}`;
  }

  return message;
}

// ============================================
// EXPORT LEGACY (mantener compatibilidad)
// ============================================

// Re-exportar el tipo ApiError para compatibilidad
export type { ApiError } from '@/types/error.types';