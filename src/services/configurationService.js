import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/configurations';

export const configurationService = {
  getAll: async () => {
    return apiClient.get(BASE_ENDPOINT);
  },

  getById: async (id) => {
    return apiClient.get(`${BASE_ENDPOINT}/${id}`);
  },

  getByKey: async (key) => {
    return apiClient.get(`${BASE_ENDPOINT}/key/${key}`);
  },

  getValue: async (key) => {
    const response = await apiClient.get(`${BASE_ENDPOINT}/key/${key}`);
    return response?.value;
  },

  create: async (data) => {
    return apiClient.post(BASE_ENDPOINT, data);
  },

  update: async (id, data) => {
    return apiClient.put(`${BASE_ENDPOINT}/${id}`, data);
  },

  updateByKey: async (key, data) => {
    return apiClient.put(`${BASE_ENDPOINT}/key/${key}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`${BASE_ENDPOINT}/${id}`);
  }
};
