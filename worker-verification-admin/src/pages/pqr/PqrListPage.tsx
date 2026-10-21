import { useState } from 'react';
import { MessageSquareWarning, AlertTriangle, Eye } from 'lucide-react';
import { usePqrs } from '@/hooks/usePqrs';
import { Pagination } from '@/components/common/Pagination';
import { PqrDetailModal } from '@/components/features/pqr/PqrDetailModal';
import {
  PQR_ROLE_LABELS, PQR_STATUS_LABELS, PQR_STATUS_STYLES, PQR_TYPE_LABELS,
} from '@/components/features/pqr/pqrLabels';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--chart-5))]/10 via-[hsl(var(--card))] to-[hsl(var(--chart-5))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--chart-5))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--chart-5))]/20 flex items-center justify-center">
            <MessageSquareWarning className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--chart-5))]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">PQR</h1>
            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1 font-medium">
              Peticiones, quejas y reclamos · plazo de respuesta de 15 días hábiles
            </p>
          </div>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'todas'}
            onClick={() => setFilters({ status: tab.value, page: 1 })}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold border transition-colors',
              filters.status === tab.value
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))] overflow-hidden">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Registrada</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pqrs.map((pqr) => (
                  <TableRow key={pqr.id}>
                    <TableCell className="font-mono">{pqr.id}</TableCell>
                    <TableCell className="font-medium">{PQR_TYPE_LABELS[pqr.type]}</TableCell>
                    <TableCell>{PQR_ROLE_LABELS[pqr.author_role]}</TableCell>
                    <TableCell className="min-w-[14rem] max-w-xs">{truncateText(pqr.description, 70)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(new Date(pqr.created_at).getTime(), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={cn('inline-flex items-center gap-1', pqr.is_overdue && 'text-red-600 dark:text-red-400 font-semibold')}>
                        {pqr.is_overdue && <AlertTriangle className="w-4 h-4" aria-label="Vencida" />}
                        {formatDate(new Date(pqr.due_at).getTime(), 'dd/MM/yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', PQR_STATUS_STYLES[pqr.status])}>
                        {PQR_STATUS_LABELS[pqr.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedId(pqr.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold
                                   bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20"
                      >
                        <Eye className="w-4 h-4" />
                        {pqr.status === 'cerrada' ? 'Ver' : 'Responder'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
