import { useState, useCallback } from 'react';
import { inventoryService } from '../../services/inventoryService.js';

export const useInventoryApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchMovements = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getMovements(params);
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

  const getMovement = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getMovementById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (movementData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.createEntry(movementData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createExit = useCallback(async (movementData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.createExit(movementData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdjustment = useCallback(async (movementData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.createAdjustment(movementData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMovementsByProduct = useCallback(async (productId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getMovementsByProduct(productId, params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getSummary();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransfer = useCallback(async (transferData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.createTransfer(transferData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransfers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getTransfers(params);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewAdjustment = useCallback(async (previewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.previewAdjustment(previewData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockForReconciliation = useCallback(async (warehouseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getStockForReconciliation(warehouseId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReconciliation = useCallback(async (reconciliationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.saveReconciliation(reconciliationData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReconciliationHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getReconciliationHistory(params);
      return response;
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
    fetchMovements,
    getMovement,
    createEntry,
    createExit,
    createAdjustment,
    getMovementsByProduct,
    getSummary,
    createTransfer,
    fetchTransfers,
    previewAdjustment,
    getStockForReconciliation,
    saveReconciliation,
    fetchReconciliationHistory
  };
};
