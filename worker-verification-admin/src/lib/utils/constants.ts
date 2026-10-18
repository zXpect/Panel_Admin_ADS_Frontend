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

// Oficios oficiales del catálogo (ServiceCategory en ADS_AdminBack, migración
// pricing/0002_seed_catalog). GET /api/catalog/ solo acepta el ID token de
// Firebase de la app, así que el panel usa esta lista fija: mantenerla igual.
export const WORKER_CATEGORIES = [
  { slug: 'electricidad', name: 'Electricidad' },
  { slug: 'plomeria', name: 'Plomería' },
  { slug: 'pintura', name: 'Pintura' },
  { slug: 'albanileria', name: 'Albañilería' },
  { slug: 'cerrajeria', name: 'Cerrajería' },
  { slug: 'jardineria', name: 'Jardinería' },
  { slug: 'carpinteria', name: 'Carpintería' },
] as const;

export type WorkerCategorySlug = (typeof WORKER_CATEGORIES)[number]['slug'];

// Valores viejos del campo `work` que no coinciden con un slug al quitar tildes
// (igual que LEGACY_WORK_TO_CATEGORY en pricing/services/worker_categories.py).
const LEGACY_WORK_TO_CATEGORY: Record<string, WorkerCategorySlug> = {
  electricista: 'electricidad',
  plomero: 'plomeria',
  pintor: 'pintura',
  albanil: 'albanileria',
  cerrajero: 'cerrajeria',
  jardinero: 'jardineria',
  carpintero: 'carpinteria',
};

/**
 * Slug del oficio que corresponde al texto de `work` ('Electricista' -> 'electricidad'),
 * o null si no hay equivalencia (p. ej. 'Ferretería', que no es un oficio).
 */
export const workToCategorySlug = (work?: string | null): WorkerCategorySlug | null => {
  const value = (work ?? '').normalize('NFKD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  const slug = LEGACY_WORK_TO_CATEGORY[value] ?? value;
  return WORKER_CATEGORIES.find((category) => category.slug === slug)?.slug ?? null;
};

/** Nombre oficial del oficio para un `work` viejo o nuevo ('Pintor' -> 'Pintura'), o '' si no hay. */
export const workToCategoryName = (work?: string | null): string => {
  const slug = workToCategorySlug(work);
  return WORKER_CATEGORIES.find((category) => category.slug === slug)?.name ?? '';
};

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