import { useState, useEffect } from 'react';
import { useClients } from '@/hooks/useClients';
import { usePagination } from '@/hooks/usePagination';
import { Search, Eye, UserCheck } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import { ACCOUNT_SORT_OPTIONS, AccountSort, sortAccounts } from '@/lib/utils/sorting';
import { Pagination } from '@/components/common/Pagination';
import { ClientDetailModal } from '@/components/features/clients/ClientDetailModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Client } from '@/types/client.types';
import { LoadingNut } from '@/components/common/LoadingNut';
import { EmptyState } from '@/components/common/EmptyState';
import { EmptyHomeIcon } from '@/components/common/AdsIcons';

type StatusFilter = '' | 'active' | 'suspended';

/** Clientes en tabla (mockup A5): búsqueda, estado de la cuenta y detalle. */
export const ClientsListPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [sort, setSort] = useState<AccountSort>('newest');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { clients: allClients, isLoading } = useClients({ search });
  const clients = sortAccounts(
    statusFilter
      ? allClients.filter((client) => (client.isActive === false) === (statusFilter === 'suspended'))
      : allClients,
    sort
  );

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    itemsPerPage,
    totalItems,
    resetPage,
  } = usePagination({ items: clients, itemsPerPage: 15 });

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, sort, resetPage]);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingNut />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={UserCheck} title="Clientes" subtitle={`Total: ${clients.length} clientes`} />

      <div className="panel p-4 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3 md:items-end">
        <div className="relative">
          <label htmlFor="client-search" className="sr-only">Buscar</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            id="client-search"
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-10"
          />
        </div>
        <div>
          <label htmlFor="client-status" className="field-label">Cuenta</label>
          <select id="client-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="field">
            <option value="">Todas</option>
            <option value="active">Activas</option>
            <option value="suspended">Suspendidas</option>
          </select>
        </div>
        <div>
          <label htmlFor="client-sort" className="field-label">Ordenar</label>
          <select id="client-sort" value={sort} onChange={(e) => setSort(e.target.value as AccountSort)} className="field">
            {ACCOUNT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {clients.length === 0 ? (
          <EmptyState icon={EmptyHomeIcon} title="No se encontraron clientes"
            description="Prueba con otra búsqueda o cambia el filtro de cuenta." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Registro</th>
                  <th>Cuenta</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <button onClick={() => handleViewClient(client)} className="flex items-center gap-3 text-left group">
                        <span className="w-10 h-10 rounded-xl bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                          {getInitials(client.name, client.lastName)}
                        </span>
                        <span className="font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))] group-hover:underline">
                          {client.name} {client.lastName}
                        </span>
                      </button>
                    </td>
                    <td className="max-w-[260px] truncate">{client.email || '—'}</td>
                    <td className="whitespace-nowrap">{client.phone || '—'}</td>
                    <td className="whitespace-nowrap">{client.createdAt ? formatDate(client.createdAt, 'dd/MM/yyyy') : '—'}</td>
                    <td>
                      {client.isActive === false
                        ? <span className="chip chip-danger">Suspendida</span>
                        : <span className="chip chip-success">Activa</span>}
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => handleViewClient(client)} className="icon-btn"
                          aria-label={`Ver a ${client.name}`} title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}

      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
        // La versión más reciente de la lista (p. ej. después de suspender)
        client={allClients.find((client) => client.id === selectedClient?.id) || selectedClient}
      />
    </div>
  );
};
