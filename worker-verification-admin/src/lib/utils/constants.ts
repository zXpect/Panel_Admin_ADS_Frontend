export const APP_NAME = 'Worker Verification Admin';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  WORKERS: '/workers',
  WORKER_DETAIL: '/workers/:id',
  WORKER_CREATE: '/workers/new',
  WORKER_EDIT: '/workers/:id/edit',
  DOCUMENTS: '/documents',
  DOCUMENTS_PENDING: '/documents/pending',
  DOCUMENT_REVIEW: '/documents/review/:workerId',
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:id',
} as const;

export const WORKER_CATEGORIES = [
  'Plomería',
  'Electricista',
  'Jardinería',
  'Carpintería',
  'Pintor',
  'Albañilería',
  'Ferretería'
] as const;

export const DOCUMENT_TYPES = {
  HOJA_VIDA: 'hoja_de_vida',
  ANTECEDENTES: 'antecedentes_judiciales',
  TITULO: 'titulo',
  CARTA_RECOMENDACION: 'carta_recomendacion',
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.PENDING]: 'Pendiente',
  [DOCUMENT_STATUS.APPROVED]: 'Aprobado',
  [DOCUMENT_STATUS.REJECTED]: 'Rechazado',
} as const;

export const FILE_TYPES = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  FILE_TYPES.PDF,
  FILE_TYPES.JPEG,
  FILE_TYPES.JPG,
  FILE_TYPES.PNG,
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
} as const;