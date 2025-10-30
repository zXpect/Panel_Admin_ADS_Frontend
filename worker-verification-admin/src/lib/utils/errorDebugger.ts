/**
 * Utilidades para debugging y tracking de errores
 */

import { logger } from './logger';
import { ApiError } from '@/types/error.types';

/**
 * Panel de debugging de errores (solo desarrollo)
 */
export class ErrorDebugger {
  private static instance: ErrorDebugger;
  private errorHistory: ApiError[] = [];
  private readonly MAX_HISTORY = 50;

  private constructor() {
    if (import.meta.env.DEV) {
      this.setupGlobalErrorHandler();
      this.exposeDebugTools();
    }
  }

  static getInstance(): ErrorDebugger {
    if (!ErrorDebugger.instance) {
      ErrorDebugger.instance = new ErrorDebugger();
    }
    return ErrorDebugger.instance;
  }

  /**
   * Configura manejadores globales de errores
   */
  private setupGlobalErrorHandler(): void {
    // Capturar errores no manejados
    window.addEventListener('error', (event) => {
      logger.critical('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Capturar promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      logger.critical('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  /**
   * Expone herramientas de debugging en window
   */
  private exposeDebugTools(): void {
    (window as any).__ERROR_DEBUGGER__ = {
      getHistory: () => this.errorHistory,
      clearHistory: () => this.clearHistory(),
      getSummary: () => this.getErrorSummary(),
      downloadReport: () => this.downloadErrorReport(),
      showStats: () => this.showErrorStats(),
      logger: logger,
    };

    console.info(
      '%c[Error Debugger] Herramientas de debugging disponibles en window.__ERROR_DEBUGGER__',
      'color: #10b981; font-weight: bold;'
    );
  }

  /**
   * Registra un error en el historial
   */
  trackError(error: ApiError): void {
    this.errorHistory.push(error);

    // Limitar el tamaño del historial
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory.shift();
    }
  }

  /**
   * Limpia el historial de errores
   */
  clearHistory(): void {
    this.errorHistory = [];
    logger.info('Error history cleared');
  }

  /**
   * Obtiene un resumen de errores
   */
  getErrorSummary(): {
    total: number;
    byCode: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentErrors: ApiError[];
  } {
    const byCode: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    this.errorHistory.forEach((error) => {
      // Contar por código
      byCode[error.code] = (byCode[error.code] || 0) + 1;

      // Contar por severidad
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;

      // Contar por categoría
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
    });

    return {
      total: this.errorHistory.length,
      byCode,
      bySeverity,
      byCategory,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Muestra estadísticas de errores en consola
   */
  showErrorStats(): void {
    const summary = this.getErrorSummary();

    console.group('%c📊 Error Statistics', 'color: #3b82f6; font-weight: bold; font-size: 1.2em;');

    console.log('%cTotal Errors:', 'font-weight: bold;', summary.total);

    console.group('By Code');
    console.table(summary.byCode);
    console.groupEnd();

    console.group('By Severity');
    console.table(summary.bySeverity);
    console.groupEnd();

    console.group('By Category');
    console.table(summary.byCategory);
    console.groupEnd();

    console.group('Recent Errors (Last 10)');
    summary.recentErrors.forEach((error, index) => {
      console.log(
        `${index + 1}. [${error.code}] ${error.message}`,
        {
          severity: error.severity,
          category: error.category,
          timestamp: new Date(error.timestamp).toISOString(),
          endpoint: error.endpoint,
        }
      );
    });
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Descarga un reporte completo de errores
   */
  downloadErrorReport(): void {
    const report = {
      generatedAt: new Date().toISOString(),
      environment: import.meta.env.DEV ? 'development' : 'production',
      userAgent: navigator.userAgent,
      url: window.location.href,
      summary: this.getErrorSummary(),
      allErrors: this.errorHistory,
      systemLogs: logger.getLogs(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('Error report downloaded');
  }

  /**
   * Analiza patrones de errores
   */
  analyzeErrorPatterns(): {
    mostCommonError: string | null;
    mostCommonEndpoint: string | null;
    errorRate: number;
    criticalErrorRate: number;
  } {
    if (this.errorHistory.length === 0) {
      return {
        mostCommonError: null,
        mostCommonEndpoint: null,
        errorRate: 0,
        criticalErrorRate: 0,
      };
    }

    // Error más común
    const errorCounts: Record<string, number> = {};
    this.errorHistory.forEach((error) => {
      errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
    });

    const mostCommonError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Endpoint más problemático
    const endpointCounts: Record<string, number> = {};
    this.errorHistory.forEach((error) => {
      if (error.endpoint) {
        endpointCounts[error.endpoint] = (endpointCounts[error.endpoint] || 0) + 1;
      }
    });

    const mostCommonEndpoint = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Tasa de errores críticos
    const criticalErrors = this.errorHistory.filter((error) => error.severity === 'critical').length;
    const criticalErrorRate = (criticalErrors / this.errorHistory.length) * 100;

    return {
      mostCommonError,
      mostCommonEndpoint,
      errorRate: 100, // Siempre 100% en este contexto ya que solo tenemos errores
      criticalErrorRate,
    };
  }
}

// ============================================
// FUNCIONES AUXILIARES DE DEBUGGING
// ============================================

/**
 * Imprime información detallada de un error
 */
export function debugError(error: ApiError, context?: string): void {
  if (!import.meta.env.DEV) return;

  const prefix = context ? `[${context}]` : '[Error Debug]';

  console.group(`%c${prefix} Error Details`, 'color: #ef4444; font-weight: bold;');
  console.log('%cCode:', 'font-weight: bold;', error.code);
  console.log('%cMessage:', 'font-weight: bold;', error.message);
  console.log('%cSeverity:', 'font-weight: bold;', error.severity);
  console.log('%cCategory:', 'font-weight: bold;', error.category);
  console.log('%cStatus:', 'font-weight: bold;', error.status);
  console.log('%cRetryable:', 'font-weight: bold;', error.retryable ? 'Yes' : 'No');

  if (error.endpoint) {
    console.log('%cEndpoint:', 'font-weight: bold;', `${error.method} ${error.endpoint}`);
  }

  if (error.fieldErrors && error.fieldErrors.length > 0) {
    console.group('Field Errors');
    console.table(error.fieldErrors);
    console.groupEnd();
  }

  if (error.validationErrors) {
    console.group('Validation Errors');
    console.table(error.validationErrors);
    console.groupEnd();
  }

  if (error.details) {
    console.group('Additional Details');
    console.log(error.details);
    console.groupEnd();
  }

  console.log('%cTimestamp:', 'font-weight: bold;', new Date(error.timestamp).toISOString());

  if (error.requestId) {
    console.log('%cRequest ID:', 'font-weight: bold;', error.requestId);
  }

  console.groupEnd();
}

/**
 * Compara dos errores para debugging
 */
export function compareErrors(error1: ApiError, error2: ApiError): void {
  if (!import.meta.env.DEV) return;

  console.group('%cError Comparison', 'color: #8b5cf6; font-weight: bold;');

  console.table({
    'Error 1': {
      code: error1.code,
      severity: error1.severity,
      category: error1.category,
      retryable: error1.retryable,
      endpoint: error1.endpoint,
    },
    'Error 2': {
      code: error2.code,
      severity: error2.severity,
      category: error2.category,
      retryable: error2.retryable,
      endpoint: error2.endpoint,
    },
  });

  console.groupEnd();
}

/**
 * Simula un error para testing (solo desarrollo)
 */
export function simulateError(
  code: string,
  message: string,
  throwError: boolean = false
): void {
  if (!import.meta.env.DEV) {
    console.warn('simulateError is only available in development');
    return;
  }

  const error = new Error(message);
  error.name = code;

  logger.error('Simulated Error', { code, message });

  if (throwError) {
    throw error;
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Inicializar el debugger en desarrollo
if (import.meta.env.DEV) {
  ErrorDebugger.getInstance();
}

// Export
export default ErrorDebugger.getInstance();
