import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/inventory';

export const inventoryService = {
  async getMovements(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.product_id) queryParams.append('product_id', params.product_id);
    if (params.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = BASE_ENDPOINT + '/movements' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getMovementById(id) {
    return apiClient.get(BASE_ENDPOINT + '/movements/' + id);
  },

  async createEntry(data) {
    return apiClient.post(BASE_ENDPOINT + '/entry', data);
  },

  async createExit(data) {
    return apiClient.post(BASE_ENDPOINT + '/exit', data);
  },

  async createAdjustment(data) {
    return apiClient.post(BASE_ENDPOINT + '/adjustment', data);
  },

  async getMovementsByProduct(productId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = BASE_ENDPOINT + '/product/' + productId + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getSummary() {
    return apiClient.get(BASE_ENDPOINT + '/summary');
  },

  async getSupplierEmptyBalance(supplierId, productType = null) {
    let endpoint = BASE_ENDPOINT + '/supplier/' + supplierId + '/empty-balance';
    if (productType) endpoint += '?product_type=' + productType;
    return apiClient.get(endpoint);
  },

  async createTransfer(data) {
    return apiClient.post(BASE_ENDPOINT + '/transfer', data);
  },

  async getTransfers(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.product_id) queryParams.append('product_id', params.product_id);
    if (params.source_warehouse_id) queryParams.append('source_warehouse_id', params.source_warehouse_id);
    if (params.destination_warehouse_id) queryParams.append('destination_warehouse_id', params.destination_warehouse_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = BASE_ENDPOINT + '/transfers' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async previewAdjustment(data) {
    return apiClient.post(BASE_ENDPOINT + '/preview-adjustment', data);
  },

  async getStockForReconciliation(warehouseId) {
    return apiClient.get(BASE_ENDPOINT + '/reconciliation/stock/' + warehouseId);
  },

  async saveReconciliation(data) {
    return apiClient.post(BASE_ENDPOINT + '/reconciliation', data);
  },

  async getEmptyStock(warehouseId = null) {
    const endpoint = warehouseId
      ? BASE_ENDPOINT + '/empty-stock/' + warehouseId
      : BASE_ENDPOINT + '/empty-stock';
    return apiClient.get(endpoint);
  },

  async adjustEmptyStock(data) {
    return apiClient.post(BASE_ENDPOINT + '/empty-stock/adjust', data);
  },

  async getReconciliationHistory(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = BASE_ENDPOINT + '/reconciliation/history' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  }
};
