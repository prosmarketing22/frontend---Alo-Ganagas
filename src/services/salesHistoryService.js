import { apiClient } from './apiClient';

const salesHistoryService = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();

    // Mapear nombres de frontend a backend
    if (params.status) queryParams.append('order_status', params.status);
    if (params.start_date) queryParams.append('date_from', params.start_date);
    if (params.end_date) queryParams.append('date_to', params.end_date);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    // Enviar payment_status directamente al backend
    if (params.payment_status) queryParams.append('payment_status', params.payment_status);

    return apiClient.get(`/orders?${queryParams.toString()}`);
  },

  getSummary: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('date_from', params.start_date);
    if (params.end_date) queryParams.append('date_to', params.end_date);

    return apiClient.get(`/orders/summary?${queryParams.toString()}`);
  },

  exportToExcel: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('date_from', params.start_date);
    if (params.end_date) queryParams.append('date_to', params.end_date);
    if (params.status) queryParams.append('order_status', params.status);

    return apiClient.get(`/orders/export?${queryParams.toString()}`);
  },

  getById: (id) => {
    return apiClient.get(`/orders/${id}`);
  }
};

export default salesHistoryService;
