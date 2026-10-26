import { X, Mail, Phone, User, Calendar } from 'lucide-react';
import { Client } from '@/types/client.types';
import { getInitials, formatDate } from '@/lib/utils/helpers';
import { AccountStatusControl, SuspendedBadge } from '@/components/features/accounts/AccountStatusControl';

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
        <div className="inline-block align-bottom bg-card dark:bg-card rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Detalles del cliente
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
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-2xl font-extrabold">
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

          {/* Estado de la cuenta (HU-32) */}
          <div className="px-6 pb-4 flex items-center justify-between gap-2 flex-wrap">
            {client.isActive === false ? <SuspendedBadge /> : <span />}
            <AccountStatusControl uid={client.id} name={`${client.name} ${client.lastName}`}
              role="client" isActive={client.isActive} />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};