import { apiClient } from './apiClient';

const BASE_ENDPOINT = '/orders';

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

export const orderService = {
  /**
   * Obtener todos los pedidos con filtros
   */
  getAll: async (params = {}) => {
    const url = buildUrl(BASE_ENDPOINT, params);
    return await apiClient.get(url);
  },

  /**
   * Obtener pedido por ID
   */
  getById: async (id) => {
    return await apiClient.get(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Crear pedido
   */
  create: async (data) => {
    return await apiClient.post(BASE_ENDPOINT, data);
  },

  /**
   * Confirmar pedido
   */
  confirm: async (id) => {
    return await apiClient.put(`${BASE_ENDPOINT}/${id}/confirm`, {});
  },

  /**
   * Asignar repartidor
   */
  assign: async (id, delivererId) => {
    return await apiClient.put(`${BASE_ENDPOINT}/${id}/assign`, {
      deliverer_id: delivererId
    });
  },

  /**
   * Marcar en camino
   * @param {number} id - ID del pedido
   * @param {Array} warehouseAssignments - Array de { detail_id, warehouse_id } (opcional)
   */
  markInTransit: async (id, warehouseAssignments = null) => {
    const data = warehouseAssignments ? { warehouse_assignments: warehouseAssignments } : {};
    return await apiClient.put(`${BASE_ENDPOINT}/${id}/in-transit`, data);
  },

  /**
   * Entregar pedido
   */
  deliver: async (id, deliveryData) => {
    return await apiClient.put(`${BASE_ENDPOINT}/${id}/deliver`, deliveryData);
  },

  /**
   * Cancelar pedido
   */
  cancel: async (id, reason) => {
    return await apiClient.put(`${BASE_ENDPOINT}/${id}/cancel`, { reason });
  },

  /**
   * Eliminar pedido (soft delete)
   */
  delete: async (id) => {
    return await apiClient.delete(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Obtener pedidos pendientes
   */
  getPending: async () => {
    return await apiClient.get(`${BASE_ENDPOINT}/pending`);
  },

  /**
   * Obtener resumen de pedidos
   */
  getSummary: async (params = {}) => {
    const url = buildUrl(`${BASE_ENDPOINT}/summary`, params);
    return await apiClient.get(url);
  },

  /**
   * Obtener conteo de pedidos por estado
   */
  getStatusCounts: async () => {
    return await apiClient.get(`${BASE_ENDPOINT}/status-counts`);
  },

  /**
   * Obtener repartidores disponibles
   */
  getDeliverers: async () => {
    return await apiClient.get(`${BASE_ENDPOINT}/deliverers`);
  },

  /**
   * Obtener mis pedidos (para repartidor)
   */
  getMyOrders: async (status = null) => {
    const url = buildUrl(`${BASE_ENDPOINT}/my-orders`, { status });
    return await apiClient.get(url);
  },

  /**
   * Obtener pedidos de un cliente
   */
  getByCustomer: async (customerId, limit = 10) => {
    const url = buildUrl(`${BASE_ENDPOINT}/customer/${customerId}`, { limit });
    return await apiClient.get(url);
  },

  /**
   * Obtener pedidos de un repartidor
   */
  getByDeliverer: async (delivererId, status = null) => {
    const url = buildUrl(`${BASE_ENDPOINT}/deliverer/${delivererId}`, { status });
    return await apiClient.get(url);
  },

  // ===== FUNCIONES DE PRE-REGISTRO DE PAGOS/INTERCAMBIOS =====

  /**
   * Obtener pedidos disponibles para pre-registro (ASIGNADOS o EN_CAMINO)
   */
  getOrdersForPreregistration: async (params = {}) => {
    const url = buildUrl(`${BASE_ENDPOINT}/for-preregistration`, params);
    return await apiClient.get(url);
  },

  /**
   * Pre-registrar pago e intercambios de un pedido
   * @param {number} orderId - ID del pedido
   * @param {object} preregisterData - Datos del pre-registro
   * @param {object} preregisterData.payment_details - Detalles del pago
   * @param {array} preregisterData.exchange_details - Detalles de intercambios
   * @param {string} preregisterData.notes - Notas adicionales
   */
  preregisterPaymentAndExchange: async (orderId, preregisterData) => {
    return await apiClient.put(`${BASE_ENDPOINT}/${orderId}/preregister`, preregisterData);
  },

  /**
   * Limpiar/cancelar pre-registro de un pedido
   */
  clearPreregistration: async (orderId) => {
    return await apiClient.delete(`${BASE_ENDPOINT}/${orderId}/preregister`);
  },

  /**
   * Obtener mis pedidos con información de pre-registro (para repartidor)
   */
  getMyOrdersWithPreregistration: async (status = null) => {
    const url = buildUrl(`${BASE_ENDPOINT}/my-orders-preregistration`, { status });
    return await apiClient.get(url);
  }
};

export default orderService;
