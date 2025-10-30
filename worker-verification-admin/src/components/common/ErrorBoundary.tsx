import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Download, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/utils/logger';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `err_boundary_${Date.now()}`;

    // Logging estructurado
    logger.critical('React Error Boundary triggered', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Llamar al callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En producción, aquí se podría enviar a un servicio de logging externo
    // como Sentry, LogRocket, etc.
    // if (import.meta.env.PROD) {
    //   sendToErrorTrackingService(error, errorInfo, errorId);
    // }
  }

  private handleReset = () => {
    logger.info('Error boundary reset');

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    logger.info('Page reload requested from error boundary');
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;

    const errorDetails = JSON.stringify(
      {
        errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        },
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      null,
      2
    );

    navigator.clipboard
      .writeText(errorDetails)
      .then(() => {
        toast.success('Detalles del error copiados al portapapeles');
        logger.info('Error details copied to clipboard', { errorId });
      })
      .catch((err) => {
        toast.error('No se pudieron copiar los detalles del error');
        logger.error('Failed to copy error details', err);
      });
  };

  private downloadErrorLog = () => {
    const { error, errorInfo, errorId } = this.state;

    const errorLog = {
      errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      recentLogs: logger.getErrorLogs().slice(-20), // Últimos 20 errores
    };

    const blob = new Blob([JSON.stringify(errorLog, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-report-${errorId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('Error log downloaded', { errorId });
    toast.success('Reporte de error descargado');
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
          <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
              ¡Oops! Algo salió mal
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y
              estamos trabajando para solucionarlo.
            </p>

            {/* Error ID */}
            {this.state.errorId && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-mono">
                  ID de Error: {this.state.errorId}
                </p>
              </div>
            )}

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Detalles del error (solo visible en desarrollo):
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={this.copyErrorDetails}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Copiar detalles"
                    >
                      <Copy className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                    <button
                      onClick={this.downloadErrorLog}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Descargar reporte"
                    >
                      <Download className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-red-700 dark:text-red-400 overflow-x-auto whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                      Ver stack trace
                    </summary>
                    <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Intentar de nuevo</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Recargar página</span>
              </button>

              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Ir al inicio</span>
              </Link>
            </div>

            {/* Support info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si el problema persiste, contacta a soporte técnico
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}