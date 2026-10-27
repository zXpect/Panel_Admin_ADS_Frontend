// src/pages/workers/WorkersListPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkers } from '@/hooks/useWorkers';
import { usePagination } from '@/hooks/usePagination';
import { Search, Eye, Star, Plus, Edit, Trash2, Upload, Users } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import { ACCOUNT_SORT_OPTIONS, AccountSort, sortAccounts } from '@/lib/utils/sorting';
import { PageHeader } from '@/components/layout/PageHeader';
import { VerificationChip } from '@/components/features/workers/VerificationChip';
import { Pagination } from '@/components/common/Pagination';
import { WorkerFormModal } from '@/components/features/workers/WorkerFormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Worker, WorkerCreateInput, WorkerUpdateInput } from '@/types/worker.types';
import { WORKER_CATEGORIES, workerCategoryNames, workerCategorySlugs } from '@/lib/utils/constants';
import { usePanelRole } from '@/hooks/usePanelRole';

type VerificationFilter = '' | 'approved' | 'documents_submitted' | 'rejected' | 'none';

export const WorkersListPage = () => {
  const { isEvaluator } = usePanelRole();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState<boolean | undefined>();
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('');
  const [sort, setSort] = useState<AccountSort>('newest');

  const { 
    workers: allWorkers, 
    isLoading,
    createWorker,
    updateWorker,
    deleteWorker,
    isCreating,
    isUpdating,
    isDeleting
  } = useWorkers({
    search,
    available: availableFilter,
  });

  // Oficio y verificación se filtran aquí: el oficio usa `categories` con respaldo en
  // `work`, igual que el backend (DEF-10), y la verificación no tiene filtro en la API
  const workers = useMemo(
    () => sortAccounts(allWorkers.filter((worker) => {
      if (categoryFilter && !workerCategorySlugs(worker).includes(categoryFilter)) return false;
      if (verificationFilter) {
        const status = worker.verificationStatus?.status;
        const normalized = status === 'verified' ? 'approved' : status === 'pending' ? 'documents_submitted' : status;
        if (verificationFilter === 'none' ? !!status : normalized !== verificationFilter) return false;
      }
      return true;
    }), sort),
    [allWorkers, categoryFilter, verificationFilter, sort]
  );

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
  } = usePagination({ items: workers, itemsPerPage: 12 });

  useEffect(() => {
    resetPage();
  }, [search, categoryFilter, availableFilter, verificationFilter, sort, resetPage]);

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

  const handleFormSubmit = (data: WorkerCreateInput | WorkerUpdateInput) => {
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
      // Al crear, el formulario siempre manda correo y contraseña
      createWorker(data as WorkerCreateInput, {
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
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Trabajadores"
        subtitle={`Total: ${workers.length} trabajadores`}
        // En modo evaluación no se crean trabajadores ni se hace carga masiva
        actions={isEvaluator ? undefined : (
          <>
            <Link to="/workers/bulk-upload" className="btn-secondary">
              <Upload className="w-4 h-4" />
              Carga masiva
            </Link>
            <button onClick={handleCreate} className="btn-primary">
              <Plus className="w-4 h-4" />
              Nuevo trabajador
            </button>
          </>
        )}
      />

      {/* Filtros */}
      <div className="panel p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-3 md:items-end">
        <div className="relative">
          <label htmlFor="worker-search" className="sr-only">Buscar</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            id="worker-search"
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-10"
          />
        </div>
        <div>
          <label htmlFor="worker-category" className="field-label">Oficio</label>
          <select id="worker-category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field">
            <option value="">Todos los oficios</option>
            {WORKER_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="worker-verification" className="field-label">Verificación</label>
          <select id="worker-verification" value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)} className="field">
            <option value="">Todas</option>
            <option value="approved">Verificados</option>
            <option value="documents_submitted">En revisión</option>
            <option value="rejected">Rechazados</option>
            <option value="none">Sin documentos</option>
          </select>
        </div>
        <div>
          <label htmlFor="worker-available" className="field-label">Disponibilidad</label>
          <select
            id="worker-available"
            value={availableFilter === undefined ? '' : String(availableFilter)}
            onChange={(e) => setAvailableFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
            className="field"
          >
            <option value="">Todos</option>
            <option value="true">Disponibles</option>
            <option value="false">No disponibles</option>
          </select>
        </div>
        <div>
          <label htmlFor="worker-sort" className="field-label">Ordenar</label>
          <select id="worker-sort" value={sort} onChange={(e) => setSort(e.target.value as AccountSort)} className="field">
            {ACCOUNT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="panel overflow-hidden">
        {workers.length === 0 ? (
          <p className="p-12 text-center text-[hsl(var(--muted-foreground))]">No se encontraron trabajadores</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Trabajador</th>
                  <th>Oficios</th>
                  <th>Verificación</th>
                  <th>Estado</th>
                  <th>Calificación</th>
                  <th>Registro</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <Link to={`/workers/${worker.id}`} className="flex items-center gap-3 group">
                        <span className="w-10 h-10 rounded-xl bg-[hsl(var(--navy))] text-[hsl(var(--brand-on-navy))] flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                          {getInitials(worker.name, worker.lastName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))] group-hover:underline truncate">
                            {worker.name} {worker.lastName}
                          </span>
                          <span className="block text-xs text-[hsl(var(--muted-foreground))] truncate">{worker.email}</span>
                          {worker.phone && <span className="block text-xs text-[hsl(var(--muted-foreground))]">{worker.phone}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="max-w-[200px]">{workerCategoryNames(worker) || <span className="text-[hsl(var(--muted-foreground))]">Sin oficio</span>}</td>
                    <td><VerificationChip status={worker.verificationStatus?.status} /></td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {worker.isActive === false ? (
                          <span className="chip chip-danger">Suspendida</span>
                        ) : (
                          <>
                            <span className={`chip ${worker.isAvailable ? 'chip-success' : 'chip-neutral'}`}>
                              {worker.isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                            {worker.isOnline && <span className="chip chip-brand">En línea</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 text-[hsl(var(--brand-text))]" aria-hidden="true" />
                        {(worker.rating || 0).toFixed(1)}
                        <span className="text-[hsl(var(--muted-foreground))]">({worker.totalRatings || 0})</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap">{worker.createdAt ? formatDate(worker.createdAt, 'dd/MM/yyyy') : '—'}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/workers/${worker.id}`} className="icon-btn" aria-label={`Ver a ${worker.name}`} title="Ver">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {!isEvaluator && (
                          <>
                            <button onClick={() => handleEdit(worker)} className="icon-btn" aria-label={`Editar a ${worker.name}`} title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(worker)} aria-label={`Eliminar a ${worker.name}`} title="Eliminar"
                              className="icon-btn text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/40 hover:bg-[hsl(var(--danger-soft))]">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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

      {/* Modales */}
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
        title="Eliminar trabajador"
        message={`¿Estás seguro de que deseas eliminar a ${workerToDelete?.name} ${workerToDelete?.lastName}? Esta acción no se puede deshacer.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
