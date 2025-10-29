import { useMemo } from 'react';

interface Document {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: number;
  reviewedBy?: string;
  uploadedAt: number;
  fileName: string;
}

interface DocumentCollection {
  hojaDeVida?: Document;
  antecedentesJudiciales?: Document;
  certificaciones?: {
    titulos?: Record<string, Document>;
    cartasRecomendacion?: Record<string, Document>;
  };
}

interface ReviewStatus {
  hasBeenReviewed: boolean;
  hasPendingDocs: boolean;
  hasDocuments: boolean;
  lastReviewDate: number | null;
  lastReviewedBy: string | null;
  totalDocs: number;
  reviewedDocs: number;
  pendingDocs: number;
  approvedDocs: number;
  rejectedDocs: number;
  newDocsSinceReview: Document[];
  canFinalizeReview: boolean;
  statusMessage: string;
}

export const useDocumentReviewStatus = (documents: DocumentCollection | undefined): ReviewStatus => {
  return useMemo(() => {
    if (!documents) {
      return {
        hasBeenReviewed: false,
        hasPendingDocs: false,
        hasDocuments: false,
        lastReviewDate: null,
        lastReviewedBy: null,
        totalDocs: 0,
        reviewedDocs: 0,
        pendingDocs: 0,
        approvedDocs: 0,
        rejectedDocs: 0,
        newDocsSinceReview: [],
        canFinalizeReview: false,
        statusMessage: 'Cargando información de documentos...',
      };
    }

    // Recolectar todos los documentos
    const allDocs: Document[] = [];

    if (documents.hojaDeVida) allDocs.push(documents.hojaDeVida);
    if (documents.antecedentesJudiciales) allDocs.push(documents.antecedentesJudiciales);

    if (documents.certificaciones?.titulos) {
      Object.values(documents.certificaciones.titulos).forEach((doc) => {
        if (doc) allDocs.push(doc);
      });
    }

    if (documents.certificaciones?.cartasRecomendacion) {
      Object.values(documents.certificaciones.cartasRecomendacion).forEach((doc) => {
        if (doc) allDocs.push(doc);
      });
    }

    // Si no hay documentos
    if (allDocs.length === 0) {
      return {
        hasBeenReviewed: false,
        hasPendingDocs: false,
        hasDocuments: false,
        lastReviewDate: null,
        lastReviewedBy: null,
        totalDocs: 0,
        reviewedDocs: 0,
        pendingDocs: 0,
        approvedDocs: 0,
        rejectedDocs: 0,
        newDocsSinceReview: [],
        canFinalizeReview: false,
        statusMessage: 'El trabajador no ha subido ningún documento',
      };
    }

    // Calcular estadísticas
    const totalDocs = allDocs.length;
    const reviewedDocs = allDocs.filter((doc) => doc.reviewedAt && doc.reviewedAt > 0).length;
    const pendingDocs = allDocs.filter(
      (doc) => doc.status === 'pending' || !doc.reviewedAt || doc.reviewedAt === 0
    ).length;
    const approvedDocs = allDocs.filter((doc) => doc.status === 'approved').length;
    const rejectedDocs = allDocs.filter((doc) => doc.status === 'rejected').length;

    // Verificar si todos han sido revisados
    const allReviewed = allDocs.every(
      (doc) => doc.reviewedAt && doc.reviewedAt > 0 && doc.status !== 'pending'
    );

    // Obtener fecha de revisión más reciente y revisor
    const reviewedDocuments = allDocs.filter((doc) => doc.reviewedAt && doc.reviewedAt > 0);
    const lastReviewDate = reviewedDocuments.length > 0
      ? Math.max(...reviewedDocuments.map((d) => d.reviewedAt || 0))
      : null;

    const lastReviewedDoc = reviewedDocuments.find((doc) => doc.reviewedAt === lastReviewDate);
    const lastReviewedBy = lastReviewedDoc?.reviewedBy || null;

    // Detectar documentos nuevos después de la última revisión
    const newDocsSinceReview = lastReviewDate
      ? allDocs.filter(
          (doc) =>
            doc.uploadedAt > lastReviewDate &&
            (!doc.reviewedAt || doc.reviewedAt === 0 || doc.status === 'pending')
        )
      : [];

    // Determinar si tiene documentos pendientes
    const hasPendingDocs = pendingDocs > 0;

    // Determinar mensaje de estado
    let statusMessage = '';
    if (!allReviewed && pendingDocs > 0) {
      statusMessage = `${pendingDocs} documento${pendingDocs > 1 ? 's' : ''} pendiente${pendingDocs > 1 ? 's' : ''} de revisión`;
    } else if (allReviewed && newDocsSinceReview.length > 0) {
      statusMessage = `${newDocsSinceReview.length} documento${newDocsSinceReview.length > 1 ? 's nuevos' : ' nuevo'} desde la última revisión`;
    } else if (allReviewed) {
      statusMessage = 'Todos los documentos han sido revisados';
    }

    // Puede finalizar revisión si hay documentos pendientes
    const canFinalizeReview = hasPendingDocs;

    return {
      hasBeenReviewed: allReviewed,
      hasPendingDocs,
      hasDocuments: true,
      lastReviewDate,
      lastReviewedBy,
      totalDocs,
      reviewedDocs,
      pendingDocs,
      approvedDocs,
      rejectedDocs,
      newDocsSinceReview,
      canFinalizeReview,
      statusMessage,
    };
  }, [documents]);
};