import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, CheckCircle2, Ban } from 'lucide-react';
import { useWorkerDocuments, useDocuments } from '@/hooks/useDocuments';
import { useWorker, useWorkers } from '@/hooks/useWorkers';
import { DocumentReviewModal } from '@/components/features/documents/DocumentReviewModal';
import FinalReviewModal from '@/components/features/documents/FinalReviewModal';
import { ReviewStatusBanner } from '@/components/features/documents/ReviewStatusBanner';
import { NoDocumentsAlert } from '@/components/features/documents/NoDocumentsAlert';
import { useDocumentReviewStatus } from '@/hooks/useDocumentReviewStatus';
import toast from 'react-hot-toast';
import { cn, getStatusColor, getStatusText } from '@/lib/utils/helpers';

export const DocumentReviewPage = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const { data: worker } = useWorker(workerId!);
  const { documents, requirements } = useWorkerDocuments(workerId!);
  const { approveDocument, rejectDocument, isApproving, isRejecting } = useDocuments();
  const { updateVerificationStatus, isUpdatingVerification } = useWorkers();

  // Usar el hook personalizado para obtener el estado de revisión
  const reviewStatus = useDocumentReviewStatus(documents);

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const handleOpenModal = (doc: any, title: string) => {
    setSelectedDoc(doc);
    setSelectedTitle(title);
    setIsDocModalOpen(true);
  };

  const handleCloseDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedDoc(null);
    setSelectedTitle('');
  };

  const handleApprove = (doc: any) => {
    approveDocument({
      workerId: workerId!,
      category: doc.category,
      subcategory: doc.subcategory || null,
      documentId: doc.id,
      reviewerId: 'admin',
    });
    handleCloseDocModal();
  };

  const handleReject = (doc: any, reason: string) => {
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

  const handleConfirmFinalReview = (finalStatusFromModal: 'approved' | 'rejected') => {
    if (!workerId || !documents) return;

    const { hojaDeVida, antecedentesJudiciales, certificaciones } = documents;
    const titulos = certificaciones?.titulos ? Object.values(certificaciones.titulos) : [];
    const cartas = certificaciones?.cartasRecomendacion
      ? Object.values(certificaciones.cartasRecomendacion)
      : [];

    const hasHojaDeVida = !!hojaDeVida;
    const hasAntecedentes = !!antecedentesJudiciales;
    const hasTitulo = titulos.length >= 1;
    const hasCartas = cartas.length >= 3;

    const meetsRequirements = hasHojaDeVida && hasAntecedentes && (hasTitulo || hasCartas);
    const finalStatus = meetsRequirements ? finalStatusFromModal : 'rejected';

    if (!meetsRequirements) {
      toast.error(
        'El trabajador no cumple con los requisitos mínimos (debe tener Hoja de Vida, Antecedentes y al menos 1 título o 3 cartas). Revisión marcada como RECHAZADA.'
      );
    }

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
  const isNewDocument = (doc: any) => {
    if (!reviewStatus.lastReviewDate || !doc) return false;
    return (
      doc.uploadedAt > reviewStatus.lastReviewDate &&
      (!doc.reviewedAt || doc.reviewedAt === 0 || doc.status === 'pending')
    );
  };

  const renderRow = (doc: any, title: string) => {
    if (!doc) return null;

    const isNew = isNewDocument(doc);

    return (
      <div
        key={doc.id}
        onClick={() => handleOpenModal(doc, title)}
        className={cn(
          'flex items-center justify-between bg-[hsl(var(--card))] p-4 rounded-lg shadow-md border transition-all cursor-pointer',
          isNew
            ? 'border-[hsl(var(--chart-5))] ring-2 ring-[hsl(var(--chart-5))]/20 hover:shadow-xl'
            : 'border-[hsl(var(--border))] hover:shadow-lg'
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium text-[hsl(var(--foreground))]">{title}</span>
            {isNew && (
              <span className="text-xs text-[hsl(var(--chart-5))] font-medium mt-1">
                🆕 Documento nuevo
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            'px-3 py-1 text-sm font-medium rounded-full shadow-sm transition-colors',
            getStatusColor(doc.status)
          )}
        >
          {getStatusText(doc.status)}
        </span>
      </div>
    );
  };

  // Determinar el texto y estado del botón de finalización
  const getFinalizationButtonConfig = () => {
    if (!reviewStatus.hasDocuments) {
      return {
        text: 'Sin documentos para revisar',
        disabled: true,
        icon: Ban,
        className: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed',
      };
    }

    if (reviewStatus.hasBeenReviewed && !reviewStatus.hasPendingDocs) {
      return {
        text: 'Revisión Completada',
        disabled: true,
        icon: CheckCircle2,
        className: 'bg-[hsl(var(--chart-2))] text-[hsl(var(--chart-2-foreground))] cursor-not-allowed opacity-60',
      };
    }

    if (reviewStatus.newDocsSinceReview.length > 0) {
      return {
        text: 'Finalizar Nueva Revisión',
        disabled: isUpdatingVerification,
        icon: FileText,
        className: isUpdatingVerification
          ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
          : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90',
      };
    }

    return {
      text: 'Finalizar Revisión',
      disabled: isUpdatingVerification,
      icon: FileText,
      className: isUpdatingVerification
        ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed'
        : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90',
    };
  };

  const buttonConfig = getFinalizationButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <Link
        to="/documents/pending"
        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a documentos pendientes</span>
      </Link>

      {/* Header */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md border border-[hsl(var(--border))] p-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
          Revisión de Documentos
        </h1>
        {worker && (
          <div className="flex items-center justify-between">
            <p className="text-[hsl(var(--muted-foreground))]">
              Trabajador: {worker.name} {worker.lastName}
            </p>
            {reviewStatus.hasDocuments && (
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {reviewStatus.statusMessage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Banner de estado de revisión */}
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

      {/* Estado General de Documentación */}
      {requirements && reviewStatus.hasDocuments && (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md border border-[hsl(var(--border))] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] mb-4">
            Estado General de Documentación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
              <span className="text-[hsl(var(--foreground))]">Hoja de Vida</span>
              {requirements.hasHojaVida ? (
                <CheckCircle className="w-5 h-5 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
              <span className="text-[hsl(var(--foreground))]">Antecedentes</span>
              {requirements.hasAntecedentes ? (
                <CheckCircle className="w-5 h-5 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
              <span className="text-[hsl(var(--foreground))]">
                Cartas ({requirements.cartasCount}/3)
              </span>
              {requirements.hasMinimumCartas ? (
                <CheckCircle className="w-5 h-5 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de documentos o mensaje sin documentos */}
      {!reviewStatus.hasDocuments ? (
        <NoDocumentsAlert />
      ) : (
        <div className="space-y-3">
          {documents?.hojaDeVida && renderRow(documents.hojaDeVida, 'Hoja de Vida')}
          {documents?.antecedentesJudiciales &&
            renderRow(documents.antecedentesJudiciales, 'Antecedentes Judiciales')}
          {documents?.certificaciones?.titulos &&
            Object.values(documents.certificaciones.titulos).map((t: any) =>
              renderRow(t, `Título #${t.id}`)
            )}
          {documents?.certificaciones?.cartasRecomendacion &&
            Object.values(documents.certificaciones.cartasRecomendacion).map((c: any) =>
              renderRow(c, `Carta de Recomendación #${c.orden}`)
            )}
        </div>
      )}

      {/* Botón de finalización */}
      {reviewStatus.hasDocuments && (
        <div className="flex justify-end pt-6">
          <button
            onClick={() => setIsFinalModalOpen(true)}
            disabled={buttonConfig.disabled}
            className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center gap-2 ${buttonConfig.className}`}
          >
            <ButtonIcon className="w-5 h-5" />
            <span>
              {isUpdatingVerification ? 'Enviando...' : buttonConfig.text}
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
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
        documents={documents}
        onConfirm={handleConfirmFinalReview}
      />
    </div>
  );
};