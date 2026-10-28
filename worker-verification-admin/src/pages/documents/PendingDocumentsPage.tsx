// src/pages/documents/PendingDocumentsPage.tsx
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useWorkers } from '@/hooks/useWorkers';
import { FileText, Eye, Clock } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import { workerCategoryNames } from '@/lib/utils/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingNut } from '@/components/common/LoadingNut';
import { EmptyState } from '@/components/common/EmptyState';
import { EmptyRequestsIcon } from '@/components/common/AdsIcons';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  hoja_de_vida: 'Hoja de vida',
  antecedentes_judiciales: 'Antecedentes judiciales',
  titulo: 'Título',
  carta_recomendacion: 'Carta de recomendación',
};

/** Documentos por revisar, agrupados por trabajador (mockup A2). */
export const PendingDocumentsPage = () => {
  const { pendingDocuments, isLoading } = useDocuments();
  // Nombre y oficio de cada trabajador en lugar de su ID
  const { workers } = useWorkers();
  const workersById = useMemo(() => new Map(workers.map((worker) => [worker.id, worker])), [workers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingNut />
      </div>
    );
  }

  const documentsByWorker = pendingDocuments.reduce((acc, doc) => {
    if (!acc[doc.workerId]) acc[doc.workerId] = [];
    acc[doc.workerId].push(doc);
    return acc;
  }, {} as Record<string, typeof pendingDocuments>);

  return (
    <div className="space-y-6">
      <PageHeader icon={Clock} title="Documentos pendientes" subtitle={`${pendingDocuments.length} requieren revisión`} />

      {pendingDocuments.length === 0 ? (
        <div className="panel">
          <EmptyState icon={EmptyRequestsIcon} title="No hay documentos pendientes de revisión"
            description="Cuando un trabajador suba documentos, aparecerán aquí." />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(documentsByWorker).map(([workerId, docs]) => {
            const worker = workersById.get(workerId);
            const name = worker ? `${worker.name} ${worker.lastName}`.trim() : `Trabajador ${workerId.slice(0, 8)}…`;
            const categories = worker ? workerCategoryNames(worker) : '';
            return (
              <section key={workerId} className="panel p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-12 h-12 rounded-xl bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                      {worker ? getInitials(worker.name, worker.lastName) : '?'}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))] truncate">
                        {name}
                      </h2>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {categories ? `${categories} · ` : ''}{docs.length} documento{docs.length === 1 ? '' : 's'} pendiente{docs.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <Link to={`/documents/review/${workerId}`} className="btn-primary">
                    <Eye className="w-4 h-4" />
                    Revisar
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))]">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--chip))] text-[hsl(var(--chip-foreground))] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" strokeWidth={1.9} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={doc.fileName}>{doc.fileName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="chip chip-warning"><Clock className="w-3 h-3" />Pendiente</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(doc.uploadedAt, 'dd/MM/yy')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
