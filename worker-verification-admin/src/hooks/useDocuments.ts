// src/hooks/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/api/services/documentService';
import { DocumentApprovalInput, DocumentRejectionInput } from '@/types/document.types';
import toast from 'react-hot-toast';

export const useDocuments = () => {
  const queryClient = useQueryClient();

  // Query para documentos pendientes
  const pendingQuery = useQuery({
    queryKey: ['documents', 'pending'],
    queryFn: () => documentService.getPendingDocuments(),
  });

  // Mutation para aprobar documento
  const approveMutation = useMutation({
    mutationFn: (data: DocumentApprovalInput) => documentService.approveDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento aprobado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al aprobar documento');
    },
  });

  // Mutation para rechazar documento
  const rejectMutation = useMutation({
    mutationFn: (data: DocumentRejectionInput) => documentService.rejectDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento rechazado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al rechazar documento');
    },
  });

  return {
    pendingDocuments: pendingQuery.data || [],
    isLoading: pendingQuery.isLoading,
    isError: pendingQuery.isError,
    
    approveDocument: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    
    rejectDocument: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
  };
};

// Hook para documentos de un trabajador específico
export const useWorkerDocuments = (workerId: string) => {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', 'worker', workerId],
    queryFn: () => documentService.getWorkerDocuments(workerId),
    enabled: !!workerId,
  });

  const requirementsQuery = useQuery({
    queryKey: ['documents', 'requirements', workerId],
    queryFn: () => documentService.checkRequirements(workerId),
    enabled: !!workerId,
  });

  return {
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    
    requirements: requirementsQuery.data,
    isLoadingRequirements: requirementsQuery.isLoading,
  };
};