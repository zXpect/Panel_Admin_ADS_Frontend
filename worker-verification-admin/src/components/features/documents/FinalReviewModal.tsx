// src/components/FinalReviewModal.tsx
import { CheckCircle, XCircle, FileText, X } from 'lucide-react';
import { VerificationResult } from '@/lib/utils/verification';

interface FinalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationResult;
  onConfirm: () => void;
}

const FinalReviewModal = ({
  isOpen,
  onClose,
  verification,
  onConfirm,
}: FinalReviewModalProps) => {
  // Solo se abre sin pendientes (el botón está desactivado mientras los haya)
  if (!isOpen || !verification.outcome) return null;

  const flatDocs = verification.docs;
  const { hojaDeVidaApproved, antecedentesApproved, approvedTitulos, approvedCartas } = verification.requirements;
  const hasTitulo = approvedTitulos >= 1;
  const hasCartas = approvedCartas >= 3;
  const suggestedStatus = verification.outcome;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="w-full max-w-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-2xl shadow-xl p-6 relative transition-all duration-300">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-[hsl(var(--accent))]/20 transition-colors"
        >
          <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold mb-4">Resumen de Revisión</h2>

        {/* Lista de documentos */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
          {flatDocs.map((doc) => (
            <div
              key={doc.id || doc.fileName}
              className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/70 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-sm font-medium truncate">{doc.fileName || 'Documento sin nombre'}</span>
              </div>

              {doc.status === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : doc.status === 'rejected' ? (
                <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  Pendiente
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Requisitos mínimos */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4 text-sm">
          <p className="mb-2 font-medium">Verificación de requisitos mínimos:</p>

          <ul className="space-y-1 text-[hsl(var(--muted-foreground))]">
            <li>
              Hoja de vida:{' '}
              <span className={hojaDeVidaApproved ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {hojaDeVidaApproved ? 'Aprobada' : 'No aprobada'}
              </span>
            </li>
            <li>
              Antecedentes judiciales:{' '}
              <span className={antecedentesApproved ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {antecedentesApproved ? 'Aprobados' : 'No aprobados'}
              </span>
            </li>
            <li>
              Títulos aprobados:{' '}
              <span className={hasTitulo ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]'}>
                {approvedTitulos} (mínimo 1)
              </span>
            </li>
            <li>
              Cartas de recomendación aprobadas:{' '}
              <span className={hasCartas ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]'}>
                {approvedCartas} (mínimo 3)
              </span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Se aprueba con la hoja de vida y los antecedentes aprobados, y un título o tres cartas aprobados.
          </p>

          <p className="text-[hsl(var(--foreground))] text-sm mt-4">
            Estado final sugerido:{' '}
            <span
              className={`font-semibold ${
                suggestedStatus === 'approved'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {suggestedStatus === 'approved' ? 'Aprobado' : 'Rechazado'}
            </span>
          </p>

          {/* Botones */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleConfirm}
              className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${
                suggestedStatus === 'approved'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
              }`}
            >
              Confirmar {suggestedStatus === 'approved' ? 'Aprobación' : 'Rechazo'}
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 text-[hsl(var(--foreground))] transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalReviewModal;
