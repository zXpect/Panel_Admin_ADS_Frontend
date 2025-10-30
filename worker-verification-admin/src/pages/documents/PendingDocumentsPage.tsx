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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--chart-5))]/10 via-[hsl(var(--card))] to-[hsl(var(--chart-5))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--chart-5))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--chart-5))]/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[hsl(var(--chart-5))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                Documentos Pendientes
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1 font-medium">
                {pendingDocuments.length} documento(s) requieren revisión
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      {pendingDocuments.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow p-12 text-center transition-colors border border-[hsl(var(--border))]">
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
              className="bg-[hsl(var(--card))] rounded-2xl shadow-md border-2 border-[hsl(var(--border))]
                         hover:border-[hsl(var(--primary))]/30 transition-all duration-300 hover:shadow-xl"
            >
              {/* Header de trabajador mejorado */}
              <div className="p-6 border-b-2 border-[hsl(var(--border))] flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70
                                  flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[hsl(var(--foreground))]">
                      Trabajador ID: {workerId}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                      {docs.length} documento(s) pendiente(s)
                    </p>
                  </div>
                </div>
                <Link
                  to={`/documents/review/${workerId}`}
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--primary))]
                             text-[hsl(var(--primary-foreground))] font-semibold hover:shadow-lg
                             transition-all duration-300 hover:scale-105"
                >
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Revisar Todos</span>
                </Link>
              </div>

              {/* Grid de documentos mejorado */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group border-2 border-[hsl(var(--border))] rounded-xl p-4
                                 hover:border-[hsl(var(--chart-5))]/40 transition-all duration-300
                                 bg-[hsl(var(--card))] shadow-sm hover:shadow-md
                                 transform hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--chart-5))]/20 flex items-center justify-center
                                        flex-shrink-0 group-hover:bg-[hsl(var(--chart-5))]/30
                                        group-hover:scale-110 transition-all duration-300">
                          <FileText className="w-5 h-5 text-[hsl(var(--chart-5))]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[hsl(var(--foreground))] truncate
                                        group-hover:text-[hsl(var(--chart-5))] transition-colors">
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
