import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ErrorAlertProps {
  message?: string;
  variant?: 'error' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
  className?: string;
  details?: string[];
}

export const ErrorAlert = ({
  message,
  variant = 'error',
  title,
  onClose,
  className,
  details,
}: ErrorAlertProps) => {
  if (!message) return null;

  const variantStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
      close: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
      close: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
      close: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
    },
  };

  const styles = variantStyles[variant];

  const IconComponent = variant === 'error' ? AlertCircle : variant === 'warning' ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-300 animate-slide-down shadow-md hover:shadow-lg',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('w-5 h-5 flex-shrink-0 mt-0.5 animate-scale-in', styles.icon)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('font-semibold mb-1', styles.title)}>
              {title}
            </p>
          )}
          
          <p className={cn('text-sm', styles.message)}>
            {message}
          </p>

          {details && details.length > 0 && (
            <ul className={cn('mt-2 text-sm space-y-1 list-disc list-inside', styles.message)}>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95',
              styles.close
            )}
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};