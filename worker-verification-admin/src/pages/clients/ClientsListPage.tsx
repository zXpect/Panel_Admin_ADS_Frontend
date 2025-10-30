import { useState, useEffect } from 'react';
import { useClients } from '@/hooks/useClients';
import { usePagination } from '@/hooks/usePagination';
import { Search, Mail, Phone, User, Eye, UserCheck } from 'lucide-react';
import { getInitials } from '@/lib/utils/helpers';
import { Pagination } from '@/components/common/Pagination';
import { ClientDetailModal } from '@/components/features/clients/ClientDetailModal';
import { Client } from '@/types/client.types';

export const ClientsListPage = () => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { clients, isLoading } = useClients({ search });

  // Paginación
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    itemsPerPage,
    totalItems,
    resetPage,
  } = usePagination({ items: clients, itemsPerPage: 12 });

  // Reset page when search changes
  useEffect(() => {
    resetPage();
  }, [search, resetPage]);

  // Handlers
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--accent))]/10 via-[hsl(var(--card))] to-[hsl(var(--accent))]/5 rounded-2xl shadow-lg border border-[hsl(var(--border))] p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--accent))]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Clientes</h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1 font-medium">
                Total: {clients.length} clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search mejorado */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow p-6 border border-[hsl(var(--border))] transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-lg
                       bg-[hsl(var(--input))] text-[hsl(var(--foreground))]
                       placeholder-[hsl(var(--muted-foreground))]
                       focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow p-12 text-center border border-[hsl(var(--border))] transition-colors">
          <User className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">No se encontraron clientes</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map((client) => (
              <div
                key={client.id}
                className="group bg-[hsl(var(--card))] rounded-2xl shadow-md hover:shadow-xl
                           transition-all duration-300 p-6 flex flex-col border-2 border-[hsl(var(--border))]
                           hover:border-[hsl(var(--accent))]/30 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar mejorado */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/70
                                  flex items-center justify-center text-[hsl(var(--accent-foreground))] font-bold shadow-md
                                  group-hover:scale-110 transition-transform">
                    {getInitials(client.name, client.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                      {client.name} {client.lastName}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Cliente</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* ID */}
                <div className="mb-4 pt-4 border-t border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    ID: <span className="font-mono">{client.id}</span>
                  </p>
                </div>

                {/* Action mejorado */}
                <button
                  onClick={() => handleViewClient(client)}
                  className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2
                             bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded-lg
                             hover:opacity-90 transition-all duration-300 font-semibold group-hover:shadow-lg"
                >
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Ver Detalles</span>
                </button>
              </div>
            ))}
          </div>

          {/* Paginación mejorada */}
          {totalPages > 1 && (
            <div className="bg-[hsl(var(--card))] rounded-2xl shadow border border-[hsl(var(--border))]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
    </div>
  );
};