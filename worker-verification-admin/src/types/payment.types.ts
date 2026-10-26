// Pagos del libro del backend (GET /api/payments/, HU-33)

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';

export type PaymentGateway = 'mock' | 'wompi' | 'cash';

export interface Payment {
  id: number;
  reference: string;
  service_request_id: string;
  client_uid: string;
  worker_uid: string;
  amount_in_cents: number;
  amount_cop: number;
  commission_in_cents: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  created_at: string;
  updated_at: string;
}

/** Totales de los pagos aprobados que cumplen el filtro */
export interface PaymentSummary {
  approved_count: number;
  approved_total_cop: number;
  approved_by_gateway: Partial<Record<PaymentGateway, { count: number; total_cop: number }>>;
}

export interface PaymentFilters {
  status?: PaymentStatus | '';
  gateway?: PaymentGateway | '';
  service_request_id?: string;
  date_from?: string; // AAAA-MM-DD
  date_to?: string;
  page?: number;
}

export interface PaymentListResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  summary: PaymentSummary;
  data: Payment[];
}
