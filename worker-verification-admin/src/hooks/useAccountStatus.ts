// src/hooks/useAccountStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/api/services/accountService';
import toast from 'react-hot-toast';

// El 409 (servicio en curso) y demás errores los muestra el interceptor de axios
export const useAccountStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ uid, isActive, reason }: { uid: string; isActive: boolean; reason?: string }) =>
      accountService.setStatus(uid, isActive, reason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit'] });
      toast.success(result.is_active ? 'Cuenta reactivada' : 'Cuenta suspendida');
    },
  });

  return { setStatus: mutation.mutateAsync, isPending: mutation.isPending };
};
