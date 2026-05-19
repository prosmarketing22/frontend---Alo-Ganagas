import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/loans';

export const loanService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.debt_type) queryParams.append('debt_type', params.debt_type);
    if (params.status) queryParams.append('status', params.status);
    if (params.container_type) queryParams.append('container_type', params.container_type);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async create(data) {
    return apiClient.post(BASE_ENDPOINT, data);
  },

  async registerReturn(id, quantity) {
    return apiClient.put(BASE_ENDPOINT + '/' + id + '/return', { quantity: quantity });
  },

  async getSummary() {
    return apiClient.get(BASE_ENDPOINT + '/summary');
  },

  async getByCustomer(customerId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + '/customer/' + customerId + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getBySupplier(supplierId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + '/supplier/' + supplierId + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  }
};
