import { WorkerDocument, WorkerDocumentCollection } from '@/types/document.types';

export type VerificationOutcome = 'approved' | 'rejected';

export interface VerificationRequirements {
  hojaDeVidaApproved: boolean;
  antecedentesApproved: boolean;
  approvedTitulos: number;
  approvedCartas: number;
}

export interface VerificationResult {
  docs: WorkerDocument[];
  pendingCount: number;
  requirements: VerificationRequirements;
  // null mientras quede algún documento por revisar
  outcome: VerificationOutcome | null;
}

const isPending = (doc: WorkerDocument) =>
  doc.status === 'pending' || !doc.reviewedAt || doc.reviewedAt === 0;

/**
 * Resultado de la verificación documental (DEF-18): se aprueba con la hoja de vida y los
 * antecedentes aprobados, y además un título aprobado o tres cartas aprobadas. Un documento
 * rechazado de más (p. ej. una carta, si el título está aprobado) no rechaza al trabajador.
 * Mientras haya documentos pendientes no hay resultado.
 */
export const computeVerification = (documents: WorkerDocumentCollection | undefined): VerificationResult => {
  const titulos = Object.values(documents?.certificaciones?.titulos || {}).filter(Boolean);
  const cartas = Object.values(documents?.certificaciones?.cartasRecomendacion || {}).filter(Boolean);
  const docs = [documents?.hojaDeVida, documents?.antecedentesJudiciales, ...titulos, ...cartas]
    .filter((doc): doc is WorkerDocument => !!doc);

  const requirements: VerificationRequirements = {
    hojaDeVidaApproved: documents?.hojaDeVida?.status === 'approved',
    antecedentesApproved: documents?.antecedentesJudiciales?.status === 'approved',
    approvedTitulos: titulos.filter((doc) => doc.status === 'approved').length,
    approvedCartas: cartas.filter((doc) => doc.status === 'approved').length,
  };

  const pendingCount = docs.filter(isPending).length;
  const meets = requirements.hojaDeVidaApproved && requirements.antecedentesApproved
    && (requirements.approvedTitulos >= 1 || requirements.approvedCartas >= 3);

  return {
    docs,
    pendingCount,
    requirements,
    outcome: docs.length === 0 || pendingCount > 0 ? null : meets ? 'approved' : 'rejected',
  };
};

/**
 * Cartas o títulos en el orden en que se muestran: por el número guardado y luego por fecha de
 * subida. La app guardaba siempre orden 1 (DEF-23), así que el número visible es la posición.
 */
export function sortByOrder<T extends { orden?: number; uploadedAt?: number }>(docs: T[]): T[] {
  return [...docs].sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.uploadedAt || 0) - (b.uploadedAt || 0));
}
