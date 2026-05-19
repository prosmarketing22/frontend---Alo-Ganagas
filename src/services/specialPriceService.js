import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/special-prices';

export const specialPriceService = {
  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async update(id, data) {
    return apiClient.put(BASE_ENDPOINT + '/' + id, data);
  },

  async delete(id) {
    return apiClient.delete(BASE_ENDPOINT + '/' + id);
  },

  async getApplicablePrice(customerId, productId) {
    return apiClient.get(BASE_ENDPOINT + '/customer/' + customerId + '/product/' + productId);
  }
};
