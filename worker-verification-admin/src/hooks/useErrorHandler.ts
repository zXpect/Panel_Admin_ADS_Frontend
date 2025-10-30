import { useState, useCallback } from 'react';
import {
  parseApiError,
  handleApiError,
  handleValidationError,
  isRetryableError,
  getValidationErrorMessages,
} from '@/lib/utils/errorHandler';
import { ApiError, ErrorHandlingOptions, ErrorCode } from '@/types/error.types';
import { logger } from '@/lib/utils/logger';

interface UseErrorHandlerReturn {
  error: ApiError | null;
  validationErrors: Record<string, string> | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown, options?: ErrorHandlingOptions) => ApiError;
  hasError: boolean;
  isValidationError: boolean;
  isRetryable: boolean;
  getFieldError: (field: string) => string | undefined;
  getAllFieldErrors: () => string[];
  isErrorCode: (code: ErrorCode) => boolean;
}

/**
 * Hook mejorado para manejo centralizado de errores en componentes
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ApiError | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

  /**
   * Establece un error y extrae información de validación
   */
  const setError = useCallback((err: unknown) => {
    const apiError = parseApiError(err);
    setErrorState(apiError);

    // Intentar extraer errores de validación
    const validations = handleValidationError(err);
    if (validations) {
      setValidationErrors(validations);
    }

    // Log del error en el hook
    logger.debug('Error set in useErrorHandler', {
      code: apiError.code,
      message: apiError.message,
      hasValidationErrors: !!validations,
    });
  }, []);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
    setValidationErrors(null);

    logger.debug('Errors cleared in useErrorHandler');
  }, []);

  /**
   * Maneja un error con opciones personalizables
   */
  const handleError = useCallback(
    (err: unknown, options: ErrorHandlingOptions = {}): ApiError => {
      setError(err);

      const apiError = handleApiError(err, {
        showToast: options.showToast ?? true,
        toastDuration: options.toastDuration,
        customMessage: options.customMessage,
        context: options.context,
        logError: options.logError ?? true,
      });

      return apiError;
    },
    [setError]
  );

  /**
   * Obtiene el error de un campo específico
   */
  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return validationErrors?.[field];
    },
    [validationErrors]
  );

  /**
   * Obtiene todos los mensajes de error de validación
   */
  const getAllFieldErrors = useCallback((): string[] => {
    if (!error) return [];
    return getValidationErrorMessages(error);
  }, [error]);

  /**
   * Verifica si el error actual es de un código específico
   */
  const isErrorCode = useCallback(
    (code: ErrorCode): boolean => {
      return error?.code === code;
    },
    [error]
  );

  return {
    error,
    validationErrors,
    setError,
    clearError,
    handleError,
    hasError: error !== null,
    isValidationError:
      error?.code === ErrorCode.VALIDATION_ERROR ||
      error?.code === ErrorCode.BAD_REQUEST,
    isRetryable: error ? isRetryableError(error) : false,
    getFieldError,
    getAllFieldErrors,
    isErrorCode,
  };
}