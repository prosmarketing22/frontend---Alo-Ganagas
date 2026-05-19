import { apiClient } from './apiClient';

const ENDPOINT = '/supplier-loans';

export const supplierLoanService = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.debt_type) queryParams.append('debt_type', params.debt_type);
    if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id);
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

  registerReturn: (id, quantity, warehouseId = null) => {
    const body = { quantity };
    if (warehouseId) body.warehouse_id = warehouseId;
    return apiClient.put(`${ENDPOINT}/${id}/return`, body);
  },

  getSummary: () => {
    return apiClient.get(`${ENDPOINT}/summary`);
  },

  getBySupplier: (supplierId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const query = queryParams.toString();
    return apiClient.get(`${ENDPOINT}/supplier/${supplierId}${query ? '?' + query : ''}`);
  },

  getGroupedBySupplier: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.debt_type) queryParams.append('debt_type', params.debt_type);

    const query = queryParams.toString();
    return apiClient.get(`${ENDPOINT}/grouped${query ? '?' + query : ''}`);
  }
};
