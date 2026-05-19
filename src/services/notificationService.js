import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/notifications';

const buildUrl = (endpoint, params = {}) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `${endpoint}?${filteredParams}` : endpoint;
};

export const notificationService = {
  async getAll(params = {}) {
    const url = buildUrl(BASE_ENDPOINT, params);
    return apiClient.get(url);
  },

  async getUnreadCount() {
    return apiClient.get(`${BASE_ENDPOINT}/unread-count`);
  },

  async markAsRead(notificationId) {
    return apiClient.put(`${BASE_ENDPOINT}/${notificationId}/read`);
  },

  async markAllAsRead() {
    return apiClient.put(`${BASE_ENDPOINT}/read-all`);
  },

  async remove(notificationId) {
    return apiClient.delete(`${BASE_ENDPOINT}/${notificationId}`);
  },

  async registerPushToken({ token, platform }) {
    return apiClient.post(`${BASE_ENDPOINT}/push-token`, { token, platform });
  },

  async unregisterPushToken(token) {
    return apiClient.delete(`${BASE_ENDPOINT}/push-token/${encodeURIComponent(token)}`);
  }
};

export default notificationService;
