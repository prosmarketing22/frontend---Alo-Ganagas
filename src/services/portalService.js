import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/portal';

const buildUrl = (endpoint, params = {}) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `${endpoint}?${filteredParams}` : endpoint;
};

export const portalService = {
  async getSummary() {
    return apiClient.get(`${BASE_ENDPOINT}/summary`);
  },

  async getAvailableProducts() {
    return apiClient.get(`${BASE_ENDPOINT}/products`);
  },

  async getPaymentMethods() {
    return apiClient.get(`${BASE_ENDPOINT}/payment-methods`);
  },

  async getMyOrders(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/my-orders`, params);
    return apiClient.get(url);
  },

  async getOrderDetail(orderId) {
    return apiClient.get(`${BASE_ENDPOINT}/my-orders/${orderId}`);
  },

  async getMyLoans() {
    return apiClient.get(`${BASE_ENDPOINT}/my-loans`);
  },

  async getMyGanagas(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/my-ganagas`, params);
    return apiClient.get(url);
  },

  async getMyReferrals() {
    return apiClient.get(`${BASE_ENDPOINT}/my-referrals`);
  },

  async getReferralCode() {
    return apiClient.get(`${BASE_ENDPOINT}/referral-code`);
  },

  async updateProfile(data) {
    return apiClient.put(`${BASE_ENDPOINT}/profile`, data);
  },

  async requestMaintenance(data) {
    return apiClient.post(`${BASE_ENDPOINT}/request-maintenance`, data);
  },

  async createOrder(data) {
    return apiClient.post(`${BASE_ENDPOINT}/orders`, data);
  },

  async getOsinergminDocuments() {
    return apiClient.get(`${BASE_ENDPOINT}/osinergmin`);
  },

  async getWaysToEarn() {
    return apiClient.get(`${BASE_ENDPOINT}/ways-to-earn`);
  },

  async getDocumentBlob(id, type = 'preview') {
    const endpoint = type === 'download'
      ? `${BASE_ENDPOINT}/osinergmin/${id}/download`
      : `${BASE_ENDPOINT}/osinergmin/${id}/preview`;
    return apiClient.getBlob(endpoint);
  },

  async getPreviewBlob(id) {
    return this.getDocumentBlob(id, 'preview');
  },

  async downloadDocument(id) {
    const { blob, fileName } = await this.getDocumentBlob(id, 'download');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default portalService;
