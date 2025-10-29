import { useState, useCallback } from 'react';
import { parseApiError, handleApiError, handleValidationError, ApiError } from '@/lib/utils/errorHandler';

interface UseErrorHandlerReturn {
  error: ApiError | null;
  validationErrors: Record<string, string> | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown, showToast?: boolean) => void;
  hasError: boolean;
  getFieldError: (field: string) => string | undefined;
}

/**
 * Hook para manejo centralizado de errores en componentes
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ApiError | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

  const setError = useCallback((err: unknown) => {
    const apiError = parseApiError(err);
    setErrorState(apiError);

    // Intentar extraer errores de validación
    const validations = handleValidationError(err);
    if (validations) {
      setValidationErrors(validations);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setValidationErrors(null);
  }, []);

  const handleError = useCallback((err: unknown, showToast: boolean = true) => {
    setError(err);
    
    if (showToast) {
      handleApiError(err);
    }
  }, [setError]);

  const getFieldError = useCallback((field: string): string | undefined => {
    return validationErrors?.[field];
  }, [validationErrors]);

  return {
    error,
    validationErrors,
    setError,
    clearError,
    handleError,
    hasError: error !== null,
    getFieldError,
  };
}