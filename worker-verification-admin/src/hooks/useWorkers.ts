import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerService } from '@/api/services/workerService';
import { WorkerFilters, WorkerCreateInput, WorkerUpdateInput } from '@/types/worker.types';
import toast from 'react-hot-toast';

export const useWorkers = (filters?: WorkerFilters) => {
  const queryClient = useQueryClient();

  // Query para listar trabajadores
  const workersQuery = useQuery({
    queryKey: ['workers', filters],
    queryFn: () => workerService.getWorkers(filters),
  });

  // Query para estadísticas
  const statisticsQuery = useQuery({
    queryKey: ['workers', 'statistics'],
    queryFn: () => workerService.getStatistics(),
  });

  // Mutation para crear trabajador
  const createMutation = useMutation({
    mutationFn: (data: WorkerCreateInput) => workerService.createWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Trabajador creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear trabajador');
    },
  });

  // Mutation para actualizar trabajador
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkerUpdateInput }) =>
      workerService.patchWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Trabajador actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar trabajador');
    },
  });

  // Mutation para eliminar trabajador
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workerService.deleteWorker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Trabajador eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar trabajador');
    },
  });

  // Mutation para actualizar disponibilidad
  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      workerService.updateAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Disponibilidad actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar disponibilidad');
    },
  });

  // Mutation para actualizar estado online
  const updateOnlineStatusMutation = useMutation({
    mutationFn: ({ id, isOnline }: { id: string; isOnline: boolean }) =>
      workerService.updateOnlineStatus(id, isOnline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Estado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar estado');
    },
  });

  const updateVerificationStatusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
    workerService.updateVerificationStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['workers'] });
    toast.success('Estado de verificación actualizado');
  },
  onError: (error: any) => {
    toast.error(error.response?.data?.error || 'Error al actualizar estado de verificación');
  },
});

  return {
    workers: workersQuery.data || [],
    isLoading: workersQuery.isLoading,
    isError: workersQuery.isError,
    error: workersQuery.error,
    
    statistics: statisticsQuery.data,
    isLoadingStats: statisticsQuery.isLoading,
    
    createWorker: createMutation.mutate,
    isCreating: createMutation.isPending,
    
    updateWorker: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    
    deleteWorker: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    
    updateAvailability: updateAvailabilityMutation.mutate,
    updateOnlineStatus: updateOnlineStatusMutation.mutate,

    updateVerificationStatus: updateVerificationStatusMutation.mutate,
    isUpdatingVerification: updateVerificationStatusMutation.isPending,

  };
};

// Hook para obtener un trabajador específico
export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ['workers', id],
    queryFn: () => workerService.getWorkerById(id),
    enabled: !!id,
  });
};