import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, CheckCircle2, Ban, User, Briefcase, Award, MessageSquare, Shield } from 'lucide-react';
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

  // Función para obtener el icono según el tipo de documento
  const getDocumentIcon = (title: string) => {
    if (title.includes('Hoja de Vida')) return Briefcase;
    if (title.includes('Antecedentes')) return Shield;
    if (title.includes('Título')) return Award;
    if (title.includes('Carta')) return MessageSquare;
    return FileText;
  };

  const renderRow = (doc: any, title: string) => {
    if (!doc) return null;

    const isNew = isNewDocument(doc);
    const Icon = getDocumentIcon(title);

    return (
      <div
        key={doc.id}
        onClick={() => handleOpenModal(doc, title)}
        className={cn(
          'group flex items-center justify-between bg-[hsl(var(--card))] p-5 rounded-xl shadow-md border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1',
          isNew
            ? 'border-[hsl(var(--chart-5))] ring-2 ring-[hsl(var(--chart-5))]/20 hover:shadow-2xl hover:ring-[hsl(var(--chart-5))]/40'
            : 'border-[hsl(var(--border))] hover:shadow-xl hover:border-[hsl(var(--primary))]/30'
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
            isNew
              ? "bg-[hsl(var(--chart-5))]/20 group-hover:bg-[hsl(var(--chart-5))]/30"
              : "bg-[hsl(var(--primary))]/10 group-hover:bg-[hsl(var(--primary))]/20"
          )}>
            <Icon className={cn(
              "w-6 h-6 transition-colors",
              isNew
                ? "text-[hsl(var(--chart-5))]"
                : "text-[hsl(var(--primary))]"
            )} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{title}</span>
            {isNew && (
              <span className="text-xs text-[hsl(var(--chart-5))] font-medium mt-1 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-[hsl(var(--chart-5))] rounded-full"></span>
                Documento nuevo
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            'px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-all duration-300 group-hover:scale-105',
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Botón volver */}
      <Link
        to="/documents/pending"
        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all duration-200 hover:gap-3 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Volver a documentos pendientes</span>
      </Link>

      {/* Header mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/10 via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Revisión de Documentos
            </h1>
          </div>
          {worker && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wide">Trabajador</p>
                  <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    {worker.name} {worker.lastName}
                  </p>
                </div>
              </div>
              {reviewStatus.hasDocuments && (
                <span className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-full">
                  {reviewStatus.statusMessage}
                </span>
              )}
            </div>
          )}
        </div>
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

      {/* Estado General de Documentación mejorado */}
      {requirements && reviewStatus.hasDocuments && (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-md border border-[hsl(var(--border))] p-6">
          <h2 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
            Estado General de Documentación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn(
              "group flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-105 cursor-default border-2",
              requirements.hasHojaVida
                ? "bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/30 hover:bg-[hsl(var(--chart-2))]/20"
                : "bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  requirements.hasHojaVida
                    ? "bg-[hsl(var(--chart-2))]/20"
                    : "bg-[hsl(var(--destructive))]/20"
                )}>
                  <Briefcase className={cn(
                    "w-5 h-5",
                    requirements.hasHojaVida
                      ? "text-[hsl(var(--chart-2))]"
                      : "text-[hsl(var(--destructive))]"
                  )} />
                </div>
                <span className="font-semibold text-[hsl(var(--foreground))]">Hoja de Vida</span>
              </div>
              {requirements.hasHojaVida ? (
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
              )}
            </div>

            <div className={cn(
              "group flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-105 cursor-default border-2",
              requirements.hasAntecedentes
                ? "bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/30 hover:bg-[hsl(var(--chart-2))]/20"
                : "bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  requirements.hasAntecedentes
                    ? "bg-[hsl(var(--chart-2))]/20"
                    : "bg-[hsl(var(--destructive))]/20"
                )}>
                  <Shield className={cn(
                    "w-5 h-5",
                    requirements.hasAntecedentes
                      ? "text-[hsl(var(--chart-2))]"
                      : "text-[hsl(var(--destructive))]"
                  )} />
                </div>
                <span className="font-semibold text-[hsl(var(--foreground))]">Antecedentes</span>
              </div>
              {requirements.hasAntecedentes ? (
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
              )}
            </div>

            <div className={cn(
              "group flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-105 cursor-default border-2",
              requirements.hasMinimumCartas
                ? "bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/30 hover:bg-[hsl(var(--chart-2))]/20"
                : "bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  requirements.hasMinimumCartas
                    ? "bg-[hsl(var(--chart-2))]/20"
                    : "bg-[hsl(var(--destructive))]/20"
                )}>
                  <MessageSquare className={cn(
                    "w-5 h-5",
                    requirements.hasMinimumCartas
                      ? "text-[hsl(var(--chart-2))]"
                      : "text-[hsl(var(--destructive))]"
                  )} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[hsl(var(--foreground))]">Cartas</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {requirements.cartasCount}/3
                  </span>
                </div>
              </div>
              {requirements.hasMinimumCartas ? (
                <CheckCircle className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              ) : (
                <XCircle className="w-6 h-6 text-[hsl(var(--destructive))]" />
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

      {/* Botón de finalización mejorado */}
      {reviewStatus.hasDocuments && (
        <div className="flex justify-end pt-6">
          <button
            onClick={() => setIsFinalModalOpen(true)}
            disabled={buttonConfig.disabled}
            className={`group px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${buttonConfig.className}`}
          >
            <ButtonIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="text-base">
              {isUpdatingVerification ? 'Enviando...' : buttonConfig.text}
            </span>
            {!buttonConfig.disabled && !isUpdatingVerification && (
              <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            )}
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