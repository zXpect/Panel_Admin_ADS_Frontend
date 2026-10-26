export type DocumentType = 'hoja_de_vida' | 'antecedentes_judiciales' | 'titulo' | 'carta_recomendacion';
export type DocumentCategory = 'hojaDeVida' | 'antecedentesJudiciales' | 'certificaciones';
export type DocumentSubcategory = 'titulos' | 'cartasRecomendacion';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface WorkerDocument {
  id: string;
  workerId: string;
  documentType: DocumentType;
  category: DocumentCategory;
  subcategory?: DocumentSubcategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
  description?: string;
  orden?: number;
  verificationUrl?: string;
}

/** Documentos de un trabajador como los devuelve GET /api/documents/worker/{id}/ (claves = id). */
export interface WorkerDocumentCollection {
  hojaDeVida?: WorkerDocument;
  antecedentesJudiciales?: WorkerDocument;
  certificaciones?: {
    titulos?: Record<string, WorkerDocument>;
    cartasRecomendacion?: Record<string, WorkerDocument>;
  };
}

export interface DocumentCreateInput {
  id: string;
  workerId: string;
  documentType: DocumentType;
  category: DocumentCategory;
  subcategory?: DocumentSubcategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  orden?: number;
  verificationUrl?: string;
}

export interface DocumentApprovalInput {
  workerId: string;
  category: DocumentCategory;
  subcategory?: DocumentSubcategory | null;
  documentId: string;
  reviewerId: string;
}

export interface DocumentRejectionInput {
  workerId: string;
  category: DocumentCategory;
  subcategory?: DocumentSubcategory | null;
  documentId: string;
  reviewerId: string;
  reason: string;
}

export interface DocumentRequirements {
  hasHojaVida: boolean;
  hasAntecedentes: boolean;
  hasTitulo: boolean;
  cartasCount: number;
  hasMinimumCartas: boolean;
  isComplete: boolean;
}