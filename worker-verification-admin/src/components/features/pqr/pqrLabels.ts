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

export const PQR_STATUS_STYLES: Record<PqrStatus, string> = {
  abierta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  en_tramite: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  cerrada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export const PQR_ROLE_LABELS: Record<Pqr['author_role'], string> = {
  client: 'Cliente',
  worker: 'Trabajador',
};
