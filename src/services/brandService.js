import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/brands';

export const brandService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('name', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.product_type) queryParams.append('product_type', params.product_type);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async create(data) {
    return apiClient.post(BASE_ENDPOINT, data);
  },

  async update(id, data) {
    return apiClient.put(BASE_ENDPOINT + '/' + id, data);
  },

  async delete(id) {
    return apiClient.delete(BASE_ENDPOINT + '/' + id);
  },

  async activate(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/activate');
  },

  async deactivate(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/deactivate');
  },

  async toggleStatus(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/toggle-status');
  },

  async checkProducts(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id + '/check-products');
  }
};
