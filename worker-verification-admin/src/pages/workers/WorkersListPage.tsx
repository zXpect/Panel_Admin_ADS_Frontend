// src/pages/workers/WorkersListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkers } from '@/hooks/useWorkers';
import { usePagination } from '@/hooks/usePagination';
import { Search, Eye, Phone, Mail, MapPin, Star, Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice, getInitials } from '@/lib/utils/helpers';
import { Pagination } from '@/components/common/Pagination';
import { WorkerFormModal } from '@/components/features/workers/WorkerFormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Worker } from '@/types/worker.types';

export const WorkersListPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState<boolean | undefined>();

  const { 
    workers, 
    isLoading,
    createWorker,
    updateWorker,
    deleteWorker,
    isCreating,
    isUpdating,
    isDeleting
  } = useWorkers({
    search,
    category: categoryFilter || undefined,
    available: availableFilter,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    itemsPerPage,
    totalItems,
    resetPage,
  } = usePagination({ items: workers, itemsPerPage: 9 });

  useEffect(() => {
    resetPage();
  }, [search, categoryFilter, availableFilter, resetPage]);

  const handleCreate = () => {
    setSelectedWorker(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsFormModalOpen(true);
  };

  const handleDelete = (worker: Worker) => {
    setWorkerToDelete(worker);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedWorker) {
      updateWorker(
        { id: selectedWorker.id, data },
        {
          onSuccess: () => {
            setIsFormModalOpen(false);
            setSelectedWorker(null);
          },
        }
      );
    } else {
      createWorker(data, {
        onSuccess: () => {
          setIsFormModalOpen(false);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setWorkerToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Trabajadores
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Total: {workers.length} trabajadores
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Trabajador</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow p-6 border border-[hsl(var(--border))] transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-lg 
                         bg-[hsl(var(--input))] text-[hsl(var(--foreground))] 
                         placeholder-[hsl(var(--muted-foreground))] 
                         focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
            />
          </div>

          {/* Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg 
                       bg-[hsl(var(--input))] text-[hsl(var(--foreground))] 
                       focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
          >
            <option value="">Todas las categorías</option>
            <option value="Plomería">Plomería</option>
            <option value="Electricista">Electricista</option>
            <option value="Jardinería">Jardinería</option>
            <option value="Carpintería">Carpintería</option>
            <option value="Pintor">Pintor</option>
            <option value="Albañilería">Albañilería</option>
            <option value="Ferretería">Ferretería</option>
          </select>

          {/* Disponibilidad */}
          <select
            value={availableFilter === undefined ? '' : String(availableFilter)}
            onChange={(e) =>
              setAvailableFilter(
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg 
                       bg-[hsl(var(--input))] text-[hsl(var(--foreground))] 
                       focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="true">Disponibles</option>
            <option value="false">No disponibles</option>
          </select>
        </div>
      </div>

      {/* Lista de trabajadores */}
      {workers.length === 0 ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow p-12 text-center border border-[hsl(var(--border))] transition-colors">
          <p className="text-[hsl(var(--muted-foreground))]">
            No se encontraron trabajadores
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((worker) => (
              <div
                key={worker.id}
                className="bg-[hsl(var(--card))] rounded-2xl shadow-md hover:shadow-lg 
                           transition-all p-6 flex flex-col border border-[hsl(var(--border))]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center 
                                    text-[hsl(var(--primary-foreground))] font-semibold shadow">
                      {getInitials(worker.name, worker.lastName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))] leading-tight">
                        {worker.name} {worker.lastName}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {worker.work}
                      </p>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col gap-1 items-end">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        worker.isOnline
                          ? 'bg-[hsl(var(--chart-3))]/20 text-[hsl(var(--chart-3))]'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {worker.isOnline ? 'En línea' : 'Desconectado'}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        worker.isAvailable
                          ? 'bg-[hsl(var(--chart-1))]/20 text-[hsl(var(--chart-1))]'
                          : 'bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))]'
                      }`}
                    >
                      {worker.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {worker.email && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                  {worker.phone && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <Phone className="w-4 h-4" />
                      <span>{worker.phone}</span>
                    </div>
                  )}
                  {worker.latitude && worker.longitude && (
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-4 h-4" />
                      <span>Ubicación registrada</span>
                    </div>
                  )}
                </div>

                {/* Rating y precio */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[hsl(var(--chart-2))] fill-[hsl(var(--chart-2))]" />
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {worker.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      ({worker.totalRatings})
                    </span>
                  </div>
                  {worker.pricePerHour > 0 && (
                    <span className="text-sm font-semibold text-[hsl(var(--primary))]">
                      {formatPrice(worker.pricePerHour)}/hora
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-auto flex gap-2">
                  <Link
                    to={`/workers/${worker.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                               bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] 
                               rounded-lg hover:opacity-90 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </Link>
                  <button
                    onClick={() => handleEdit(worker)}
                    className="flex items-center justify-center gap-2 px-3 py-2 
                               bg-[hsl(var(--chart-1))] text-[hsl(var(--chart-1-foreground))] 
                               rounded-lg hover:opacity-90 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(worker)}
                    className="flex items-center justify-center gap-2 px-3 py-2 
                               bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] 
                               rounded-lg hover:opacity-90 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
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

      {/* Modals */}
      <WorkerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedWorker(null);
        }}
        onSubmit={handleFormSubmit}
        worker={selectedWorker}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setWorkerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Trabajador"
        message={`¿Estás seguro de que deseas eliminar a ${workerToDelete?.name} ${workerToDelete?.lastName}? Esta acción no se puede deshacer.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
