// src/hooks/useCatalogAdmin.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/api/services/catalogService';
import { AuditEntity, CatalogCategoryInput, CatalogTaskInput } from '@/types/catalog.types';
import toast from 'react-hot-toast';

// Los errores (400, 404...) los muestra el interceptor de axios con el mensaje del backend
export const useCatalogAdmin = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-catalog'] });
    queryClient.invalidateQueries({ queryKey: ['admin-config'] });
    queryClient.invalidateQueries({ queryKey: ['admin-audit'] });
  };

  const catalogQuery = useQuery({ queryKey: ['admin-catalog'], queryFn: catalogService.getCatalog });
  const configQuery = useQuery({ queryKey: ['admin-config'], queryFn: catalogService.getConfig });

  const updateCategory = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CatalogCategoryInput }) => catalogService.updateCategory(id, input),
    onSuccess: () => { refresh(); toast.success('Oficio actualizado'); },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CatalogTaskInput }) => catalogService.updateTask(id, input),
    onSuccess: () => { refresh(); toast.success('Tarea actualizada'); },
  });

  const createTask = useMutation({
    mutationFn: (input: CatalogTaskInput) => catalogService.createTask(input),
    onSuccess: () => { refresh(); toast.success('Tarea creada'); },
  });

  const updateConfig = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => catalogService.updateConfig(key, value),
    onSuccess: () => { refresh(); toast.success('Parámetro actualizado'); },
  });

  return {
    categories: catalogQuery.data || [],
    configs: configQuery.data || [],
    isLoading: catalogQuery.isLoading || configQuery.isLoading,
    updateCategory: updateCategory.mutateAsync,
    updateTask: updateTask.mutateAsync,
    createTask: createTask.mutateAsync,
    updateConfig: updateConfig.mutateAsync,
    isSaving: updateCategory.isPending || updateTask.isPending || createTask.isPending || updateConfig.isPending,
  };
};

export const useAuditLog = (entity?: AuditEntity) => {
  const auditQuery = useQuery({
    queryKey: ['admin-audit', entity],
    queryFn: () => catalogService.getAudit(entity),
  });
  return { entries: auditQuery.data?.data || [], isLoading: auditQuery.isLoading };
};
