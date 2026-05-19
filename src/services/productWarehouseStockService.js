import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/product-warehouse-stock';

export const productWarehouseStockService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.product_id) queryParams.append('product_id', params.product_id);
    if (params.min_stock !== undefined) queryParams.append('min_stock', params.min_stock);
    if (params.max_stock !== undefined) queryParams.append('max_stock', params.max_stock);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getByWarehouse(warehouseId) {
    return apiClient.get(BASE_ENDPOINT + '/warehouse/' + warehouseId);
  },

  async getByProduct(productId) {
    return apiClient.get(BASE_ENDPOINT + '/product/' + productId);
  },

  async getStock(productId, warehouseId) {
    return apiClient.get(BASE_ENDPOINT + '/product/' + productId + '/warehouse/' + warehouseId);
  },

  async updateStock(productId, warehouseId, data) {
    return apiClient.put(BASE_ENDPOINT + '/product/' + productId + '/warehouse/' + warehouseId, data);
  },

  async getGlobalStock(params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');

    if (params.search) queryParams.append('search', params.search);
    if (params.product_type) queryParams.append('product_type', params.product_type);
    if (params.min_stock) queryParams.append('min_stock', params.min_stock);

    const endpoint = BASE_ENDPOINT + '?' + queryParams.toString();
    return apiClient.get(endpoint);
  }
};
