import { Ban, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PaymentGateway, PaymentStatus } from '@/types/payment.types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  DECLINED: 'Rechazado',
  ERROR: 'Error',
  VOIDED: 'Anulado',
};

// Estado siempre con texto e ícono, no solo color
export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { className: string; icon: typeof Clock }> = {
  PENDING: { className: 'chip-warning', icon: Clock },
  APPROVED: { className: 'chip-success', icon: CheckCircle },
  DECLINED: { className: 'chip-danger', icon: XCircle },
  ERROR: { className: 'chip-danger', icon: XCircle },
  VOIDED: { className: 'chip-neutral', icon: Ban },
};

export const GATEWAY_LABELS: Record<PaymentGateway, string> = {
  wompi: 'Wompi (digital)',
  cash: 'Efectivo',
  mock: 'Simulado',
};

// Eventos que guarda el backend: los de Wompi y los que registra el propio servidor
export const PAYMENT_EVENT_LABELS: Record<string, string> = {
  'transaction.updated': 'Wompi actualizó la transacción',
  'local.reconciled': 'Estado consultado en Wompi',
  'local.expired': 'Pago abierto vencido (30 min)',
  'local.amount_changed': 'Cerrado: cambió el valor a pagar',
};
