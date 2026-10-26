// src/hooks/usePqrs.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pqrService } from '@/api/services/pqrService';
import { PqrAnswerInput, PqrFilters } from '@/types/pqr.types';
import toast from 'react-hot-toast';

export const usePqrs = (filters?: PqrFilters) => {
  const queryClient = useQueryClient();

  const pqrsQuery = useQuery({
    queryKey: ['pqrs', filters],
    queryFn: () => pqrService.getPqrs(filters),
    placeholderData: keepPreviousData,
  });

  // Los errores (cierre sin respuesta, PQR ya cerrada) los muestra el interceptor de axios
  const answerMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: PqrAnswerInput }) => pqrService.answerPqr(id, input),
    onSuccess: (pqr) => {
      queryClient.invalidateQueries({ queryKey: ['pqrs'] });
      toast.success(pqr.status === 'cerrada'
        ? 'PQR cerrada; se notificó al usuario'
        : 'PQR en trámite; se notificó al usuario');
    },
  });

  return {
    pqrs: pqrsQuery.data?.data || [],
    count: pqrsQuery.data?.count || 0,
    isLoading: pqrsQuery.isLoading,
    isError: pqrsQuery.isError,
    error: pqrsQuery.error,
    answerPqr: answerMutation.mutateAsync,
    isAnswering: answerMutation.isPending,
  };
};
