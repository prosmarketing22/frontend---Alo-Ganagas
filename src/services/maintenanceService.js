import { apiClient } from './apiClient';

const maintenanceService = {
  // === ESTADISTICAS Y TECNICOS ===
  getStats: () => {
    return apiClient.get('/maintenance/stats');
  },

  getTechnicians: () => {
    return apiClient.get('/maintenance/technicians');
  },

  // === MAINTENANCE REQUESTS (solo lectura, las crea el cliente desde el portal) ===
  getAllRequests: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    return apiClient.get(`/maintenance/requests?${queryParams.toString()}`);
  },

  getRequestById: (id) => {
    return apiClient.get(`/maintenance/requests/${id}`);
  },

  // === MAINTENANCE SCHEDULES ===
  getAllSchedules: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.technician_id) queryParams.append('technician_id', params.technician_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    return apiClient.get(`/maintenance/schedules?${queryParams.toString()}`);
  },

  getScheduleById: (id) => {
    return apiClient.get(`/maintenance/schedules/${id}`);
  },

  // === MAINTENANCE SERVICES ===
  getAllServices: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.technician_id) queryParams.append('technician_id', params.technician_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    return apiClient.get(`/maintenance/services?${queryParams.toString()}`);
  },

  getServiceById: (id) => {
    return apiClient.get(`/maintenance/services/${id}`);
  },

  createService: (data) => {
    return apiClient.post('/maintenance/services', data);
  },

  updateService: (id, data) => {
    return apiClient.put(`/maintenance/services/${id}`, data);
  },

  deleteService: (id) => {
    return apiClient.delete(`/maintenance/services/${id}`);
  }
};

export default maintenanceService;
