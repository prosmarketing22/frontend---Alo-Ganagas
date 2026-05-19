import { apiClient } from './apiClient';

const ENDPOINT = '/customer-loans';

export const customerLoanService = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.debt_type) queryParams.append('debt_type', params.debt_type);
    if (params.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params.container_type) queryParams.append('container_type', params.container_type);
    if (params.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiClient.get(`${ENDPOINT}${query ? '?' + query : ''}`);
  },

  getById: (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  create: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  registerReturn: (id, quantity, returnedBy = null, warehouseId = null) => {
    const data = { quantity };
    if (returnedBy) {
      data.returned_by = returnedBy;
    }
    if (warehouseId) {
      data.warehouse_id = warehouseId;
    }
    return apiClient.put(`${ENDPOINT}/${id}/return`, data);
  },

  getSummary: () => {
    return apiClient.get(`${ENDPOINT}/summary`);
  },

  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const query = queryParams.toString();
    return apiClient.get(`${ENDPOINT}/customer/${customerId}${query ? '?' + query : ''}`);
  },

  getReturnsHistory: (loanId) => {
    return apiClient.get(`${ENDPOINT}/${loanId}/returns`);
  },

  getGroupedByCustomer: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.debt_type) queryParams.append('debt_type', params.debt_type);

    const query = queryParams.toString();
    return apiClient.get(`${ENDPOINT}/grouped${query ? '?' + query : ''}`);
  }
};
