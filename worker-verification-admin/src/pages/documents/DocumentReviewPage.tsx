import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, CheckCircle2, Ban, Briefcase, Award, MessageSquare, Shield, Clock, ChevronRight } from 'lucide-react';
import { useWorkerDocuments, useDocuments } from '@/hooks/useDocuments';
import { useWorker, useWorkers } from '@/hooks/useWorkers';
import { DocumentReviewModal } from '@/components/features/documents/DocumentReviewModal';
import FinalReviewModal from '@/components/features/documents/FinalReviewModal';
import { ReviewStatusBanner } from '@/components/features/documents/ReviewStatusBanner';
import { NoDocumentsAlert } from '@/components/features/documents/NoDocumentsAlert';
import { useDocumentReviewStatus } from '@/hooks/useDocumentReviewStatus';
import toast from 'react-hot-toast';
import { cn, getInitials } from '@/lib/utils/helpers';
import { PageHeader } from '@/components/layout/PageHeader';
import { WorkerDocument } from '@/types/document.types';
import { computeVerification, sortByOrder } from '@/lib/utils/verification';

export const DocumentReviewPage = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const { data: worker } = useWorker(workerId!);
  const { documents, requirements } = useWorkerDocuments(workerId!);
  const { approveDocument, rejectDocument, isApproving, isRejecting } = useDocuments();
  const { updateVerificationStatus, isUpdatingVerification } = useWorkers();

  // Usar el hook personalizado para obtener el estado de revisión
  const reviewStatus = useDocumentReviewStatus(documents);

  const [selectedDoc, setSelectedDoc] = useState<WorkerDocument | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const handleOpenModal = (doc: WorkerDocument, title: string) => {
    setSelectedDoc(doc);
    setSelectedTitle(title);
    setIsDocModalOpen(true);
  };

  const handleCloseDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedDoc(null);
    setSelectedTitle('');
  };

  const handleApprove = (doc: WorkerDocument) => {
    approveDocument({
      workerId: workerId!,
      category: doc.category,
      subcategory: doc.subcategory || null,
      documentId: doc.id,
      reviewerId: 'admin',
    });
    handleCloseDocModal();
  };

  const handleReject = (doc: WorkerDocument, reason: string) => {
    rejectDocument(
      {
        workerId: workerId!,
        category: doc.category,
        subcategory: doc.subcategory || null,
        documentId: doc.id,
        reviewerId: 'admin',
        reason,
      },
      {
        onSuccess: () => {
          toast.success('Documento rechazado correctamente');
          handleCloseDocModal();
        },
      }
    );
  };

  // Resultado según los documentos aprobados (DEF-18); null si queda alguno pendiente
  const verification = computeVerification(documents);
  const workerStatus = worker?.verificationStatus?.status;

  const handleConfirmFinalReview = () => {
    if (!workerId || !verification.outcome) return;
    const finalStatus = verification.outcome;

    updateVerificationStatus(
      { id: workerId, status: finalStatus },
      {
        onSuccess: () => {
          toast.success(
            finalStatus === 'approved'
              ? 'Revisión final completada: trabajador aprobado'
              : 'Revisión final completada: trabajador rechazado'
          );
          setIsFinalModalOpen(false);
        },
        onError: () => {
          toast.error('Error al actualizar el estado final del trabajador');
        },
      }
    );
  };

  // Función para verificar si un documento es nuevo (subido después de la última revisión)
  const isNewDocument = (doc: WorkerDocument) => {
    if (!reviewStatus.lastReviewDate || !doc) return false;
    return (
      doc.uploadedAt > reviewStatus.lastReviewDate &&
      (!doc.reviewedAt || doc.reviewedAt === 0 || doc.status === 'pending')
    );
  };

  // Función para obtener el icono según el tipo de documento
  const getDocumentIcon = (title: string) => {
    if (title.startsWith('Hoja de vida')) return Briefcase;
    if (title.includes('Antecedentes')) return Shield;
    if (title.includes('Título')) return Award;
    if (title.includes('Carta')) return MessageSquare;
    return FileText;
  };

  const STATUS_CHIPS: Record<string, { text: string; className: string; icon: typeof CheckCircle }> = {
    approved: { text: 'Aprobado', className: 'chip-success', icon: CheckCircle },
    rejected: { text: 'Rechazado', className: 'chip-danger', icon: XCircle },
    pending: { text: 'Pendiente', className: 'chip-warning', icon: Clock },
  };

  // Fila de un documento: se abre el detalle (archivo, aprobar, rechazar con motivo)
  const renderRow = (doc: WorkerDocument | undefined, title: string) => {
    if (!doc) return null;

    const isNew = isNewDocument(doc);
    const Icon = getDocumentIcon(title);
    const chip = STATUS_CHIPS[doc.status] || STATUS_CHIPS.pending;
    const ChipIcon = chip.icon;

    return (
      <button
        key={doc.id}
        onClick={() => handleOpenModal(doc, title)}
        className={cn(
          'panel w-full text-left flex items-center gap-4 p-4 transition-colors hover:border-[hsl(var(--primary))]',
          isNew && 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/20'
        )}
      >
        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.9} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">{title}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {isNew ? 'Documento nuevo desde la última revisión · ' : ''}Abrir para ver el archivo y decidir
          </p>
        </div>
        <span className={`chip ${chip.className}`}><ChipIcon className="w-3.5 h-3.5" />{chip.text}</span>
        <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
      </button>
    );
  };

  // Botón de finalización (DEF-18): se activa cuando ya no hay pendientes y el estado del
  // trabajador todavía no es el que corresponde; antes se apagaba al revisar el último
  // documento y el estado final nunca se guardaba
  const getFinalizationButtonConfig = () => {
    if (!reviewStatus.hasDocuments) {
      return { text: 'Sin documentos para revisar', disabled: true, icon: Ban };
    }
    if (verification.pendingCount > 0) {
      const n = verification.pendingCount;
      return { text: `Revisa ${n} documento${n > 1 ? 's' : ''} pendiente${n > 1 ? 's' : ''}`, disabled: true, icon: Clock };
    }
    if (workerStatus === verification.outcome) {
      return { text: 'Revisión completada', disabled: true, icon: CheckCircle2 };
    }
    if (workerStatus === 'approved' || workerStatus === 'rejected') {
      return { text: 'Finalizar nueva revisión', disabled: isUpdatingVerification, icon: ChevronRight };
    }
    return { text: 'Finalizar revisión', disabled: isUpdatingVerification, icon: ChevronRight };
  };

  const buttonConfig = getFinalizationButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  const requirementCards = requirements ? [
    { label: 'Hoja de vida', icon: Briefcase, ok: requirements.hasHojaVida, detail: requirements.hasHojaVida ? 'Subida' : 'Falta' },
    { label: 'Antecedentes', icon: Shield, ok: requirements.hasAntecedentes, detail: requirements.hasAntecedentes ? 'Subidos' : 'Faltan' },
    { label: 'Título', icon: Award, ok: requirements.hasTitulo, detail: requirements.hasTitulo ? 'Subido' : 'Sin título' },
    { label: 'Cartas', icon: MessageSquare, ok: requirements.hasMinimumCartas, detail: `${requirements.cartasCount} / 3` },
  ] : [];

  const titulos = sortByOrder(Object.values(documents?.certificaciones?.titulos || {}));
  const cartas = sortByOrder(Object.values(documents?.certificaciones?.cartasRecomendacion || {}));

  return (
    <div className="space-y-6">
      <Link to="/documents/pending" className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold
                                               text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
        <ArrowLeft className="w-4 h-4" />
        Volver a documentos pendientes
      </Link>

      <PageHeader icon={FileText} title="Revisión de documentos"
        subtitle="Aprueba o rechaza cada documento; los rechazos llevan motivo" />

      {/* Trabajador */}
      {worker && (
        <section className="panel p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-sm font-extrabold">
              {getInitials(worker.name, worker.lastName)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Trabajador</p>
              <Link to={`/workers/${worker.id}`} className="text-xl font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))] hover:underline">
                {worker.name} {worker.lastName}
              </Link>
            </div>
          </div>
          {reviewStatus.hasDocuments && (
            <span className="chip chip-warning"><Clock className="w-3.5 h-3.5" />{reviewStatus.statusMessage}</span>
          )}
        </section>
      )}

      {reviewStatus.hasDocuments && (
        <ReviewStatusBanner
          lastReviewDate={reviewStatus.lastReviewDate}
          lastReviewedBy={reviewStatus.lastReviewedBy}
          totalDocs={reviewStatus.totalDocs}
          approvedDocs={reviewStatus.approvedDocs}
          rejectedDocs={reviewStatus.rejectedDocs}
          hasPendingDocs={reviewStatus.hasPendingDocs}
          newDocsCount={reviewStatus.newDocsSinceReview.length}
        />
      )}

      {/* Requisitos: hoja de vida, antecedentes y un título o tres cartas */}
      {requirements && reviewStatus.hasDocuments && (
        <section className="panel p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h2 className="text-lg font-semibold">Estado general de documentación</h2>
            <span className={`chip ${requirements.isComplete ? 'chip-success' : 'chip-brand'}`}>
              {requirements.isComplete ? 'Documentos completos' : 'Faltan documentos'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {requirementCards.map(({ label, icon: Icon, ok, detail }) => (
              <div key={label} className={cn('flex items-center gap-3 p-3 rounded-xl border',
                ok ? 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]' : 'border-[hsl(var(--danger-foreground))]/30 bg-[hsl(var(--danger-soft))]')}>
                <span className="w-9 h-9 rounded-lg bg-[hsl(var(--card))] flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
                </div>
                {ok ? <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" /> : <XCircle className="w-5 h-5 text-[hsl(var(--danger-foreground))]" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
            Se exige hoja de vida, antecedentes y un título o tres cartas de recomendación.
          </p>
        </section>
      )}

      {/* Documentos */}
      {!reviewStatus.hasDocuments ? (
        <NoDocumentsAlert />
      ) : (
        <div className="space-y-3">
          {documents?.hojaDeVida && renderRow(documents.hojaDeVida, 'Hoja de vida')}
          {documents?.antecedentesJudiciales && renderRow(documents.antecedentesJudiciales, 'Antecedentes judiciales')}
          {titulos.map((t, index) => renderRow(t, titulos.length > 1 ? `Título ${index + 1}` : 'Título'))}
          {cartas.map((c, index) => renderRow(c, `Carta de recomendación ${index + 1}`))}
        </div>
      )}

      {reviewStatus.hasDocuments && (
        <div className="flex items-center justify-end flex-wrap gap-3 pt-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            El trabajador recibirá el resultado y el motivo de cada rechazo.
          </p>
          <button onClick={() => setIsFinalModalOpen(true)} disabled={buttonConfig.disabled} className="btn-primary min-h-[52px]">
            <ButtonIcon className="w-5 h-5" />
            {isUpdatingVerification ? 'Enviando…' : buttonConfig.text}
          </button>
        </div>
      )}

      <DocumentReviewModal
        isOpen={isDocModalOpen}
        onClose={handleCloseDocModal}
        doc={selectedDoc}
        title={selectedTitle}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />

      <FinalReviewModal
        isOpen={isFinalModalOpen}
        onClose={() => setIsFinalModalOpen(false)}
        verification={verification}
        onConfirm={handleConfirmFinalReview}
      />
    </div>
  );
};
