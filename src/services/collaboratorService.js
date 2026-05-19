import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/collaborators';

export const collaboratorService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role_id) queryParams.append('role_id', params.role_id);
    if (params.status) queryParams.append('status', params.status);

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

  async getDeliverymen() {
    return apiClient.get(BASE_ENDPOINT + '/deliverymen');
  },

  async getBirthdays(month) {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);

    const endpoint = BASE_ENDPOINT + '/birthdays' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  }
};
