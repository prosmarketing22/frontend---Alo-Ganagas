import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/customers';

export const customerService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.customer_type) queryParams.append('customer_type', params.customer_type);
    if (params.loyalty_level) queryParams.append('loyalty_level', params.loyalty_level);
    if (params.status) queryParams.append('status', params.status);
    if (params.has_debt) queryParams.append('has_debt', params.has_debt);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getList(filters = {}) {
    const params = new URLSearchParams();
    if (filters.with_credit_only) {
      params.append('with_credit_only', 'true');
    }
    const queryString = params.toString();
    return apiClient.get(BASE_ENDPOINT + '/list' + (queryString ? '?' + queryString : ''));
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

  async getReferrals(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id + '/referrals');
  },

  async getByReferralCode(code) {
    return apiClient.get(BASE_ENDPOINT + '/by-code/' + code);
  },

  async updateLoyaltyLevel(id, loyalty_level) {
    return apiClient.put(BASE_ENDPOINT + '/' + id + '/loyalty-level', { loyalty_level });
  },

  async getBirthdays(month) {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    const endpoint = BASE_ENDPOINT + '/birthdays' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  // Precios especiales del cliente
  async getSpecialPrices(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id + '/prices');
  },

  async addSpecialPrice(customerId, productId, price, specialPoints = null) {
    return apiClient.post(BASE_ENDPOINT + '/' + customerId + '/prices', {
      product_id: productId,
      price,
      special_points: specialPoints
    });
  },

  async upsertSpecialPrice(customerId, productId, price, specialPoints = null) {
    return apiClient.put(BASE_ENDPOINT + '/' + customerId + '/prices', {
      product_id: productId,
      price,
      special_points: specialPoints
    });
  },

  async updateSpecialPrice(customerId, priceId, price, specialPoints = null) {
    return apiClient.put(BASE_ENDPOINT + '/' + customerId + '/prices/' + priceId, {
      price,
      special_points: specialPoints
    });
  },

  async deleteSpecialPrice(customerId, priceId) {
    return apiClient.delete(BASE_ENDPOINT + '/' + customerId + '/prices/' + priceId);
  },

  async checkPendingLoans(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id + '/pending-loans');
  },

  async deactivate(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/deactivate');
  },

  async activate(id) {
    return apiClient.patch(BASE_ENDPOINT + '/' + id + '/activate');
  }
};
