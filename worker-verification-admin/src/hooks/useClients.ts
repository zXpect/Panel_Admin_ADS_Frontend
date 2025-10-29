// src/hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/api/services/clientService';
import { ClientFilters } from '@/types/client.types';
import toast from 'react-hot-toast';

export const useClients = (filters?: ClientFilters) => {
  const queryClient = useQueryClient();

  // Query para listar clientes
  const clientsQuery = useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientService.getClients(filters),
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    error: clientsQuery.error,
  };
};

// Hook para obtener un cliente específico
export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientService.getClientById(id),
    enabled: !!id,
  });
};