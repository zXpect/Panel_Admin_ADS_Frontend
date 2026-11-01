import { X, Clock, User, FileText, Wallet, ShieldCheck, ShieldAlert, Hash } from 'lucide-react';
import { usePayment } from '@/hooks/usePayments';
import { cn, formatDate, formatPrice } from '@/lib/utils/helpers';
import { PaymentEvent, PaymentStatus } from '@/types/payment.types';
import { LoadingNut } from '@/components/common/LoadingNut';
import {
  GATEWAY_LABELS, PAYMENT_EVENT_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_STYLES,
} from './paymentLabels';

interface PaymentDetailModalProps {
  reference: string | null;
  onClose: () => void;
}

const toMs = (iso: string) => new Date(iso).getTime();

/**
 * Lo que interesa de cada evento, sin mostrar el cuerpo completo: el de Wompi trae
 * el correo y el teléfono del cliente, que el panel no necesita.
 */
const summarizeEvent = (event: PaymentEvent) => {
  const payload = event.payload || {};
  const data = payload.data as { transaction?: Record<string, unknown> } | undefined;
  const transaction = data?.transaction || {};
  const status = (transaction.status || payload.status) as PaymentStatus | undefined;
  const method = transaction.payment_method_type as string | undefined;
  const transactionId = (transaction.id || payload.transaction_id) as string | undefined;
  const message = transaction.status_message as string | undefined;
  return { status, method, transactionId, message };
};

/** Detalle de un pago (A6): datos del libro e historial de eventos de la pasarela. */
export const PaymentDetailModal = ({ reference, onClose }: PaymentDetailModalProps) => {
  const { payment, isLoading, isError } = usePayment(reference);

  if (!reference) return null;

  const style = payment ? PAYMENT_STATUS_STYLES[payment.status] || PAYMENT_STATUS_STYLES.PENDING : null;
  const StatusIcon = style?.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" onClick={onClose} />

        <div className="relative bg-card rounded-2xl text-left shadow-xl w-full sm:max-w-2xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <h3 className="text-lg font-semibold text-foreground break-all">Pago {reference}</h3>
              {payment && style && StatusIcon && (
                <span className={`chip ${style.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingNut />
              </div>
            ) : isError || !payment ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No se pudo cargar el pago.</p>
            ) : (
              <>
                {/* Datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Info icon={Wallet} label="Valor"
                    value={`${formatPrice(payment.amount_cop)} · ${GATEWAY_LABELS[payment.gateway] || payment.gateway}`} />
                  <Info icon={Wallet} label="Comisión"
                    value={formatPrice(Math.floor(payment.commission_in_cents / 100))} />
                  <Info icon={FileText} label="Solicitud" value={payment.service_request_id} mono />
                  {payment.gateway_transaction_id && (
                    <Info icon={Hash} label="Transacción en Wompi" value={payment.gateway_transaction_id} mono />
                  )}
                  <Info icon={User} label="Cliente" value={payment.client_uid} mono />
                  <Info icon={User} label="Trabajador" value={payment.worker_uid} mono />
                  <Info icon={Clock} label="Creado" value={formatDate(toMs(payment.created_at))} />
                  <Info icon={Clock} label="Última actualización" value={formatDate(toMs(payment.updated_at))} />
                </div>

                {/* Historial */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Historial de eventos</p>
                  {payment.events.length === 0 ? (
                    <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">
                      {payment.gateway === 'cash'
                        ? 'Los pagos en efectivo no pasan por Wompi, así que no tienen eventos de la pasarela.'
                        : 'Todavía no han llegado eventos de la pasarela para este pago.'}
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {payment.events.map((event) => (
                        <EventItem key={event.id} event={event} />
                      ))}
                    </ol>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventItem = ({ event }: { event: PaymentEvent }) => {
  const { status, method, transactionId, message } = summarizeEvent(event);
  const details = [
    status && `Estado: ${PAYMENT_STATUS_LABELS[status] || status}`,
    method && `Medio: ${method}`,
    transactionId && `Transacción: ${transactionId}`,
    message && message,
  ].filter(Boolean);

  return (
    <li className="rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-foreground">
          {PAYMENT_EVENT_LABELS[event.event_type] || event.event_type}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(toMs(event.received_at))}
        </span>
      </div>
      {details.length > 0 && (
        <p className="mt-1 text-muted-foreground break-all">{details.join(' · ')}</p>
      )}
      <span className={cn('chip mt-2', event.checksum_valid ? 'chip-success' : 'chip-danger')}>
        {event.checksum_valid
          ? <><ShieldCheck className="w-3.5 h-3.5" />Firma válida</>
          : <><ShieldAlert className="w-3.5 h-3.5" />Firma inválida: no se aplicó</>}
      </span>
    </li>
  );
};

interface InfoProps {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}

const Info = ({ icon: Icon, label, value, mono }: InfoProps) => (
  <div className="flex items-start gap-2 min-w-0">
    <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-muted-foreground">{label}</p>
      <p className={cn('text-foreground break-all', mono && 'font-mono text-xs')}>{value}</p>
    </div>
  </div>
);
