import { CheckCircle2, Calendar, User, FileCheck, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/helpers';

interface ReviewStatusBannerProps {
  lastReviewDate: number | null;
  lastReviewedBy: string | null;
  totalDocs: number;
  approvedDocs: number;
  rejectedDocs: number;
  hasPendingDocs: boolean;
  newDocsCount: number;
}

export const ReviewStatusBanner = ({
  lastReviewDate,
  lastReviewedBy,
  totalDocs,
  approvedDocs,
  rejectedDocs,
  hasPendingDocs,
  newDocsCount,
}: ReviewStatusBannerProps) => {
  // Si no hay revisión completada, no mostrar nada
  if (!lastReviewDate) return null;

  // Si hay documentos pendientes, mostrar alerta
  if (hasPendingDocs) {
    return (
      <div className="bg-[hsl(var(--chart-5))]/10 border border-[hsl(var(--chart-5))]/30 rounded-2xl p-6 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--chart-5))]/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-[hsl(var(--chart-5))]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
              {newDocsCount > 0 ? '⚠️ Nuevos documentos requieren revisión' : '⏳ Revisión pendiente'}
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
              {newDocsCount > 0 ? (
                <>
                  <span className="font-medium text-[hsl(var(--chart-5))]">
                    {newDocsCount} documento{newDocsCount > 1 ? 's nuevos' : ' nuevo'}
                  </span>{' '}
                  subido{newDocsCount > 1 ? 's' : ''} después de la última revisión
                </>
              ) : (
                <>Hay documentos que aún no han sido revisados</>
              )}
            </p>

            {lastReviewDate && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Última revisión: {formatDate(lastReviewDate, 'dd MMM yyyy - HH:mm')}</span>
                </div>
                {lastReviewedBy && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Por: {lastReviewedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Revisión completada sin documentos pendientes
  const allApproved = rejectedDocs === 0;

  return (
    <div
      className={`rounded-2xl p-6 transition-colors border ${
        allApproved
          ? 'bg-[hsl(var(--chart-2))]/10 border-[hsl(var(--chart-2))]/30'
          : 'bg-[hsl(var(--chart-5))]/10 border-[hsl(var(--chart-5))]/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            allApproved
              ? 'bg-[hsl(var(--chart-2))]/20'
              : 'bg-[hsl(var(--chart-5))]/20'
          }`}
        >
          {allApproved ? (
            <CheckCircle2 className="w-6 h-6 text-[hsl(var(--chart-2))]" />
          ) : (
            <FileCheck className="w-6 h-6 text-[hsl(var(--chart-5))]" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            ✅ Revisión completada
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[hsl(var(--muted-foreground))]">
                Última revisión:
              </span>
              <span className="font-medium text-[hsl(var(--foreground))]">
                {formatDate(lastReviewDate, 'dd MMM yyyy - HH:mm')}
              </span>
            </div>

            {lastReviewedBy && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--muted-foreground))]">Revisor:</span>
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {lastReviewedBy}
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-[hsl(var(--muted))] rounded-lg">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Total: <span className="font-semibold text-[hsl(var(--foreground))]">{totalDocs}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--chart-2))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Aprobados: <span className="font-semibold text-[hsl(var(--chart-2))]">{approvedDocs}</span>
              </span>
            </div>

            {rejectedDocs > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Rechazados: <span className="font-semibold text-[hsl(var(--destructive))]">{rejectedDocs}</span>
                </span>
              </div>
            )}
          </div>

          {/* Mensaje informativo */}
          <div className="mt-4 flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="text-lg">ℹ️</span>
            <p>
              {allApproved
                ? 'Todos los documentos fueron aprobados. No hay documentos nuevos pendientes de revisión.'
                : 'La revisión ha sido completada. No hay documentos nuevos pendientes de revisión.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};