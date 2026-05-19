import { useState, useCallback } from 'react';
import repartidorService from '../../services/repartidorService';

export const useRepartidorApi = () => {
  const [summary, setSummary] = useState(null);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getSummary();
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

  const fetchPendingLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getPendingLoans();
      if (result.success) {
        setPendingLoans(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getActiveWarehouses();
      if (result.success) {
        setWarehouses(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchLoans = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.searchLoans(searchTerm);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerLoanReturn = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.registerLoanReturn(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerLoanHistory = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getCustomerLoanHistory(customerId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMySchedules = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getMySchedules(date);
      if (result.success) {
        setMySchedules(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startService = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.startService(scheduleId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeService = useCallback(async (scheduleId, serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.completeService(scheduleId, serviceData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getAvailableSchedules();
      if (result.success) {
        setAvailableSchedules(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selfAssignSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.selfAssignSchedule(scheduleId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyDeliveries = useCallback(async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getMyDeliveries(status);
      if (result.success) {
        setMyDeliveries(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getAvailableOrders();
      if (result.success) {
        setAvailableOrders(result.data || []);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selfAssignOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.selfAssignOrder(orderId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startDelivery = useCallback(async (orderId, warehouseAssignments = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.startDelivery(orderId, warehouseAssignments);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markArrived = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.markArrived(orderId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeDelivery = useCallback(async (orderId, deliveryData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.completeDelivery(orderId, deliveryData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCylinderExchanges = useCallback(async (dateFrom = null, dateTo = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getMyCylinderExchanges(dateFrom, dateTo);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCylinderExchangeSummary = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repartidorService.getMyCylinderExchangeSummary(date);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    pendingLoans,
    warehouses,
    mySchedules,
    myDeliveries,
    availableOrders,
    availableSchedules,
    loading,
    error,
    fetchSummary,
    fetchPendingLoans,
    fetchActiveWarehouses,
    searchLoans,
    registerLoanReturn,
    getCustomerLoanHistory,
    fetchMySchedules,
    fetchAvailableSchedules,
    selfAssignSchedule,
    startService,
    completeService,
    fetchMyDeliveries,
    fetchAvailableOrders,
    selfAssignOrder,
    startDelivery,
    markArrived,
    completeDelivery,
    fetchMyCylinderExchanges,
    fetchMyCylinderExchangeSummary
  };
};

export default useRepartidorApi;
