// src/hooks/usePayments.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { paymentService } from '@/api/services/paymentService';
import { PaymentFilters } from '@/types/payment.types';

export const usePayments = (filters?: PaymentFilters) => {
  const paymentsQuery = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
    // Al cambiar de página no se vacía la tabla mientras llega la siguiente
    placeholderData: keepPreviousData,
  });

  return {
    payments: paymentsQuery.data?.data || [],
    count: paymentsQuery.data?.count || 0,
    summary: paymentsQuery.data?.summary,
    isLoading: paymentsQuery.isLoading,
    isFetching: paymentsQuery.isFetching,
    isError: paymentsQuery.isError,
    error: paymentsQuery.error,
  };
};
