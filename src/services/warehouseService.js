import { apiClient } from './apiClient';

const ENDPOINT = '/warehouses';

export const warehouseService = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiClient.get(ENDPOINT + (query ? '?' + query : ''));
  },

  getById: (id) => {
    return apiClient.get(ENDPOINT + '/' + id);
  },

  getMain: () => {
    return apiClient.get(ENDPOINT + '/main');
  },

  create: (data) => {
    return apiClient.post(ENDPOINT, data);
  },

  update: (id, data) => {
    return apiClient.put(ENDPOINT + '/' + id, data);
  },

  delete: (id) => {
    return apiClient.delete(ENDPOINT + '/' + id);
  },

  setAsMain: (id) => {
    return apiClient.put(ENDPOINT + '/' + id + '/set-main', {});
  },

  /**
   * Obtener disponibilidad de stock por almacén para una lista de productos
   * @param {Array} products - Array de { product_id, quantity }
   * @returns {Promise} - Promesa con los almacenes y su disponibilidad
   */
  getStockAvailability: (products) => {
    return apiClient.post(ENDPOINT + '/stock-availability', { products });
  },

  /**
   * Obtener almacenes con stock disponible para un producto específico
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad requerida (default 1)
   * @returns {Promise} - Promesa con los almacenes disponibles
   */
  getWarehousesForProduct: (productId, quantity = 1) => {
    return apiClient.get(ENDPOINT + '/product/' + productId + '/availability?quantity=' + quantity);
  },

  /**
   * Obtener stock de productos en un almacén específico
   * @param {number} warehouseId - ID del almacén
   * @param {Array} productIds - Array de IDs de productos (opcional)
   * @returns {Promise} - Promesa con los productos y su stock
   */
  getWarehouseProducts: (warehouseId, productIds = null) => {
    let url = ENDPOINT + '/' + warehouseId + '/products';
    if (productIds && productIds.length > 0) {
      url += '?productIds=' + productIds.join(',');
    }
    return apiClient.get(url);
  }
};
