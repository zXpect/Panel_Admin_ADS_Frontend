import { Link } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error?: {
    status?: number;
    message?: string;
    code?: string;
  };
}

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const status = error?.status || 500;
  const message = error?.message || 'Ha ocurrido un error inesperado';
  
  const getErrorTitle = (status: number) => {
    switch (status) {
      case 500:
        return 'Error del Servidor';
      case 503:
        return 'Servicio No Disponible';
      case 502:
      case 504:
        return 'Error de Conexión';
      default:
        return 'Error';
    }
  };

  const getErrorDescription = (status: number) => {
    switch (status) {
      case 500:
        return 'Estamos experimentando problemas técnicos. Nuestro equipo ya está trabajando en solucionarlo.';
      case 503:
        return 'El servicio está temporalmente fuera de línea por mantenimiento. Por favor, intenta más tarde.';
      case 502:
      case 504:
        return 'No pudimos establecer conexión con el servidor. Por favor, verifica tu conexión a internet.';
      default:
        return 'Algo salió mal. Por favor, intenta de nuevo.';
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Status Code */}
        <div className="mb-4">
          <h1 className="text-7xl font-black text-gray-200 dark:text-neutral-800 mb-2">
            {status}
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {getErrorTitle(status)}
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {getErrorDescription(status)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          {message}
        </p>

        {/* Error Code */}
        {error?.code && (
          <div className="mb-8 p-3 bg-gray-100 dark:bg-neutral-800 rounded-lg inline-block">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Código de error: <span className="font-mono font-semibold">{error.code}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={handleReload}
            className="flex items-center justify-center gap-2 px-6 py-3 
                       bg-primary text-primary-foreground rounded-lg 
                       hover:opacity-90 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Intentar de nuevo</span>
          </button>

          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 
                       bg-gray-200 dark:bg-neutral-800 
                       text-gray-700 dark:text-gray-200 
                       rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-700 
                       transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Ir al Dashboard</span>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Si el problema persiste, puedes:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Verificar tu conexión a internet</li>
            <li>• Limpiar el caché del navegador</li>
            <li>• Contactar al soporte técnico</li>
          </ul>
        </div>

        {/* Timestamp */}
        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          {new Date().toLocaleString('es-CO', {
            dateStyle: 'full',
            timeStyle: 'long',
          })}
        </div>
      </div>
    </div>
  );
};