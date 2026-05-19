import { apiClient } from './apiClient';

export const supplierService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/suppliers${queryString ? '?' + queryString : ''}`;

    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(`/suppliers/${id}`);
  },

  async getByRuc(ruc) {
    return apiClient.get(`/suppliers/ruc/${ruc}`);
  },

  async create(supplierData) {
    return apiClient.post('/suppliers', supplierData);
  },

  async update(id, supplierData) {
    return apiClient.put(`/suppliers/${id}`, supplierData);
  },

  async delete(id) {
    return apiClient.delete(`/suppliers/${id}`);
  }
};
