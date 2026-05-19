import { useState, useCallback } from 'react';
import orderService from '../../services/orderService';

export const useOrderApi = () => {
  const [data, setData] = useState([]);
  const [order, setOrder] = useState(null);
  const [summary, setSummary] = useState(null);
  const [deliverers, setDeliverers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [ordersForPreregistration, setOrdersForPreregistration] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  /**
   * Obtener todos los pedidos
   */
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getAll(params);
      if (result.success) {
        setData(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener pedido por ID
   */
  const fetchOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getById(id);
      if (result.success) {
        setOrder(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear pedido
   */
  const createOrder = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.create(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirmar pedido
   */
  const confirmOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.confirm(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asignar repartidor
   */
  const assignDeliverer = useCallback(async (orderId, delivererId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.assign(orderId, delivererId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar en camino
   * @param {number} id - ID del pedido
   * @param {Array} warehouseAssignments - Array de { detail_id, warehouse_id } (opcional)
   */
  const markInTransit = useCallback(async (id, warehouseAssignments = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.markInTransit(id, warehouseAssignments);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Entregar pedido
   */
  const deliverOrder = useCallback(async (id, deliveryData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.deliver(id, deliveryData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar pedido
   */
  const cancelOrder = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.cancel(id, reason);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar pedido (soft delete)
   */
  const deleteOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.delete(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener pedidos pendientes
   */
  const fetchPendingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getPending();
      if (result.success) {
        setPendingOrders(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener resumen
   */
  const fetchSummary = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getSummary(params);
      if (result.success) {
        setSummary(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener conteo de pedidos por estado
   */
  const fetchStatusCounts = useCallback(async () => {
    try {
      const result = await orderService.getStatusCounts();
      if (result.success) {
        setSummary(result.data);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Obtener repartidores
   */
  const fetchDeliverers = useCallback(async () => {
    try {
      const result = await orderService.getDeliverers();
      if (result.success) {
        setDeliverers(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Obtener mis pedidos (para repartidor)
   */
  const fetchMyOrders = useCallback(async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getMyOrders(status);
      if (result.success) {
        setData(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FUNCIONES DE PRE-REGISTRO =====

  /**
   * Obtener pedidos disponibles para pre-registro
   */
  const fetchOrdersForPreregistration = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrdersForPreregistration(params);
      if (result.success) {
        setOrdersForPreregistration(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pre-registrar pago e intercambios de un pedido
   */
  const preregisterPaymentAndExchange = useCallback(async (orderId, preregisterData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.preregisterPaymentAndExchange(orderId, preregisterData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar pre-registro de un pedido
   */
  const clearPreregistration = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.clearPreregistration(orderId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener mis pedidos con información de pre-registro (para repartidor)
   */
  const fetchMyOrdersWithPreregistration = useCallback(async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getMyOrdersWithPreregistration(status);
      if (result.success) {
        setData(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    order,
    summary,
    deliverers,
    pendingOrders,
    ordersForPreregistration,
    loading,
    error,
    pagination,
    fetchOrders,
    fetchOrderById,
    createOrder,
    confirmOrder,
    assignDeliverer,
    markInTransit,
    deliverOrder,
    cancelOrder,
    deleteOrder,
    fetchPendingOrders,
    fetchSummary,
    fetchStatusCounts,
    fetchDeliverers,
    fetchMyOrders,
    // Funciones de pre-registro
    fetchOrdersForPreregistration,
    preregisterPaymentAndExchange,
    clearPreregistration,
    fetchMyOrdersWithPreregistration
  };
};

export default useOrderApi;
