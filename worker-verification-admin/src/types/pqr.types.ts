// PQR (peticiones, quejas y reclamos) vistas desde el panel (HU-09, HU-16)

export type PqrType = 'peticion' | 'queja' | 'reclamo';

export type PqrStatus = 'abierta' | 'en_tramite' | 'cerrada';

export interface Pqr {
  id: number;
  service_request_id: string;
  author_uid: string;
  author_role: 'client' | 'worker';
  type: PqrType;
  description: string;
  status: PqrStatus;
  response: string | null;
  created_at: string;
  due_at: string; // 15 días hábiles desde el registro
  closed_at: string | null;
  responded_by: string | null;
  is_overdue: boolean;
}

export interface PqrFilters {
  status?: PqrStatus | '';
  page?: number;
}

export interface PqrListResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  data: Pqr[];
}

/** PATCH /api/pqr/{id}/: pasar a trámite o cerrar con respuesta */
export interface PqrAnswerInput {
  status: 'en_tramite' | 'cerrada';
  response?: string;
}
