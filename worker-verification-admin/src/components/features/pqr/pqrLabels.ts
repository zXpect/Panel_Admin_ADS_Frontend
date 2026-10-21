import { Pqr, PqrStatus, PqrType } from '@/types/pqr.types';

export const PQR_TYPE_LABELS: Record<PqrType, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
};

export const PQR_STATUS_LABELS: Record<PqrStatus, string> = {
  abierta: 'Abierta',
  en_tramite: 'En trámite',
  cerrada: 'Cerrada',
};

// Clases de chip del sistema de diseño (globals.css)
export const PQR_STATUS_STYLES: Record<PqrStatus, string> = {
  abierta: 'chip-warning',
  en_tramite: 'chip-brand',
  cerrada: 'chip-success',
};

export const PQR_ROLE_LABELS: Record<Pqr['author_role'], string> = {
  client: 'Cliente',
  worker: 'Trabajador',
};
