import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/bonus-scales';

export const bonusScaleService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.brand_id) queryParams.append('brand_id', params.brand_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async calculateBonus(price, brandId = null) {
    const queryParams = new URLSearchParams();
    queryParams.append('price', price);
    if (brandId) queryParams.append('brand_id', brandId);

    return apiClient.get(BASE_ENDPOINT + '/calculate?' + queryParams.toString());
  },

  async create(data) {
    return apiClient.post(BASE_ENDPOINT, data);
  },

  async update(id, data) {
    return apiClient.put(BASE_ENDPOINT + '/' + id, data);
  },

  async delete(id) {
    return apiClient.delete(BASE_ENDPOINT + '/' + id);
  }
};
