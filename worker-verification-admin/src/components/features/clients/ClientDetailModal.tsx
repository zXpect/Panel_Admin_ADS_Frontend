import { X, Mail, Phone, User, Calendar } from 'lucide-react';
import { Client } from '@/types/client.types';
import { getInitials, formatDate } from '@/lib/utils/helpers';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const ClientDetailModal = ({
  isOpen,
  onClose,
  client,
}: ClientDetailModalProps) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-card dark:bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Detalles del Cliente
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Avatar y nombre */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {getInitials(client.name, client.lastName)}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground">
                  {client.name} {client.lastName}
                </h4>
                <p className="text-sm text-muted-foreground">Cliente</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{client.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">ID de Usuario</p>
                  <p className="text-foreground font-mono text-sm break-all">
                    {client.id}
                  </p>
                </div>
              </div>

              {client.timestamp && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                    <p className="text-foreground">
                      {formatDate(client.timestamp)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted border-t border-border">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:brightness-110 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};