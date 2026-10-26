import { useState } from 'react';
import { MessageSquareText, MessageSquareWarning, AlertTriangle, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePqrs } from '@/hooks/usePqrs';
import { Pagination } from '@/components/common/Pagination';
import { PqrDetailModal } from '@/components/features/pqr/PqrDetailModal';
import {
  PQR_ROLE_LABELS, PQR_STATUS_LABELS, PQR_STATUS_STYLES, PQR_TYPE_LABELS,
} from '@/components/features/pqr/pqrLabels';
import { cn, formatDate, truncateText } from '@/lib/utils/helpers';
import { Pqr, PqrFilters, PqrStatus } from '@/types/pqr.types';

// El backend pagina de a 20 (REST_FRAMEWORK.PAGE_SIZE)
const PAGE_SIZE = 20;

const STATUS_TABS: { value: PqrStatus | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'abierta', label: PQR_STATUS_LABELS.abierta },
  { value: 'en_tramite', label: PQR_STATUS_LABELS.en_tramite },
  { value: 'cerrada', label: PQR_STATUS_LABELS.cerrada },
];

/** PQR de clientes y trabajadores (A7), con plazo de 15 días hábiles. */
export const PqrListPage = () => {
  const [filters, setFilters] = useState<PqrFilters>({ status: '', page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { pqrs, count, isLoading, answerPqr, isAnswering } = usePqrs(filters);

  // El modal muestra la versión más reciente de la lista (después de responder)
  const selected: Pqr | null = pqrs.find((pqr) => pqr.id === selectedId) || null;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader icon={MessageSquareText} title="PQR"
        subtitle="Peticiones, quejas y reclamos · plazo de respuesta de 15 días hábiles" />

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'todas'}
            onClick={() => setFilters({ status: tab.value, page: 1 })}
            className={cn(
              'min-h-[40px] px-4 rounded-full text-sm font-semibold border-[1.5px] transition-colors',
              filters.status === tab.value
                ? 'bg-[hsl(var(--navy))] text-[hsl(var(--on-navy))] border-transparent dark:bg-[hsl(var(--primary))] dark:text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        ) : pqrs.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareWarning className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">No hay PQR en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Autor</th>
                  <th>Descripción</th>
                  <th>Registrada</th>
                  <th>Plazo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pqrs.map((pqr) => (
                  <tr key={pqr.id}>
                    <td className="font-mono">{pqr.id}</td>
                    <td className="font-semibold">{PQR_TYPE_LABELS[pqr.type]}</td>
                    <td>{PQR_ROLE_LABELS[pqr.author_role]}</td>
                    <td className="min-w-[11rem] max-w-[16rem]">{truncateText(pqr.description, 60)}</td>
                    <td className="whitespace-nowrap">
                      {formatDate(new Date(pqr.created_at).getTime(), 'dd/MM/yyyy')}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={cn('block', pqr.is_overdue && 'text-[hsl(var(--danger-foreground))] font-semibold')}>
                        {formatDate(new Date(pqr.due_at).getTime(), 'dd/MM/yyyy')}
                      </span>
                      {pqr.is_overdue && (
                        <span className="chip chip-danger mt-1"><AlertTriangle className="w-3 h-3" aria-hidden="true" />Vencida</span>
                      )}
                    </td>
                    <td>
                      <span className={cn('chip', PQR_STATUS_STYLES[pqr.status])}>
                        {PQR_STATUS_LABELS[pqr.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedId(pqr.id)}
                        className="btn-secondary min-h-[36px] px-3 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        {pqr.status === 'cerrada' ? 'Ver' : 'Responder'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {count > PAGE_SIZE && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          itemsPerPage={PAGE_SIZE}
          totalItems={count}
        />
      )}

      <PqrDetailModal
        pqr={selected}
        onClose={() => setSelectedId(null)}
        onAnswer={(id, input) => answerPqr({ id, input })}
        isAnswering={isAnswering}
      />
    </div>
  );
};
