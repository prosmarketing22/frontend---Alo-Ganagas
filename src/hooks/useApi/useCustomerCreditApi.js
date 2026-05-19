import { useState, useCallback } from 'react';
import { customerCreditService } from '../../services/customerCreditService.js';

export const useCustomerCreditApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // ============================================
  // CONSULTAS GENERALES
  // ============================================

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getAll(params);
      setData(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getSummary();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomersWithDebt = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getCustomersWithDebt(params);
      setData(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCustomer = useCallback(async (customerId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getByCustomer(customerId, params);
      setData(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCreditLimit = useCallback(async (customerId, amount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.validateCreditLimit(customerId, amount);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // OPERACIONES
  // ============================================

  const registerPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.registerPayment(paymentData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerAdjustment = useCallback(async (adjustmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.registerAdjustment(adjustmentData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // OPERACIONES DE BASE
  // ============================================

  const registerCollectionForDeliverer = useCallback(async (collectionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.registerCollectionForDeliverer(collectionData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // OPERACIONES DE REPARTIDOR
  // ============================================

  const fetchMyAssignments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getMyAssignments(params);
      setData(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignToMe = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.assignToMe(customerId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAssignment = useCallback(async (assignmentId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.completeAssignment(assignmentId, data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAssignment = useCallback(async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.cancelAssignment(assignmentId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignmentsByCustomer = useCallback(async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerCreditService.getAssignmentsByCustomer(customerId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    // Consultas
    fetchAll,
    fetchById,
    fetchSummary,
    fetchCustomersWithDebt,
    fetchByCustomer,
    validateCreditLimit,
    // Operaciones
    registerPayment,
    registerAdjustment,
    // Base
    registerCollectionForDeliverer,
    // Repartidor
    fetchMyAssignments,
    assignToMe,
    completeAssignment,
    cancelAssignment,
    fetchAssignmentsByCustomer
  };
};
