import { apiClient } from './apiClient';

const dashboardService = {
  getBaseDashboard: () => {
    return apiClient.get('/dashboard/base');
  },

  getPendingCount: () => {
    return apiClient.get('/orders/pending/count');
  },

  getPendingOrders: () => {
    return apiClient.get('/orders/pending');
  },

  getActiveOrders: (limit = 10) => {
    return apiClient.get(`/orders?status_in=CONFIRMADO,ASIGNADO,EN_CAMINO&limit=${limit}`);
  },

  getDeliverers: () => {
    return apiClient.get('/collaborators?role=REPARTIDOR&status=active');
  },

  getMainWarehouseStock: () => {
    return apiClient.get('/products?warehouse_id=1&status=active');
  }
};

export default dashboardService;
