// src/pages/documents/PendingDocumentsPage.tsx
import { Link } from 'react-router-dom';
import { useDocuments } from '@/hooks/useDocuments';
import { FileText, Eye, Clock, User } from 'lucide-react';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils/helpers';

export const PendingDocumentsPage = () => {
  const { pendingDocuments, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  // Agrupar documentos por trabajador
  const documentsByWorker = pendingDocuments.reduce((acc, doc) => {
    if (!acc[doc.workerId]) acc[doc.workerId] = [];
    acc[doc.workerId].push(doc);
    return acc;
  }, {} as Record<string, typeof pendingDocuments>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          Documentos Pendientes
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {pendingDocuments.length} documento(s) requieren revisión
        </p>
      </div>

      {/* Lista de documentos */}
      {pendingDocuments.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-12 text-center transition-colors border border-[hsl(var(--border))]">
          <Clock className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            No hay documentos pendientes de revisión
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentsByWorker).map(([workerId, docs]) => (
            <div
              key={workerId}
              className="bg-[hsl(var(--card))] rounded-xl shadow-md border border-[hsl(var(--border))] transition-all"
            >
              {/* Header de trabajador */}
              <div className="p-6 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">
                      Trabajador ID: {workerId}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {docs.length} documento(s) pendiente(s)
                    </p>
                  </div>
                </div>
                <Link
                  to={`/documents/review/${workerId}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Revisar Todos</span>
                </Link>
              </div>

              {/* Grid de documentos */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-[hsl(var(--border))] rounded-lg p-4 hover:border-[hsl(var(--primary))] transition-colors bg-[hsl(var(--card))] shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--chart-2))]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[hsl(var(--chart-2))]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[hsl(var(--foreground))] truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 capitalize">
                            {doc.documentType.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                doc.status
                              )}`}
                            >
                              {getStatusText(doc.status)}
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                              {formatDate(doc.uploadedAt, 'dd/MM/yy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
