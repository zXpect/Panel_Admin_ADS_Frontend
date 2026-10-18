// src/components/FinalReviewModal.tsx
import { CheckCircle, XCircle, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FinalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any;
  onConfirm: (finalStatus: 'approved' | 'rejected') => void;
}

const FinalReviewModal = ({
  isOpen,
  onClose,
  documents,
  onConfirm,
}: FinalReviewModalProps) => {
  if (!isOpen || !documents) return null;

  // Aplanar documentos
  const flatDocs = [
    documents.hojaDeVida,
    documents.antecedentesJudiciales,
    ...(Object.values(documents.certificaciones?.titulos || {}) as any[]),
    ...(Object.values(documents.certificaciones?.cartasRecomendacion || {}) as any[]),
  ].filter(Boolean);

  // Clasificación
  const approvedDocs = flatDocs.filter((d) => d.status === 'approved');


  // Requisitos mínimos
  const hasHojaDeVida = !!documents.hojaDeVida;
  const hasAntecedentes = !!documents.antecedentesJudiciales;
  const titulos = Object.values(documents.certificaciones?.titulos || {});
  const cartas = Object.values(documents.certificaciones?.cartasRecomendacion || {});
  const hasTitulo = titulos.length >= 1;
  const hasCartas = cartas.length >= 3;

  const meetsRequirements = hasHojaDeVida && hasAntecedentes && (hasTitulo || hasCartas);
  const allApproved = approvedDocs.length === flatDocs.length;

  const suggestedStatus: 'approved' | 'rejected' =
    allApproved && meetsRequirements ? 'approved' : 'rejected';

  const handleConfirm = () => {
    onConfirm(suggestedStatus);
    toast.success(
      suggestedStatus === 'approved'
        ? 'Todos los documentos cumplen los requisitos. Revisión final completada.'
        : 'Revisión final registrada: faltan documentos o algunos fueron rechazados.'
    );
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
              <span className={hasHojaDeVida ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {hasHojaDeVida ? 'Presente' : 'Faltante'}
              </span>
            </li>
            <li>
              Antecedentes judiciales:{' '}
              <span className={hasAntecedentes ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {hasAntecedentes ? 'Presente' : 'Faltante'}
              </span>
            </li>
            <li>
              Títulos:{' '}
              <span className={hasTitulo ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {titulos.length} encontrados (mínimo 1)
              </span>
            </li>
            <li>
              Cartas de recomendación:{' '}
              <span className={hasCartas ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {cartas.length} encontradas (mínimo 3)
              </span>
            </li>
          </ul>

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
