/**
 * Tipos de errores mejorados para manejo de errores Django REST Framework
 */

/**
 * Códigos de error estandarizados
 */
export enum ErrorCode {
  // Errores de red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Errores de cliente (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',

  // Errores de servidor (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // Errores específicos de la aplicación
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_TOKEN_FAILED = 'REFRESH_TOKEN_FAILED',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',

  // Error genérico
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Severidad del error (para logging y UI)
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Categoría del error (para análisis y métricas)
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * Error de validación de campo específico (formato Django REST Framework)
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Error de validación genérico de Django
 */
export interface DjangoValidationError {
  [field: string]: string[];
}

/**
 * Error de detalle de Django REST Framework
 */
export interface DjangoErrorDetail {
  detail?: string | DjangoValidationError | any[];
  message?: string;
  code?: string;
  errors?: DjangoValidationError;
  non_field_errors?: string[];
}

/**
 * Estructura principal del error de API
 */
export interface ApiError {
  // Información básica del error
  message: string;
  code: ErrorCode;
  status?: number;

  // Categorización
  severity: ErrorSeverity;
  category: ErrorCategory;

  // Detalles específicos
  details?: any;
  fieldErrors?: FieldError[];
  validationErrors?: DjangoValidationError;

  // Información técnica (para debugging)
  timestamp: number;
  requestId?: string;
  endpoint?: string;
  method?: string;

  // Stack trace (solo en desarrollo)
  stack?: string;

  // Información adicional
  userMessage?: string; // Mensaje amigable para mostrar al usuario
  technicalMessage?: string; // Mensaje técnico para logging
  retryable?: boolean; // Si el error puede ser reintentado
  retryAfter?: number; // Segundos para reintentar (usado en rate limiting)
}

/**
 * Contexto del error (información adicional para logging)
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Log estructurado de error
 */
export interface ErrorLog {
  error: ApiError;
  context?: ErrorContext;
  timestamp: number;
  environment: 'development' | 'production';
  userAgent?: string;
  url?: string;
}

/**
 * Configuración de retry
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // ms
  retryableStatusCodes: number[];
  retryableErrorCodes: ErrorCode[];
}

/**
 * Opciones de manejo de error
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  toastDuration?: number;
  logError?: boolean;
  throwError?: boolean;
  customMessage?: string;
  context?: ErrorContext;
  retry?: boolean;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * Respuesta de error del servidor (formato completo)
 */
export interface ServerErrorResponse {
  success: false;
  error?: string;
  message?: string;
  detail?: string | DjangoValidationError | any[];
  errors?: DjangoValidationError;
  non_field_errors?: string[];
  code?: string;
}

/**
 * Estado de error en React
 */
export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  isLoading: boolean;
  canRetry: boolean;
}
