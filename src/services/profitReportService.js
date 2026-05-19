import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/profit-reports';

export const profitReportService = {
  /**
   * Obtener reporte de utilidad por producto
   */
  async getByProduct(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.product_id) queryParams.append('product_id', params.product_id);
    if (params.brand_id) queryParams.append('brand_id', params.brand_id);
    if (params.product_type) queryParams.append('product_type', params.product_type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = BASE_ENDPOINT + '/by-product' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  /**
   * Obtener reporte de utilidad por marca
   */
  async getByBrand(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const endpoint = BASE_ENDPOINT + '/by-brand' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  /**
   * Obtener reporte de utilidad por tipo de producto
   */
  async getByProductType(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const endpoint = BASE_ENDPOINT + '/by-type' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  /**
   * Obtener resumen general de utilidades
   */
  async getSummary(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const endpoint = BASE_ENDPOINT + '/summary' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  }
};
