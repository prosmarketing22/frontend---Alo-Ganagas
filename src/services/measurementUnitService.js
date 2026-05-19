import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/measurement-units';

export const measurementUnitService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async list() {
    return apiClient.get(BASE_ENDPOINT + '/list');
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

  async toggleActive(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/toggle-active');
  },

  async checkProducts(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id + '/check-products');
  }
};
