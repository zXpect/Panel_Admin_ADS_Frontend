import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../endpoints';
import { PaymentFilters, PaymentListResponse } from '@/types/payment.types';

export const paymentService = {
  /**
   * Listar pagos con filtros y resumen de los aprobados (20 por página)
   */
  getPayments: async (filters?: PaymentFilters): Promise<PaymentListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.gateway) params.append('gateway', filters.gateway);
    if (filters?.service_request_id) params.append('service_request_id', filters.service_request_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', String(filters.page));

    const { data } = await axiosInstance.get<PaymentListResponse>(
      `${API_ENDPOINTS.PAYMENTS.LIST}?${params.toString()}`
    );

    return data;
  },
};
