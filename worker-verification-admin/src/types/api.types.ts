/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  next?: string;
  previous?: string;
}

/**
 * Estadísticas del Dashboard
 */
export interface DashboardStats {
  workers: {
    total: number;
    available: number;
    online: number;
    verified: number;
    byCategory: Record<string, number>;
  };
  clients: {
    total: number;
  };
  documents: {
    total: number;           
    pending: number;       
    approved: number;        
    rejected: number;         
    processed: number;     
    pendingByType: {
      hojaDeVida: number;
      antecedentesJudiciales: number;
      titulos: number;
      cartasRecomendacion: number;
    };
  };
  activity?: ActivityStats; 
}

/**
 * Estadísticas de actividad detalladas
 */
export interface ActivityStats {
  workers: {
    active_24h: number;
    active_7d: number;
    active_30d: number;
  };
  documents: {
    processed_24h: number;
    processed_7d: number;
    processed_30d: number;
    uploaded_24h: number;
    uploaded_7d: number;
    uploaded_30d: number;
  };
}

/**
 * Tendencia semanal - ACTUALIZAR la existente
 */
export interface WeeklyTrend {
  day: string;
  workers: number;
  documents: number;
  documentsUploaded: number; 
  date: string;
}

/**
 * Tendencia mensual - ACTUALIZAR la existente
 */
export interface MonthlyTrend {
  week: string;  // Cambiar de 'day' a 'week'
  workers: number;
  documents: number;
  documentsUploaded: number; 
  startDate: string; 
  endDate: string;    
}

/**
 * Respuesta de tendencias con resumen
 */
export interface TrendsResponse<T> {
  trends: T[];
  summary: {
    totalWorkersActive: number;
    totalDocsProcessed: number;
    totalDocsUploaded: number;
    avgWorkersPerDay?: number;
    avgDocsProcessedPerDay?: number;
    avgDocsUploadedPerDay?: number;
    avgWorkersPerWeek?: number;
    avgDocsProcessedPerWeek?: number;
    avgDocsUploadedPerWeek?: number;
    peakWeek?: string;
    period: string;
  };
}

/**
 * Información de trabajador
 */
export interface Worker {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  work: string;
  isAvailable: boolean;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
  rating: number;
  totalRatings: number;
  timestamp: number;
  profileImage?: string;
  image?: string;
  description?: string;
  pricePerHour?: number;
  experience?: string;
  fcmToken?: string;
  verificationStatus?: {
    status: 'documents_submitted' | 'approved' | 'rejected';
    submittedAt?: number;
  };
}

/**
 * Documento del trabajador
 */
export interface WorkerDocument {
  id: string;
  workerId: string;
  documentType: string;
  category: 'hojaDeVida' | 'antecedentesJudiciales' | 'certificaciones';
  subcategory?: 'titulos' | 'cartasRecomendacion';
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
  description?: string;
  orden?: number;
  verificationUrl?: string;
}

/**
 * Cliente
 */
export interface Client {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  timestamp: number;
}

/**
 * Parámetros de actualización de trabajador
 */
export interface UpdateWorkerParams {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  work?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
  latitude?: number;
  longitude?: number;
  image?: string;
  description?: string;
  pricePerHour?: number;
  experience?: string;
}

/**
 * Parámetros de ubicación
 */
export interface LocationParams {
  latitude: number;
  longitude: number;
}

/**
 * Parámetros de calificación
 */
export interface RatingParams {
  rating: number; // 1-5
}

/**
 * Parámetros de disponibilidad
 */
export interface AvailabilityParams {
  isAvailable: boolean;
}

/**
 * Parámetros de estado en línea
 */
export interface OnlineStatusParams {
  isOnline: boolean;
}

/**
 * Parámetros de estado de verificación
 */
export interface VerificationStatusParams {
  status: 'documents_submitted' | 'approved' | 'rejected';
}

/**
 * Parámetros de aprobación de documento
 */
export interface ApproveDocumentParams {
  workerId: string;
  category: string;
  subcategory?: string | null;
  documentId: string;
  reviewerId: string;
}

/**
 * Parámetros de rechazo de documento
 */
export interface RejectDocumentParams {
  workerId: string;
  category: string;
  subcategory?: string | null;
  documentId: string;
  reviewerId: string;
  reason: string;
}

/**
 * Parámetros de eliminación de documento
 */
export interface DeleteDocumentParams {
  workerId: string;
  category: string;
  subcategory?: string | null;
  documentId: string;
}

/**
 * Parámetros de URL de archivo
 */
export interface FileUrlParams {
  workerId: string;
  category: string;
  subcategory?: string;
  filename: string;
}

/**
 * Respuesta de verificación de requisitos
 */
export interface RequirementsCheck {
  hasHojaVida: boolean;
  hasAntecedentes: boolean;
  hasTitulo: boolean;
  cartasCount: number;
  hasMinimumCartas: boolean;
  isComplete: boolean;
}

/**
 * Estadísticas de trabajadores
 */
export interface WorkerStatistics {
  total: number;
  available: number;
  online: number;
  verified: number;
  by_category: Record<string, number>;
}

/**
 * Estadísticas de documentos
 */
export interface DocumentStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processed: number;
}