import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-[hsl(var(--card))] rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all my-4 mx-4 sm:my-8 sm:mx-0 sm:align-middle sm:max-w-lg w-full sm:p-6 border border-[hsl(var(--border))]">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[hsl(var(--destructive))]/10 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-[hsl(var(--destructive))]" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-[hsl(var(--foreground))]">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] text-base font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--destructive))] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-[hsl(var(--border))] shadow-sm px-4 py-2 bg-[hsl(var(--secondary))] text-base font-medium text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};