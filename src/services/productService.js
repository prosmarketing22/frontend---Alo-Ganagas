import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/products';

export const productService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.product_type) queryParams.append('product_type', params.product_type);
    if (params.brand_id) queryParams.append('brand_id', params.brand_id);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(BASE_ENDPOINT + '/' + id);
  },

  async create(formData) {
    // Si es FormData (con imagen), enviamos directo con fetch
    if (formData instanceof FormData) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiClient.baseURL}${BASE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || data.message || 'Error al crear producto');
        error.status = response.status;
        throw error;
      }
      return data;
    }
    // Si es JSON normal
    return apiClient.post(BASE_ENDPOINT, formData);
  },

  async update(id, formData) {
    // Si es FormData (con imagen), enviamos directo con fetch
    if (formData instanceof FormData) {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiClient.baseURL}${BASE_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || data.message || 'Error al actualizar producto');
        error.status = response.status;
        throw error;
      }
      return data;
    }
    // Si es JSON normal
    return apiClient.put(BASE_ENDPOINT + '/' + id, formData);
  },

  async delete(id) {
    return apiClient.delete(BASE_ENDPOINT + '/' + id);
  },

  async getStockSummary(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.product_type) queryParams.append('product_type', params.product_type);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = BASE_ENDPOINT + '/stock-summary' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getLowStock(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = BASE_ENDPOINT + '/low-stock' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getList() {
    return apiClient.get(BASE_ENDPOINT + '/list');
  }
};
