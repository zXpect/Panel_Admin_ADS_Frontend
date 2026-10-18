/**
 * Sistema de logging estructurado para debugging y monitoreo
 */

import { ErrorLog, ErrorContext, ApiError } from '@/types/error.types';

/**
 * Niveles de log
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Configuración del logger
 */
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  consoleOutput: boolean;
  persistLogs: boolean;
  maxStoredLogs: number;
}

/**
 * Entrada de log estructurada
 */
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  context?: ErrorContext;
  category?: string;
}

/**
 * Clase Logger para manejo centralizado de logs
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'app_error_logs';

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: import.meta.env.DEV,
      level: LogLevel.DEBUG,
      consoleOutput: true,
      persistLogs: import.meta.env.DEV,
      maxStoredLogs: 100,
      ...config,
    };

    // Cargar logs persistidos
    if (this.config.persistLogs) {
      this.loadPersistedLogs();
    }
  }

  /**
   * Actualiza la configuración del logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Determina si un nivel de log debe ser procesado
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const configuredLevel = levels.indexOf(this.config.level);
    const currentLevel = levels.indexOf(level);

    return currentLevel >= configuredLevel;
  }

  /**
   * Registra un log
   */
  private log(level: LogLevel, message: string, data?: any, context?: ErrorContext, category?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      context,
      category,
    };

    // Agregar a la cola de logs
    this.logs.push(entry);

    // Limitar el tamaño del array
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs.shift();
    }

    // Persistir si está habilitado
    if (this.config.persistLogs) {
      this.persistLogs();
    }

    // Salida a consola
    if (this.config.consoleOutput) {
      this.outputToConsole(entry);
    }
  }

  /**
   * Emite log a consola con formato
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    const categoryStr = entry.category ? ` [${entry.category}]` : '';

    const style = this.getLogStyle(entry.level);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}${categoryStr}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}${categoryStr}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}${categoryStr}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`%c${prefix}${categoryStr}`, style, entry.message, entry.data || '');
        if (entry.context) {
          console.error('Context:', entry.context);
        }
        break;
    }
  }

  /**
   * Obtiene el estilo de consola para cada nivel
   */
  private getLogStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal;',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: normal;',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
      [LogLevel.CRITICAL]: 'color: #dc2626; font-weight: bold; font-size: 1.1em;',
    };

    return styles[level];
  }

  /**
   * Persiste logs en localStorage
   */
  private persistLogs(): void {
    try {
      const logsToStore = this.logs.slice(-this.config.maxStoredLogs);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToStore));
    } catch (error) {
      console.warn('No se pudieron persistir los logs:', error);
    }
  }

  /**
   * Carga logs desde localStorage
   */
  private loadPersistedLogs(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('No se pudieron cargar los logs persistidos:', error);
    }
  }

  /**
   * Métodos públicos de logging
   */

  debug(message: string, data?: any, context?: ErrorContext): void {
    this.log(LogLevel.DEBUG, message, data, context, 'DEBUG');
  }

  info(message: string, data?: any, context?: ErrorContext): void {
    this.log(LogLevel.INFO, message, data, context, 'INFO');
  }

  warn(message: string, data?: any, context?: ErrorContext): void {
    this.log(LogLevel.WARN, message, data, context, 'WARNING');
  }

  error(message: string, data?: any, context?: ErrorContext): void {
    this.log(LogLevel.ERROR, message, data, context, 'ERROR');
  }

  critical(message: string, data?: any, context?: ErrorContext): void {
    this.log(LogLevel.CRITICAL, message, data, context, 'CRITICAL');
  }

  /**
   * Registra un error de API con toda su información
   */
  logApiError(error: ApiError, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      error,
      context,
      timestamp: Date.now(),
      environment: import.meta.env.DEV ? 'development' : 'production',
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.error(
      `API Error: ${error.code} - ${error.message}`,
      errorLog,
      context
    );

    // Si el error es crítico, también registrar como critical
    if (error.severity === 'critical') {
      this.critical(
        `Critical API Error: ${error.code}`,
        errorLog,
        context
      );
    }
  }

  /**
   * Registra actividad de usuario (para debugging)
   */
  logUserActivity(action: string, details?: any, context?: ErrorContext): void {
    this.info(`User Action: ${action}`, details, context);
  }

  /**
   * Registra eventos de performance
   */
  logPerformance(metric: string, value: number, context?: ErrorContext): void {
    this.debug(`Performance: ${metric} = ${value}ms`, { metric, value }, context);
  }

  /**
   * Obtiene todos los logs almacenados
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Obtiene logs de error (para reportes)
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(
      log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
    );
  }

  /**
   * Limpia todos los logs
   */
  clearLogs(): void {
    this.logs = [];
    if (this.config.persistLogs) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (error) {
        console.warn('No se pudieron limpiar los logs:', error);
      }
    }
  }

  /**
   * Exporta logs como JSON (para debugging/soporte)
   */
  exportLogs(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      environment: import.meta.env.DEV ? 'development' : 'production',
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs,
    }, null, 2);
  }

  /**
   * Descarga los logs como archivo
   */
  downloadLogs(): void {
    const logsJson = this.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Obtiene un resumen de errores
   */
  getErrorSummary(): {
    total: number;
    byCode: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: LogEntry[];
  } {
    const errorLogs = this.getErrorLogs();

    const byCode: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    errorLogs.forEach(log => {
      const errorData = log.data as ErrorLog | undefined;
      if (errorData?.error) {
        // Contar por código
        const code = errorData.error.code;
        byCode[code] = (byCode[code] || 0) + 1;

        // Contar por severidad
        const severity = errorData.error.severity;
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      }
    });

    return {
      total: errorLogs.length,
      byCode,
      bySeverity,
      recent: errorLogs.slice(-10), // Últimos 10 errores
    };
  }
}

// ============================================
// INSTANCIA GLOBAL DEL LOGGER
// ============================================

export const logger = new Logger();

// ============================================
// UTILIDADES DE LOGGING
// ============================================

/**
 * Hook para logging en desarrollo (React DevTools)
 */
export function useDevLogger(): void {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // Exponer el logger globalmente en desarrollo
    (window as any).__APP_LOGGER__ = logger;
    console.info(
      '%c[Dev Logger] Logger disponible en window.__APP_LOGGER__',
      'color: #3b82f6; font-weight: bold;'
    );
  }
}

/**
 * Decorator para logging automático de funciones (útil en desarrollo)
 */
export function logFunction(category: string) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();

      logger.debug(`[${category}] ${propertyKey} called`, { args });

      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;

        logger.debug(`[${category}] ${propertyKey} completed`, { duration, result });

        return result;
      } catch (error) {
        const duration = performance.now() - start;

        logger.error(`[${category}] ${propertyKey} failed`, { duration, error });

        throw error;
      }
    };

    return descriptor;
  };
}

// ============================================
// EXPORTS
// ============================================

export default logger;
