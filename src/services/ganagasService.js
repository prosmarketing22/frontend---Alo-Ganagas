import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/ganagas';

/**
 * Construir URL con query params
 */
const buildUrl = (endpoint, params = {}) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `${endpoint}?${filteredParams}` : endpoint;
};

export const ganagasService = {
  /**
   * Obtener resumen general del sistema GANAGAS
   */
  async getSummary(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/summary`, params);
    return apiClient.get(url);
  },

  /**
   * Obtener estadisticas por tipo de bono
   */
  async getStatistics(params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/statistics`, params);
    return apiClient.get(url);
  },

  /**
   * Obtener movimientos recientes
   */
  async getRecentMovements(limit = 10) {
    const url = buildUrl(`${BASE_ENDPOINT}/recent`, { limit });
    return apiClient.get(url);
  },

  /**
   * Obtener clientes con cumpleaños hoy
   */
  async getBirthdayCustomers() {
    return apiClient.get(`${BASE_ENDPOINT}/birthdays`);
  },

  /**
   * Obtener historial de movimientos de un cliente
   */
  async getCustomerHistory(customerId, params = {}) {
    const url = buildUrl(`${BASE_ENDPOINT}/customer/${customerId}/history`, params);
    return apiClient.get(url);
  },

  /**
   * Obtener balance de un cliente
   */
  async getCustomerBalance(customerId) {
    return apiClient.get(`${BASE_ENDPOINT}/customer/${customerId}/balance`);
  },

  /**
   * Validar si cliente puede usar su saldo
   */
  async validateBalanceUsage(customerId, amount) {
    const url = buildUrl(`${BASE_ENDPOINT}/customer/${customerId}/validate`, { amount });
    return apiClient.get(url);
  },

  /**
   * Otorgar bono de cumpleaños
   */
  async grantBirthdayBonus(customerId) {
    return apiClient.post(`${BASE_ENDPOINT}/birthday-bonus`, { customer_id: customerId });
  },

  /**
   * Registrar ajuste manual de saldo
   */
  async registerAdjustment(data) {
    return apiClient.post(`${BASE_ENDPOINT}/adjustment`, data);
  }
};

export default ganagasService;
