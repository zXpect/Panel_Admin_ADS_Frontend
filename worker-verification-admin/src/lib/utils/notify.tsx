import toast, { ToastOptions } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

/** Aviso (ni éxito ni error) con el ícono de alerta de trazo en lugar de un emoji. */
export const toastWarning = (message: string, options?: ToastOptions) =>
  toast(message, {
    icon: (
      <AlertTriangle
        className="w-5 h-5 shrink-0 text-[hsl(var(--warning-foreground))]"
        aria-hidden="true"
      />
    ),
    ...options,
  });
